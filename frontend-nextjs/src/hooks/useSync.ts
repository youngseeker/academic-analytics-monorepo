import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useSync(
    user: any,
    courses: any[],
    studentName: string,
    gradingStandard: string,
    onCloudFetch?: (cloudCourses: any[]) => void
) {
    const [syncStatus, setSyncStatus] = useState<'Idle' | 'Syncing...' | 'Saved ☁️' | 'Sync Error'>('Idle');

    // 1. Fetch Cloud Records on Login (Multi-Device Auto Sync)
    useEffect(() => {
        if (!user || user.id === 'demo-user-id') return;

        const fetchCloudData = async () => {
            try {
                setSyncStatus('Syncing...');
                const { data, error } = await supabase
                    .from('courses')
                    .select('*, semesters(semester_number)')
                    .order('created_at', { ascending: true });

                if (!error && data && data.length > 0) {
                    const formatted = data.map(c => {
                        const semNum = c.semesters?.semester_number || 1;
                        const year = Math.ceil(semNum / 2);
                        const term = ((semNum - 1) % 2) + 1;
                        return {
                            id: c.id,
                            semester: `${year}.${term}`,
                            code: c.course_code,
                            rawScore: c.grade_point,
                            unit: c.credit_units
                        };
                    });
                    if (onCloudFetch) onCloudFetch(formatted);
                    setSyncStatus('Saved ☁️');
                } else {
                    setSyncStatus('Idle');
                }
            } catch (e) {
                console.warn("Cloud data fetch failed:", e);
                setSyncStatus('Idle');
            }
        };

        fetchCloudData();

        // 2. Realtime Postgres Subscription for Instant Multi-Device Sync
        try {
            const channel = supabase
                .channel('realtime-user-courses')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, () => {
                    fetchCloudData();
                })
                .subscribe();

            return () => { supabase.removeChannel(channel); };
        } catch (e) {
            // Ignored
        }
    }, [user]);

    // 3. Push Local Edits to Cloud Vault
    useEffect(() => {
        if (!user || courses.length === 0) return;

        const timeoutId = setTimeout(async () => {
            setSyncStatus('Syncing...');
            try {
                const payload = {
                    profile: {
                        name: studentName || (user.email ? user.email.split('@')[0] : 'Student'),
                        system: gradingStandard || '5.0_ng'
                    },
                    courses: courses.map(c => ({
                        id: c.id || Date.now(),
                        semester: c.semester,
                        code: c.code,
                        score: c.rawScore !== undefined ? c.rawScore : (c.score || 0),
                        unit: c.unit || 3
                    }))
                };

                const { error: rpcError } = await supabase.rpc('migrate_v1_payload', { payload });
                if (rpcError) throw rpcError;

                setSyncStatus('Saved ☁️');
                setTimeout(() => setSyncStatus('Idle'), 3000);

            } catch (error: any) {
                console.error("Background atomic sync error:", error);
                setSyncStatus('Sync Error');
            }
        }, 2000);

        return () => clearTimeout(timeoutId);
    }, [courses, studentName, gradingStandard, user]);

    return syncStatus;
}