import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useSync(user: any, courses: any[], studentName: string, gradingStandard: string) {
    const [syncStatus, setSyncStatus] = useState<'Idle' | 'Saving...' | 'Saved ☁️' | 'Sync Error'>('Idle');

    useEffect(() => {
        if (!user || courses.length === 0) return;

        const timeoutId = setTimeout(async () => {
            setSyncStatus('Saving...');
            try {
                // Single Atomic Payload Sync via Supabase RPC
                const payload = {
                    profile: {
                        name: studentName || user.email.split('@')[0],
                        system: gradingStandard || '5.0_ng'
                    },
                    courses: courses.map(c => ({
                        id: c.id || Date.now(),
                        semester: c.semester,
                        code: c.code,
                        score: c.score || c.currentPoints || 0,
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