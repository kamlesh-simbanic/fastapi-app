'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getClasses } from '@/app/(dashboard)/classes/actions';
import { getSubjects } from '@/app/(dashboard)/subjects/actions';
import { getHolidays } from '@/app/(dashboard)/holidays/actions';
import { getTimetable } from '@/app/(dashboard)/timetable/actions';
import { SchoolClass } from '@/app/(dashboard)/classes/types';
import { Subject } from '@/app/(dashboard)/subjects/types';
import { Holiday } from '@/app/(dashboard)/holidays/types';

interface TimetableRecord {
    id: number;
    day_of_week: string;
    period_number: number;
    subject: { id: number; name: string };
    teacher: { id: number; name: string };
}

interface GlobalDataContextType {
    classes: SchoolClass[];
    subjects: Subject[];
    holidays: Holiday[];
    timetables: Record<number, TimetableRecord[]>; // cache: classId -> records
    loading: {
        classes: boolean;
        subjects: boolean;
        holidays: boolean;
        timetables: boolean;
    };
    error: string | null;
    refreshClasses: () => Promise<void>;
    refreshSubjects: () => Promise<void>;
    refreshHolidays: () => Promise<void>;
    refreshTimetable: (classId: number, force?: boolean) => Promise<TimetableRecord[]>;
    refreshAll: () => Promise<void>;
}

const GlobalDataContext = createContext<GlobalDataContextType | undefined>(undefined);

export function GlobalDataProvider({ children }: { children: React.ReactNode }) {
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [timetables, setTimetables] = useState<Record<number, TimetableRecord[]>>({});

    const [loading, setLoading] = useState({
        classes: false,
        subjects: false,
        holidays: false,
        timetables: false
    });
    const [error, setError] = useState<string | null>(null);

    const refreshClasses = useCallback(async () => {
        setLoading(prev => ({ ...prev, classes: true }));
        try {
            const data = await getClasses({ limit: 100 }); // Fetch all
            setClasses(data.items || []);
        } catch (err) {
            console.error('Failed to fetch classes:', err);
            setError('Failed to load classes');
        } finally {
            setLoading(prev => ({ ...prev, classes: false }));
        }
    }, []);

    const refreshSubjects = useCallback(async () => {
        setLoading(prev => ({ ...prev, subjects: true }));
        try {
            const data = await getSubjects({ limit: 100 });
            setSubjects(data.items || data); // handle both paginated and list response
        } catch (err) {
            console.error('Failed to fetch subjects:', err);
            setError('Failed to load subjects');
        } finally {
            setLoading(prev => ({ ...prev, subjects: false }));
        }
    }, []);

    const refreshHolidays = useCallback(async () => {
        setLoading(prev => ({ ...prev, holidays: true }));
        try {
            const data = await getHolidays({ sort_by: 'date', order: 'asc' });
            setHolidays(data || []);
        } catch (err) {
            console.error('Failed to fetch holidays:', err);
            setError('Failed to load holidays');
        } finally {
            setLoading(prev => ({ ...prev, holidays: false }));
        }
    }, []);

    const refreshTimetable = useCallback(async (classId: number, force: boolean = false) => {
        // If not forcing and data exists in state, just return it
        if (!force && timetables[classId]) {
            return timetables[classId];
        }

        setLoading(prev => ({ ...prev, timetables: true }));
        try {
            const data = await getTimetable(classId);
            const schedule = data.schedule || [];
            setTimetables(prev => ({
                ...prev,
                [classId]: schedule
            }));
            return schedule;
        } catch (err) {
            console.error(`Failed to fetch timetable for class ${classId}:`, err);
            return timetables[classId] || []; // return cache as fallback
        } finally {
            setLoading(prev => ({ ...prev, timetables: false }));
        }
    }, [timetables]);

    const refreshAllTimetables = useCallback(async (classList: SchoolClass[]) => {
        setLoading(prev => ({ ...prev, timetables: true }));
        try {
            const timetablePromises = classList.map(cls =>
                getTimetable(cls.id)
                    .then(data => ({ classId: cls.id, schedule: data.schedule || [] }))
                    .catch(err => {
                        console.error(`Failed to fetch timetable for class ${cls.id}:`, err);
                        return { classId: cls.id, schedule: [] };
                    })
            );

            const results = await Promise.all(timetablePromises);
            const newTimetables: Record<number, TimetableRecord[]> = {};
            results.forEach(res => {
                newTimetables[res.classId] = res.schedule;
            });
            setTimetables(newTimetables);
        } finally {
            setLoading(prev => ({ ...prev, timetables: false }));
        }
    }, []);

    const refreshAll = useCallback(async () => {
        setError(null);
        setLoading(prev => ({ ...prev, classes: true, subjects: true, holidays: true }));
        try {
            const [classesData, subjectsData, holidaysData] = await Promise.all([
                getClasses({ limit: 100 }),
                getSubjects({ limit: 100 }),
                getHolidays({ sort_by: 'date', order: 'asc' })
            ]);

            const classList = classesData.items || [];
            setClasses(classList);
            setSubjects(subjectsData.items || subjectsData);
            setHolidays(holidaysData || []);

            // After getting classes, fetch all timetables
            await refreshAllTimetables(classList);
        } catch (err) {
            console.error('Failed to fetch data:', err);
            setError('Failed to load global data');
        } finally {
            setLoading(prev => ({ ...prev, classes: false, subjects: false, holidays: false }));
        }
    }, [refreshAllTimetables]);

    // Load data on mount
    useEffect(() => {
        refreshAll();
    }, [refreshAll]);

    return (
        <GlobalDataContext.Provider value={{
            classes,
            subjects,
            holidays,
            timetables,
            loading,
            error,
            refreshClasses,
            refreshSubjects,
            refreshHolidays,
            refreshTimetable,
            refreshAll
        }}>
            {children}
        </GlobalDataContext.Provider>
    );
}

export const useGlobalData = () => {
    const context = useContext(GlobalDataContext);
    if (context === undefined) {
        throw new Error('useGlobalData must be used within a GlobalDataProvider');
    }
    return context;
};
