'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { getToken, apiLogin, apiRegister, removeToken } from '@/app/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Cek apakah ada user yang tersimpan di localStorage saat aplikasi dimuat
        const savedUser = localStorage.getItem('proyeksiku_user');
        const token = getToken();

        if (token && savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                removeToken();
                setUser(null);
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const data = await apiLogin(email, password);
            setUser(data.user);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message || 'Email atau password salah!' };
        }
    };

    const register = async (name, email, password) => {
        try {
            await apiRegister(name, email, password);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message || 'Gagal membuat akun.' };
        }
    };

    const logout = async () => {
        removeToken();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be inside AuthProvider');
    return ctx;
}
