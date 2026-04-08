'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export interface User {
    id: number;
    name: string;
    email: string;
    mobile: string;
    department?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: Record<string, string>) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const loadUser = async () => {
        // Try to get token from cookie or localStorage
        let token = null;
        if (typeof document !== 'undefined') {
            const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
            if (match) token = match[2];
        }
        if (!token && typeof window !== 'undefined') {
            token = localStorage.getItem('token');
        }

        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const userData = await api.getMe();
            setUser(userData);
        } catch (error) {
            console.error('Failed to load user:', error);
            api.clearToken();
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUser();
    }, []);

    const login = async (credentials: Record<string, string>) => {
        setLoading(true);
        try {

            const response = await api.login(credentials);

            api.setToken(response.token.access_token);
            setUser(response.user);
            router.push('/');
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        api.clearToken();
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
