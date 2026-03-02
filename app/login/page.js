'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { BarChart3, Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, UserPlus, User } from 'lucide-react';

export default function LoginPage() {
    const { login, register, user, loading } = useAuth();
    const router = useRouter();

    // UI State
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [showPw, setShowPw] = useState(false);

    // Status State
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (user) router.replace('/dashboard');
    }, [user, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSubmitting(true);

        if (!email || !password || (!isLoginMode && !name)) {
            setError('Semua kolom harus diisi');
            setSubmitting(false);
            return;
        }

        if (isLoginMode) {
            const res = await login(email, password);
            if (res.success) {
                router.push('/dashboard');
            } else {
                setError(res.error || 'Email atau password salah');
                setSubmitting(false);
            }
        } else {
            const res = await register(name, email, password);
            if (res.success) {
                setSuccess('Akun berhasil dibuat! Silakan masuk.');
                setIsLoginMode(true);
                setSubmitting(false);
            } else {
                setError(res.error || 'Gagal mendaftarkan akun');
                setSubmitting(false);
            }
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

                <div className="login-tabs">
                    <button
                        className={`tab-btn ${isLoginMode ? 'active' : ''}`}
                        onClick={() => { setIsLoginMode(true); setError(''); setSuccess(''); }}
                    >
                        Masuk
                    </button>
                    <button
                        className={`tab-btn ${!isLoginMode ? 'active' : ''}`}
                        onClick={() => { setIsLoginMode(false); setError(''); setSuccess(''); }}
                    >
                        Daftar
                    </button>
                </div>

                {error && (
                    <div className="login-error">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="login-success">
                        <AlertCircle size={18} style={{ color: '#059669' }} />
                        {success}
                    </div>
                )}

                <form className="login-form" onSubmit={handleSubmit}>
                    {!isLoginMode && (
                        <div className="form-group">
                            <label htmlFor="name">Nama Lengkap</label>
                            <div className="form-input-icon">
                                <User size={18} className="icon-left" />
                                <input
                                    id="name"
                                    type="text"
                                    className="form-input"
                                    placeholder="Masukkan nama Anda"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <div className="form-input-icon">
                            <Mail size={18} className="icon-left" />
                            <input
                                id="email"
                                type="email"
                                className="form-input"
                                placeholder="email@contoh.com"
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
                        {submitting ? (
                            <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                        ) : (
                            isLoginMode ? <><LogIn size={18} /> Masuk</> : <><UserPlus size={18} /> Daftar Sekarang</>
                        )}
                    </button>
                </form>
            </div>

            <style jsx>{`
                .login-tabs {
                    display: flex;
                    margin-bottom: 1.5rem;
                    border-bottom: 1px solid #e5e7eb;
                }
                .tab-btn {
                    flex: 1;
                    padding: 0.75rem;
                    background: none;
                    border: none;
                    font-weight: 500;
                    color: #6b7280;
                    cursor: pointer;
                    transition: all 0.2s;
                    border-bottom: 2px solid transparent;
                }
                .tab-btn.active {
                    color: #2563eb;
                    border-bottom-color: #2563eb;
                }
                .login-success {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background-color: #ecfdf5;
                    color: #065f46;
                    padding: 0.75rem;
                    border-radius: 0.5rem;
                    margin-bottom: 1.5rem;
                    font-size: 0.875rem;
                    border: 1px solid #d1fae5;
                }
            `}</style>
        </div>
    );
}
