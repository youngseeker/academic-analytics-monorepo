-- ==========================================
-- Supabase PostgreSQL Database DDL Schema
-- ==========================================

-- 1. Create Profiles table extending the native Supabase auth.users table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
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
