export const PERMISSIONS: Record<string, string[]> = {
    '/students': ['admin', 'teaching', 'management'],
    '/classes': ['admin', 'teaching', 'management'],
    '/class-students': ['admin', 'management'],
    '/attendance': ['teaching', 'admin'],
    '/holidays': ['admin', 'teaching', 'management', 'other'],
    '/fees': ['admin', 'management'],
    '/fee-structure': ['admin', 'management'],
    '/staff': ['admin'],
    '/subjects': ['admin', 'management', 'teaching'],
    '/leave': ['admin', 'teaching', 'management', 'other'],
    '/leave/approvals': ['admin', 'management'],
};

export function hasPermission(path: string, department: string | undefined): boolean {
    if (!department) return true;
    if (department === 'admin') return true; // Admin has access to everything

    // Find the base path (e.g., /staff/edit -> /staff)
    const basePaths = Object.keys(PERMISSIONS).sort((a, b) => b.length - a.length);
    const matchingPath = basePaths.find(p => path.startsWith(p));

    if (!matchingPath) return true; // Allow access to non-restricted pages (dashboard, etc.)

    return PERMISSIONS[matchingPath].includes(department);
}
