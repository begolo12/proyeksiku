'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, setAuth, clearAuth } from '@/app/lib/storage';

const AuthContext = createContext(null);

const VALID_EMAIL = 'admin@proyeksi.com';
const VALID_PASSWORD = 'admin123';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const saved = getAuth();
        if (saved) setUser(saved);
        setLoading(false);
    }, []);

    const login = (email, password) => {
        if (email === VALID_EMAIL && password === VALID_PASSWORD) {
            const userData = { email, name: 'Admin', role: 'admin' };
            setUser(userData);
            setAuth(userData);
            return { success: true };
        }
        return { success: false, error: 'Email atau password salah!' };
    };

    const logout = () => {
        setUser(null);
        clearAuth();
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be inside AuthProvider');
    return ctx;
}
