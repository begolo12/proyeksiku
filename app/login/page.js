'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { BarChart3, Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
    const { login, user, loading } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (user) router.replace('/dashboard');
    }, [user, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        if (!email || !password) {
            setError('Email dan password harus diisi');
            setSubmitting(false);
            return;
        }

        const res = await login(email, password);
        if (res.success) {
            router.push('/dashboard');
        } else {
            setError(res.error || 'Email atau password salah');
            setSubmitting(false);
        }
    };

    if (loading) return <div className="loading-page"><div className="spinner" /></div>;

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-logo">
                    <div className="logo-icon">
                        <BarChart3 size={36} color="#ffffff" />
                    </div>
                    <h1>ProyeksiKu</h1>
                    <p>Rencana Anggaran & Proyeksi Keuangan</p>
                </div>

                {error && (
                    <div className="login-error">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <div className="form-input-icon">
                            <Mail size={18} className="icon-left" />
                            <input
                                id="email"
                                type="email"
                                className="form-input"
                                placeholder="admin@proyeksi.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                autoComplete="email"
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="form-input-icon">
                            <Lock size={18} className="icon-left" />
                            <input
                                id="password"
                                type={showPw ? 'text' : 'password'}
                                className="form-input"
                                placeholder="Masukkan password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                autoComplete="current-password"
                            />
                            <span className="icon-right" onClick={() => setShowPw(!showPw)}>
                                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                            </span>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary btn-lg btn-full"
                        disabled={submitting}
                        id="login-btn"
                    >
                        {submitting ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : <><LogIn size={18} /> Masuk</>}
                    </button>
                </form>
            </div>
        </div>
    );
}
