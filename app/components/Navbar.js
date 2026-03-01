'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { BarChart3, LogOut } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const router = useRouter();

    if (!user) return null;

    return (
        <nav className="navbar">
            <div className="navbar-brand" onClick={() => router.push('/dashboard')}>
                <div className="brand-icon">
                    <BarChart3 size={20} color="#ffffff" />
                </div>
                <span>ProyeksiKu</span>
            </div>

            <div className="navbar-actions">
                <button className="navbar-user" onClick={() => router.push('/dashboard')}>
                    <div className="user-avatar">
                        {user.name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <span className="user-name">{user.name || 'Admin'}</span>
                </button>
                <button
                    className="btn btn-icon"
                    onClick={() => { logout(); router.push('/login'); }}
                    title="Logout"
                >
                    <LogOut size={18} />
                </button>
            </div>
        </nav>
    );
}
