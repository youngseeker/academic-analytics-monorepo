-- ==========================================
-- Supabase PostgreSQL Database DDL Schema
-- ==========================================

-- 1. Create Profiles table extending the native Supabase auth.users table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    school TEXT,
    grading_system TEXT DEFAULT '5.0_ng',
    program_duration_years NUMERIC DEFAULT 4.0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Semesters tracking table
CREATE TABLE IF NOT EXISTS public.semesters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    semester_number INT NOT NULL,
    academic_year TEXT NOT NULL, -- Format: "2025/2026"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Courses tracking table with strict numerical grading bounds
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    semester_id UUID REFERENCES public.semesters(id) ON DELETE CASCADE NOT NULL,
    course_code TEXT NOT NULL,
    credit_units INT NOT NULL CHECK (credit_units > 0 AND credit_units <= 6),
    grade_point INT NOT NULL CHECK (grade_point >= 0 AND grade_point <= 5),
    is_carry_over BOOLEAN DEFAULT FALSE NOT NULL
);

-- 4. Enable Row-Level Security (RLS) across all operational datasets
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- 5. Instantiate Security Policies matching the authenticated session UUID
DROP POLICY IF EXISTS "Users can manage their own profile data." ON public.profiles;
CREATE POLICY "Users can manage their own profile data." 
    ON public.profiles FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can manage their own semester records." ON public.semesters;
CREATE POLICY "Users can manage their own semester records." 
    ON public.semesters FOR ALL USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can manage their own course mappings." ON public.courses;
CREATE POLICY "Users can manage their own course mappings." 
    ON public.courses FOR ALL USING (
        semester_id IN (SELECT id FROM public.semesters WHERE profile_id = auth.uid())
    );

-- 6. Trigger to automatically create a profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, updated_at)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Transactional V1 -> V2 Migration Stored Procedure
CREATE OR REPLACE FUNCTION public.migrate_v1_payload(payload JSONB)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_course RECORD;
    v_sem_id UUID;
    v_sem_num INT;
    v_inserted_courses INT := 0;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Unauthenticated request';
    END IF;

    -- 1. Upsert Profile Details
    INSERT INTO public.profiles (id, full_name, school, grading_system, program_duration_years, updated_at)
    VALUES (
        v_user_id,
        COALESCE(payload->'profile'->>'name', 'Student User'),
        payload->'profile'->>'school',
        COALESCE(payload->'profile'->>'system', '5.0_ng'),
        COALESCE((payload->'profile'->>'duration')::NUMERIC, 4.0),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        school = COALESCE(EXCLUDED.school, public.profiles.school),
        grading_system = COALESCE(EXCLUDED.grading_system, public.profiles.grading_system),
        program_duration_years = COALESCE(EXCLUDED.program_duration_years, public.profiles.program_duration_years),
        updated_at = NOW();

    -- 2. Process Courses Array
    FOR v_course IN SELECT * FROM jsonb_to_recordset(payload->'courses') AS x(
        id BIGINT,
        semester TEXT,
        code TEXT,
        score INT,
        unit INT
    )
    LOOP
        -- Parse semester string (e.g., "1.1" -> 1, "2.2" -> 4)
        v_sem_num := (split_part(v_course.semester, '.', 1)::INT - 1) * 2 + split_part(v_course.semester, '.', 2)::INT;
        IF v_sem_num IS NULL OR v_sem_num < 1 THEN
            v_sem_num := 1;
        END IF;

        -- Get or Create Semester
        SELECT id INTO v_sem_id FROM public.semesters 
        WHERE profile_id = v_user_id AND semester_number = v_sem_num;

        IF v_sem_id IS NULL THEN
            INSERT INTO public.semesters (profile_id, semester_number, academic_year)
            VALUES (v_user_id, v_sem_num, '2025/2026')
            RETURNING id INTO v_sem_id;
        END IF;

        -- Insert Course Record safely
        INSERT INTO public.courses (semester_id, course_code, credit_units, grade_point, is_carry_over)
        VALUES (
            v_sem_id,
            UPPER(TRIM(v_course.code)),
            LEAST(GREATEST(v_course.unit, 1), 6),
            LEAST(GREATEST(v_course.score, 0), 100),
            FALSE
        );
        v_inserted_courses := v_inserted_courses + 1;
    END LOOP;

    RETURN jsonb_build_object(
        'status', 'success',
        'inserted_courses', v_inserted_courses
    );
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Migration failed: %', SQLERRM;
END;
-- 8. Universal Grade System Custom Schema
CREATE TABLE IF NOT EXISTS public.grade_scales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    scale_name TEXT NOT NULL, -- "ECTS", "WAM", "US_4.0", "UK_Degree", "Custom"
    max_gpa NUMERIC NOT NULL DEFAULT 4.0,
    grade_boundaries JSONB NOT NULL, -- e.g. [{"grade":"A", "min_score":80, "points":4.0}]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.grade_scales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own grade scales." ON public.grade_scales;
CREATE POLICY "Users can manage their own grade scales."
    ON public.grade_scales FOR ALL USING (auth.uid() = profile_id);

-- 9. GDPR & FERPA Compliance: User Data Export Stored Procedure
CREATE OR REPLACE FUNCTION public.export_user_data()
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_profile JSONB;
    v_semesters JSONB;
    v_courses JSONB;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Unauthenticated request';
    END IF;

    SELECT to_jsonb(p) INTO v_profile FROM public.profiles p WHERE id = v_user_id;
    SELECT jsonb_agg(to_jsonb(s)) INTO v_semesters FROM public.semesters s WHERE profile_id = v_user_id;
    
    SELECT jsonb_agg(to_jsonb(c)) INTO v_courses 
    FROM public.courses c
    JOIN public.semesters s ON c.semester_id = s.id
    WHERE s.profile_id = v_user_id;

    RETURN jsonb_build_object(
        'export_date', NOW(),
        'user_id', v_user_id,
        'profile', COALESCE(v_profile, '{}'::jsonb),
        'semesters', COALESCE(v_semesters, '[]'::jsonb),
        'courses', COALESCE(v_courses, '[]'::jsonb)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. GDPR Right-To-Be-Forgotten: User Account Erasure Stored Procedure
CREATE OR REPLACE FUNCTION public.erase_user_account()
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Unauthenticated request';
    END IF;

    -- Cascading deletes handles semesters, courses, and profiles via Foreign Key ON DELETE CASCADE
    DELETE FROM public.profiles WHERE id = v_user_id;

    RETURN jsonb_build_object(
        'status', 'success',
        'message', 'User data permanently erased in compliance with GDPR / FERPA regulations.'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


