import { supabase } from './supabaseClient';

export interface V1Course {
    id: number;
    semester: string;
    code: string;
    score: number;
    unit: number;
}

export interface V1Profile {
    name?: string;
    school?: string;
    duration?: string;
    system?: string;
    image?: string;
}

export interface MigrationResult {
    status: 'idle' | 'migrated' | 'success' | 'error';
    insertedCount?: number;
    message?: string;
}

export const V1_MIGRATED_KEY = 'v1_migrated_at';
export const V1_BACKUP_KEY = 'myGrades_v1_backup';

export class V1MigrationSentinel {
    /**
     * Inspects browser localStorage for existing V1 data.
     */
    static hasV1Data(): boolean {
        if (typeof window === 'undefined') return false;
        const grades = localStorage.getItem('myGrades');
        return !!(grades && JSON.parse(grades)?.length > 0);
    }

    /**
     * Checks whether V1 data has already been migrated.
     */
    static isAlreadyMigrated(): boolean {
        if (typeof window === 'undefined') return false;
        return !!localStorage.getItem(V1_MIGRATED_KEY);
    }

    /**
     * Reads raw V1 data for local Guest Mode rendering.
     */
    static getLocalV1Data(): { courses: V1Course[]; profile: V1Profile } {
        if (typeof window === 'undefined') return { courses: [], profile: {} };
        
        let courses: V1Course[] = [];
        let profile: V1Profile = {};

        try {
            const rawGrades = localStorage.getItem('myGrades');
            const rawProfile = localStorage.getItem('studentProfile');
            if (rawGrades) courses = JSON.parse(rawGrades);
            if (rawProfile) profile = JSON.parse(rawProfile);
        } catch (e) {
            console.error('Failed to parse V1 local storage data', e);
        }

        return { courses, profile };
    }

    /**
     * Executes atomic RPC migration to Supabase PostgreSQL.
     */
    static async executeAtomicMigration(userId: string): Promise<MigrationResult> {
        if (!this.hasV1Data()) {
            return { status: 'idle', message: 'No V1 data detected.' };
        }

        if (this.isAlreadyMigrated()) {
            return { status: 'migrated', message: 'V1 data was previously migrated.' };
        }

        const { courses, profile } = this.getLocalV1Data();

        const payload = {
            profile: {
                name: profile.name || '',
                school: profile.school || '',
                duration: profile.duration || '4',
                system: profile.system || '5.0_ng'
            },
            courses: courses.map(c => ({
                id: c.id,
                semester: c.semester,
                code: c.code,
                score: c.score,
                unit: c.unit
            }))
        };

        try {
            const { data, error } = await supabase.rpc('migrate_v1_payload', { payload });

            if (error) {
                console.error('Atomic RPC Migration Error:', error);
                return { status: 'error', message: error.message };
            }

            // Zero Data Loss Safeguard: Archive local V1 grades instead of deleting
            localStorage.setItem(V1_BACKUP_KEY, JSON.stringify(courses));
            localStorage.setItem(V1_MIGRATED_KEY, new Date().toISOString());

            return {
                status: 'success',
                insertedCount: data?.inserted_courses || 0,
                message: `Successfully migrated ${data?.inserted_courses || 0} courses to cloud vault!`
            };
        } catch (err: any) {
            console.error('Unexpected migration failure:', err);
            return { status: 'error', message: err.message || 'Unknown network error' };
        }
    }
}
