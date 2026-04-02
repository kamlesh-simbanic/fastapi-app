export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const getAuthToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
    }
    return null;
};

const inFlightRequests = new Map<string, Promise<unknown>>();

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
    // Basic request deduplication for GET requests
    const isGet = !options.method || options.method.toUpperCase() === 'GET';
    const cacheKey = `${endpoint}:${JSON.stringify(options.headers || {})}`;

    if (isGet && inFlightRequests.has(cacheKey)) {
        return inFlightRequests.get(cacheKey);
    }

    const performRequest = async () => {
        const token = getAuthToken();
        const headers = new Headers(options.headers);

        headers.set('Content-Type', 'application/json');
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
            throw new Error(error.detail || response.statusText);
        }

        return response.json();
    };

    if (isGet) {
        const requestPromise = performRequest().finally(() => inFlightRequests.delete(cacheKey));
        inFlightRequests.set(cacheKey, requestPromise);
        return requestPromise;
    }

    return performRequest();
}

const buildQuery = (params: Record<string, unknown>) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
                value.forEach(v => query.append(key, v));
            } else {
                query.append(key, value.toString());
            }
        }
    });
    const queryString = query.toString();
    return queryString ? `?${queryString}` : '';
};

export const api = {
    getHealth: () => fetchApi('/api/health'),
    getDbStatus: () => fetchApi('/api/db-test'),
    login: (credentials: Record<string, string>) => fetchApi('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    }),
    getMe: () => fetchApi('/api/auth/me'),
    getDashboardStats: () => fetchApi('/api/dashboard/stats'),

    getStaff: (params: Record<string, unknown> = {}) => fetchApi(`/api/staff/${buildQuery(params)}`),
    addStaff: (data: Record<string, unknown>) => fetchApi('/api/staff/', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    getStaffById: (id: string | number) => fetchApi(`/api/staff/${id}`),
    updateStaff: (id: string | number, data: Record<string, unknown>) => fetchApi(`/api/staff/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    deleteStaff: (id: string | number) => fetchApi(`/api/staff/${id}`, {
        method: 'DELETE',
    }),

    getStudents: (params: Record<string, unknown> = {}) => fetchApi(`/api/students/${buildQuery(params)}`),
    getStudentById: (id: string | number) => fetchApi(`/api/students/${id}`),
    addStudent: (data: Record<string, unknown>) => fetchApi('/api/students/', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updateStudent: (id: string | number, data: Record<string, unknown>) => fetchApi(`/api/students/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),

    getPayments: (params: Record<string, unknown> = {}) => fetchApi(`/api/fees/${buildQuery(params)}`),
    addPayment: (data: Record<string, unknown>) => fetchApi('/api/fees/', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    getSuggestedFee: (grNo: string | number, year: string | number) => fetchApi(`/api/fees/suggested-amount/${grNo}/${year}`),

    // Fee Structure
    getFeeStructures: (params: Record<string, unknown> = {}) => fetchApi(`/api/fee-structure/${buildQuery(params)}`),
    addFeeStructure: (data: Record<string, unknown>) => fetchApi('/api/fee-structure/', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updateFeeStructure: (id: string | number, data: Record<string, unknown>) => fetchApi(`/api/fee-structure/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    deleteFeeStructure: (id: string | number) => fetchApi(`/api/fee-structure/${id}`, {
        method: 'DELETE',
    }),

    // Classes
    getClasses: (params: Record<string, unknown> = {}) => fetchApi(`/api/classes/${buildQuery(params)}`),
    addClass: (data: Record<string, unknown>) => fetchApi('/api/classes/', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updateClass: (id: string | number, data: Record<string, unknown>) => fetchApi(`/api/classes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    deleteClass: (id: string | number) => fetchApi(`/api/classes/${id}`, {
        method: 'DELETE',
    }),

    // Class Students
    getClassStudents: (params: Record<string, unknown> = {}) => fetchApi(`/api/class-students/${buildQuery(params)}`),
    getClassStudentById: (id: string | number) => fetchApi(`/api/class-students/${id}`),
    addClassStudent: (data: Record<string, unknown>) => fetchApi('/api/class-students/', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updateClassStudent: (id: string | number, data: Record<string, unknown>) => fetchApi(`/api/class-students/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    deleteClassStudent: (id: string | number) => fetchApi(`/api/class-students/${id}`, {
        method: 'DELETE',
    }),
    getStudentsByClass: (classId: string | number) => fetchApi(`/api/class-students/class/${classId}`),

    // Attendance
    getAttendance: (params: Record<string, unknown> = {}) => fetchApi(`/api/attendance/${buildQuery(params)}`),
    submitAttendance: (data: Record<string, unknown>) => fetchApi('/api/attendance/bulk', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    getMonthlyReport: (params: Record<string, unknown>) => fetchApi(`/api/attendance/report/monthly${buildQuery(params)}`),
    getMonthlyReportPDF: async (params: Record<string, unknown>) => {
        const response = await fetch(`${API_URL}/api/attendance/report/monthly/pdf${buildQuery(params)}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!response.ok) throw new Error('Failed to download PDF');
        return response.blob();
    },

    // Holidays
    getHolidays: (params: Record<string, unknown> = {}) => fetchApi(`/api/holidays/${buildQuery(params)}`),
    getHoliday: (id: number | string) => fetchApi(`/api/holidays/${id}`),
    addHoliday: (data: Record<string, unknown>) => fetchApi('/api/holidays/', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updateHoliday: (id: number | string, data: Record<string, unknown>) => fetchApi(`/api/holidays/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    deleteHoliday: (id: number | string) => fetchApi(`/api/holidays/${id}`, {
        method: 'DELETE',
    }),

    // Public
    getPublicStudent: (grNo: string) => fetchApi(`/api/public/student/${grNo}`),
    getPublicStudentFee: (grNo: string, year: number) => fetchApi(`/api/public/student/${grNo}/fee?year=${year}`),
    initiatePublicPayment: (data: { gr_no: string, amount: number }) => fetchApi('/api/public/pay/initiate', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    // / Subjects
    getSubjects: (params: Record<string, unknown> = {}) => fetchApi(`/api/subjects/${buildQuery(params)}`),
    addSubject: (data: Record<string, unknown>) => fetchApi('/api/subjects/', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updateSubject: (id: string | number, data: Record<string, unknown>) => fetchApi(`/api/subjects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    deleteSubject: (id: string | number) => fetchApi(`/api/subjects/${id}`, {
        method: 'DELETE',
    }),

    // Teacher Subject Assignment
    assignTeacher: (data: Record<string, unknown>) => fetchApi('/api/subjects/assign', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    getTeacherAssignments: (teacherId: string | number) => fetchApi(`/api/subjects/teacher/${teacherId}`),
    getSubjectAssignments: (subjectId: string | number) => fetchApi(`/api/subjects/${subjectId}/teachers`),
    unassignTeacher: (assignmentId: string | number) => fetchApi(`/api/subjects/assign/${assignmentId}`, {
        method: 'DELETE',
    }),

    // Leave Requests
    getLeaveRequests: (params: Record<string, unknown> = {}) => fetchApi(`/api/leave-requests/${buildQuery(params)}`),
    addLeaveRequest: (data: Record<string, unknown>) => fetchApi('/api/leave-requests/', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updateLeaveRequestStatus: (leaveId: string | number, data: { status: string }) => fetchApi(`/api/leave-requests/${leaveId}/status`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    }),
};
