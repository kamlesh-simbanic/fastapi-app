import { cn } from './utils';

export const DEPARTMENTS = [
    { label: 'All Departments', value: '' },
    { label: 'Teaching', value: 'teaching' },
    { label: 'Management', value: 'management' },
    { label: 'Admin', value: 'admin' },
    { label: 'Other', value: 'other' },
];

export const QUALIFICATIONS = [
    { label: 'B.Sc. - Bachelor of Science', value: 'B.Sc.' },
    { label: 'M.Sc. - Master of Science', value: 'M.Sc.' },
    { label: 'B.A. - Bachelor of Arts', value: 'B.A.' },
    { label: 'M.A. - Master of Arts', value: 'M.A.' },
    { label: 'B.Ed. - Bachelor of Education', value: 'B.Ed.' },
    { label: 'M.Ed. - Master of Education', value: 'M.Ed.' },
    { label: 'B.Tech - Bachelor of Technology', value: 'B.Tech' },
    { label: 'M.Tech - Master of Technology', value: 'M.Tech' },
    { label: 'MBA - Master of Business Administration', value: 'MBA' },
    { label: 'Ph.D. - Doctor of Philosophy', value: 'Ph.D.' },
];

export const getDepartmentColor = (dept: string) => {
    switch (dept?.toLowerCase()) {
        case 'teaching':
            return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
        case 'management':
            return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
        case 'admin':
            return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
        default:
            return 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20';
    }
};
