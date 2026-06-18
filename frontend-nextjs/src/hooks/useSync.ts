import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useSync(user: any, courses: any[], studentName: string, gradingStandard: string) {
    const [syncStatus, setSyncStatus] = useState<'Idle' | 'Saving...' | 'Saved ☁️' | 'Sync Error'>('Idle');

    useEffect(() => {
        if (!user || courses.length === 0) return;

        const timeoutId = setTimeout(async () => {
            setSyncStatus('Saving...');
            try {
                // 1. Save Profile
                await supabase.from('profiles').upsert({
                    id: user.id,
                    full_name: studentName || user.email.split('@')[0]
                });

                // 2. Process Courses Semester by Semester
                const uniqueSemesters = [...new Set(courses.map(c => c.semester))];

                for (const semString of uniqueSemesters) {
                    const safeSemesterNumber = parseInt(semString.toString().replace('.', '')) || 1;

                    // Get or create semester ID
                    let semId;
                    const { data: existingSem } = await supabase.from('semesters')
                        .select('id').eq('profile_id', user.id).eq('semester_number', safeSemesterNumber).single();

                    if (existingSem) {
                        semId = existingSem.id;
                    } else {
                        const { data: newSem } = await supabase.from('semesters')
                            .insert({ profile_id: user.id, semester_number: safeSemesterNumber, academic_year: new Date().getFullYear().toString() })
                            .select().single();
                        semId = newSem.id;
                    }

                    // Safely clear old cache and insert fresh state
                    const { error: deleteError } = await supabase.from('courses').delete().eq('semester_id', semId);
                    if (deleteError) throw deleteError;

                    const coursesInSem = courses.filter(c => c.semester === semString);
                    if (coursesInSem.length > 0) {
                        const coursesToInsert = coursesInSem.map(course => {
                            return {
                                semester_id: semId,
                                course_code: course.code.replace(/\s+/g, '').toUpperCase(),
                                credit_units: Math.min(Math.max(course.unit, 1), 6),
                                grade_point: course.currentPoints || 0,
                                is_carry_over: false
                            };
                        });

                        const { error: insertError } = await supabase.from('courses').insert(coursesToInsert);
                        if (insertError) throw insertError;
                    }
                }
                setSyncStatus('Saved ☁️');
                setTimeout(() => setSyncStatus('Idle'), 3000);

            } catch (error: any) {
                console.error("Background sync error:", error);
                setSyncStatus('Sync Error');
            }
        }, 2000);

        return () => clearTimeout(timeoutId);
    }, [courses, studentName, gradingStandard, user]);

    return syncStatus;
}