export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const getAuthToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
    }
    return null;
};

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
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
}

export const api = {
    getHealth: () => fetchApi('/api/health'),
    getDbStatus: () => fetchApi('/api/db-test'),
    login: (credentials: Record<string, string>) => fetchApi('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    }),
    getMe: () => fetchApi('/api/auth/me'),
    getDashboardStats: () => fetchApi('/api/dashboard/stats'),

    getStaff: (params: { search?: string; department?: string[]; skip?: number; limit?: number; sort_by?: string; order?: string } = {}) => {
        const query = new URLSearchParams();
        if (params.search) query.append('search', params.search);
        if (params.department && params.department.length > 0) {
            params.department.forEach(dept => query.append('department', dept));
        }
        if (params.skip !== undefined) query.append('skip', params.skip.toString());
        if (params.limit !== undefined) query.append('limit', params.limit.toString());
        if (params.sort_by) query.append('sort_by', params.sort_by);
        if (params.order) query.append('order', params.order);
        const queryString = query.toString();
        return fetchApi(`/api/staff/${queryString ? `?${queryString}` : ''}`);
    },

    addStaff: (data: Record<string, any>) => fetchApi('/api/staff/', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    getStaffById: (id: string | number) => fetchApi(`/api/staff/${id}`),

    updateStaff: (id: string | number, data: Record<string, any>) => fetchApi(`/api/staff/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),

    // Students
    getStudents: (params: Record<string, any>) => {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (Array.isArray(value)) {
                    value.forEach(v => query.append(key, v));
                } else {
                    query.append(key, value.toString());
                }
            }
        });
        return fetchApi(`/api/students/?${query.toString()}`);
    },

    getStudentById: (id: string | number) => fetchApi(`/api/students/${id}`),

    addStudent: (data: Record<string, any>) => fetchApi('/api/students/', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    updateStudent: (id: string | number, data: Record<string, any>) => fetchApi(`/api/students/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    })
};
