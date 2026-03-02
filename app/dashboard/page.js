'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import Navbar from '@/app/components/Navbar';
import { getProjects, deleteProject } from '@/app/lib/storage';
import { generateProjection } from '@/app/lib/calculations';
import { formatCurrency, formatPercent, getBusinessIcon, getBusinessLabel } from '@/app/lib/constants';
import {
    Plus, Trash2, FolderKanban, TrendingUp, DollarSign,
    BarChart3, ChevronRight, AlertTriangle, X
} from 'lucide-react';

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [projects, setProjects] = useState([]);
    const [deleteId, setDeleteId] = useState(null);
    const [projectsLoading, setProjectsLoading] = useState(true);

    const fetchProjects = async () => {
        setProjectsLoading(true);
        const data = await getProjects();
        setProjects(data);
        setProjectsLoading(false);
    };

    useEffect(() => {
        if (!loading && !user) router.replace('/login');
        else if (user) fetchProjects();
    }, [user, loading, router]);

    const handleDelete = async () => {
        if (deleteId) {
            await deleteProject(deleteId);
            await fetchProjects();
            setDeleteId(null);
        }
    };

    if (loading || !user) return <div className="loading-page"><div className="spinner" /><span>Memuat...</span></div>;

    const totalInvestment = projects.reduce((s, p) => s + (p.investment?.totalCapital || 0), 0);
    const avgROI = projects.length > 0
        ? projects.reduce((s, p) => { const pr = generateProjection(p); return s + pr.metrics.roi; }, 0) / projects.length
        : 0;
    const totalMonthlyRev = projects.reduce((s, p) => { const pr = generateProjection(p); return s + pr.monthly.revenue; }, 0);

    return (
        <>
            <Navbar />
            <main className="page">
                <div className="page-header">
                    <div>
                        <h1>Dashboard</h1>
                        <p>Selamat datang, {user.name || 'Admin'}! 👋</p>
                    </div>
                    <button className="btn btn-primary" id="new-project-btn" onClick={() => router.push('/project/new')}>
                        <Plus size={18} /> Proyek Baru
                    </button>
                </div>

                {/* Stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon blue"><FolderKanban size={22} /></div>
                        <div className="stat-value">{projects.length}</div>
                        <div className="stat-label">Total Proyek</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon green"><TrendingUp size={22} /></div>
                        <div className="stat-value">{formatPercent(avgROI)}</div>
                        <div className="stat-label">Rata-rata ROI</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon purple"><DollarSign size={22} /></div>
                        <div className="stat-value">{formatCurrency(totalInvestment)}</div>
                        <div className="stat-label">Total Investasi</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon amber"><BarChart3 size={22} /></div>
                        <div className="stat-value">{formatCurrency(totalMonthlyRev)}</div>
                        <div className="stat-label">Revenue / Bulan</div>
                    </div>
                </div>

                {/* Project list */}
                {projects.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📊</div>
                        <h3>Belum Ada Proyek</h3>
                        <p>Mulai buat rencana anggaran pertamamu dan tunjukkan ke investor!</p>
                        <button className="btn btn-primary btn-lg" onClick={() => router.push('/project/new')}>
                            <Plus size={20} /> Buat Proyek Pertama
                        </button>
                    </div>
                ) : (
                    <div className="project-list">
                        <h2 style={{ fontFamily: 'var(--md-font-brand)', fontSize: 20, fontWeight: 400, marginBottom: 8 }}>
                            Daftar Proyek
                        </h2>
                        {projects.map(p => {
                            const pr = generateProjection(p);
                            return (
                                <div key={p.id} className="project-card" onClick={() => router.push(`/project/${p.id}`)}>
                                    <div className="project-card-info">
                                        <h3>{getBusinessIcon(p.businessType)} {p.name}</h3>
                                        <div className="project-meta">
                                            <span className="badge badge-primary">{getBusinessLabel(p.businessType)}</span>
                                            {p.location && <span>📍 {p.location}</span>}
                                            <span>💰 {formatCurrency(pr.monthly.revenue)}/bln</span>
                                            <span style={{ color: pr.metrics.roi >= 0 ? 'var(--md-success)' : 'var(--md-error)' }}>
                                                📈 ROI: {formatPercent(pr.metrics.roi)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="project-card-actions">
                                        <button
                                            className="btn btn-icon"
                                            style={{ color: 'var(--md-error)' }}
                                            onClick={(e) => { e.stopPropagation(); setDeleteId(p.id); }}
                                            title="Hapus proyek"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <ChevronRight size={20} color="var(--md-on-surface-variant)" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Delete Modal */}
            {deleteId && (
                <div className="modal-overlay" onClick={() => setDeleteId(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>Hapus Proyek?</h3>
                        <p style={{ color: 'var(--md-on-surface-variant)', fontSize: 14 }}>
                            Proyek yang dihapus tidak bisa dikembalikan. Yakin ingin melanjutkan?
                        </p>
                        <div className="modal-actions">
                            <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Batal</button>
                            <button className="btn btn-danger" onClick={handleDelete}>
                                <Trash2 size={16} /> Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
