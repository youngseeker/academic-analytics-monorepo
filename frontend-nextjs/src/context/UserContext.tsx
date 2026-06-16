'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface SyncResult {
  success: boolean;
  message?: string;
  error?: string;
}

interface UserContextType {
  user: any;
  loading: boolean;
  hasLegacyData: boolean;
  syncStatus: 'Idle' | 'Syncing' | 'Success' | 'Error';
  syncMessage: string;
  triggerSync: (userId: string) => Promise<SyncResult>;
  checkForLegacyData: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasLegacyData, setHasLegacyData] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'Idle' | 'Syncing' | 'Success' | 'Error'>('Idle');
  const [syncMessage, setSyncMessage] = useState('');

  const checkForLegacyData = () => {
    if (typeof window === 'undefined') return;
    const legacyGpa = localStorage.getItem('legacy_gpa_data');
    const myGrades = localStorage.getItem('myGrades');
    setHasLegacyData(!!(legacyGpa || myGrades));
  };

  useEffect(() => {
    checkForLegacyData();

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Trigger check whenever user state change occurs (e.g. login/logout)
  useEffect(() => {
    checkForLegacyData();
  }, [user]);

  const triggerSync = async (userId: string): Promise<SyncResult> => {
    setSyncStatus('Syncing');
    setSyncMessage('Migrating local records to the cloud...');

    const legacyGpa = localStorage.getItem('legacy_gpa_data');
    const myGrades = localStorage.getItem('myGrades');

    if (!legacyGpa && !myGrades) {
      setSyncStatus('Idle');
      return { success: true, message: 'No local data found to migrate.' };
    }

    try {
      // 1. Process legacy_gpa_data if it exists (Module 1.2 format)
      if (legacyGpa) {
        const parsedData = JSON.parse(legacyGpa);
        if (parsedData && Array.isArray(parsedData.semesters)) {
          for (const sem of parsedData.semesters) {
            const { data: semesterRow, error: semError } = await supabase
              .from('semesters')
              .insert({
                profile_id: userId,
                semester_number: parseInt(sem.number) || 1,
                academic_year: sem.year || '2025/2026'
              })
              .select()
              .single();

            if (semError) throw semError;

            if (Array.isArray(sem.courses)) {
              const coursesToInsert = sem.courses.map((course: any) => ({
                semester_id: semesterRow.id,
                course_code: (course.code || course.course_code || 'UNKN').replace(/\s+/g, '').toUpperCase(),
                credit_units: Math.min(Math.max(parseInt(course.units || course.credit_units) || 3, 1), 6),
                grade_point: Math.min(Math.max(parseInt(course.points || course.grade_point) || 0, 0), 5),
                is_carry_over: !!(course.isCarryOver || course.is_carry_over)
              }));

              if (coursesToInsert.length > 0) {
                const { error: courseError } = await supabase
                  .from('courses')
                  .insert(coursesToInsert);

                if (courseError) throw courseError;
              }
            }
          }
        }
        localStorage.removeItem('legacy_gpa_data');
      }

      // 2. Process myGrades if it exists (frontend V1 local grades layout)
      if (myGrades) {
        const parsedGrades = JSON.parse(myGrades);
        if (Array.isArray(parsedGrades) && parsedGrades.length > 0) {
          // Extract unique semesters
          const uniqueSemesters = [...new Set(parsedGrades.map((c: any) => c.semester))];
          
          for (const semString of uniqueSemesters) {
            const semesterNumber = parseInt(semString.toString().replace('.', '')) || 1;
            
            // Upsert semester
            const { data: semesterRow, error: semError } = await supabase
              .from('semesters')
              .insert({
                profile_id: userId,
                semester_number: semesterNumber,
                academic_year: new Date().getFullYear().toString()
              })
              .select()
              .single();

            if (semError) throw semError;

            // Map and insert courses for this semester
            const coursesInSem = parsedGrades.filter((c: any) => c.semester === semString);
            const coursesToInsert = coursesInSem.map((course: any) => {
              const score = course.rawScore ?? course.score ?? 70;
              // Map standard grading (0-5 scale default)
              let points = 0;
              if (score >= 70) points = 5;
              else if (score >= 60) points = 4;
              else if (score >= 50) points = 3;
              else if (score >= 45) points = 2;
              else if (score >= 40) points = 1;

              return {
                semester_id: semesterRow.id,
                course_code: course.code.replace(/\s+/g, '').toUpperCase(),
                credit_units: Math.min(Math.max(parseInt(course.unit || course.credit_units) || 3, 1), 6),
                grade_point: points,
                is_carry_over: false
              };
            });

            if (coursesToInsert.length > 0) {
              const { error: courseError } = await supabase
                .from('courses')
                .insert(coursesToInsert);

              if (courseError) throw courseError;
            }
          }
        }
        // Don't remove 'myGrades' completely yet, as the application's page.tsx will reload it from local storage,
        // but now it is synced and subsequent changes will auto-save.
        // Wait, the spec says "clear localStorage('legacy_gpa_data')", we do that.
      }

      setSyncStatus('Success');
      setSyncMessage('Migration executed successfully. Welcome to the Cloud dashboard!');
      setHasLegacyData(false);
      
      setTimeout(() => {
        setSyncStatus('Idle');
      }, 5000);

      return { success: true, message: 'Cloud transition executed successfully.' };
    } catch (err: any) {
      console.error('Migration transaction aborted:', err);
      setSyncStatus('Error');
      setSyncMessage(err.message || 'Error occurred during cloud sync.');
      return { success: false, error: err.message };
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        hasLegacyData,
        syncStatus,
        syncMessage,
        triggerSync,
        checkForLegacyData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
