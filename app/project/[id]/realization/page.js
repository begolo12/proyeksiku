'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { apiGetProject, apiAddRealization } from '@/app/lib/api';
import { generateProjection } from '@/app/lib/calculations';
import { formatCurrency, formatPercent } from '@/app/lib/constants';
import { ArrowLeft, Save, TrendingUp, TrendingDown, DollarSign, Calendar, Info, BarChart3, AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

const RealizationChart = dynamic(() => import('@/app/components/charts/RealizationChart'), { ssr: false });

export default function RealizationPage({ params }) {
    const { id } = use(params);
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [selectedMonth, setSelectedMonth] = useState(1);
    const [revInput, setRevInput] = useState('');
    const [costInput, setCostInput] = useState('');
    const [notes, setNotes] = useState('');

    const fetchData = async () => {
        try {
            const data = await apiGetProject(id);
            if (data.realizations) {
                // Set default month to next available month
                const nextMonth = data.realizations.length + 1;
                setSelectedMonth(nextMonth <= 24 ? nextMonth : 24);
            }
            setProject(data);
        } catch (err) {
            console.error(err);
            router.push('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && !user) router.replace('/login');
        if (!authLoading && user && id) fetchData();
    }, [id, user, authLoading]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await apiAddRealization(id, {
                month: parseInt(selectedMonth),
                revenue: parseFloat(revInput) || 0,
                costs: parseFloat(costInput) || 0,
                notes: notes
            });
            setRevInput('');
            setCostInput('');
            setNotes('');
            await fetchData(); // Refresh data
            alert('Data Realisasi berhasil disimpan!');
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading || authLoading) return <div className="loading-page"><div className="spinner" /><span>Memuat Data...</span></div>;

    const proj = generateProjection(project);
    const realizations = project.realizations || [];

    // Calculate Summary
    const totalActualRev = realizations.reduce((sum, r) => sum + r.revenue, 0);
    const totalPlannedRev = proj.monthlyProjection.slice(0, realizations.length).reduce((sum, m) => sum + m.revenue, 0);
    const performance = totalPlannedRev > 0 ? (totalActualRev / totalPlannedRev) * 100 : 0;

    // Get target for selected month
    const targetMonthData = proj.monthlyProjection.find(m => m.month === parseInt(selectedMonth)) || { revenue: 0, costs: 0, netProfit: 0 };
    const targetCosts = (targetMonthData.cogs || 0) + (targetMonthData.opCosts || 0);

    return (
        <div className="container py-lg px-md" style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32, gap: 16 }}>
                <button className="btn btn-ghost" onClick={() => router.push(`/project/${id}`)} style={{ padding: '8px 12px' }}>
                    <ArrowLeft size={20} /> Kembali
                </button>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--md-on-surface)', marginBottom: 4 }}>Monitoring Realisasi & Analisis</h1>
                    <p style={{ color: 'var(--md-on-surface-variant)', fontSize: 14 }}>Transparansi performa aktual versus rencana ({project.name})</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, id: 'desktop-grid' }}>
                <style jsx>{`
                    @media (max-width: 900px) {
                        #desktop-grid { grid-template-columns: 1fr !important; }
                    }
                `}</style>

                {/* 1. INPUT FORM (LEFT COLUMN) */}
                <div className="card" style={{ background: 'var(--md-surface)', border: '1px solid var(--md-outline-variant)', borderRadius: 'var(--md-shape-lg)', overflow: 'hidden', height: 'fit-content' }}>
                    <div style={{ padding: '20px 24px', background: 'var(--md-surface-container-low)', borderBottom: '1px solid var(--md-outline-variant)' }}>
                        <h3 style={{ fontSize: 18, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Save size={18} color="var(--md-primary)" /> Input Kinerja Historis
                        </h3>
                    </div>

                    <form onSubmit={handleSave} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div className="input-group">
                            <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--md-on-surface)', marginBottom: 8, display: 'block' }}>Pilih Bulan Pelaporan</label>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--md-outline)', fontSize: 15 }}
                            >
                                {[...Array(24)].map((_, i) => (
                                    <option key={i} value={i + 1}>Bulan ke-{i + 1}</option>
                                ))}
                            </select>

                            {/* TARGET HELPER */}
                            <div style={{ marginTop: 12, padding: 12, background: 'var(--md-secondary-container)', borderRadius: '8px', border: '1px solid var(--md-outline-variant)' }}>
                                <div style={{ fontSize: 12, color: 'var(--md-on-secondary-container)', fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <AlertCircle size={14} /> Target Bulan Ini (Skenario Utama)
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                                    <span style={{ color: 'var(--md-on-surface-variant)' }}>Target Revenue:</span>
                                    <strong style={{ color: 'var(--md-on-surface)' }}>{formatCurrency(targetMonthData.revenue)}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                    <span style={{ color: 'var(--md-on-surface-variant)' }}>Batas Maksimal Biaya:</span>
                                    <strong style={{ color: 'var(--md-on-surface)' }}>{formatCurrency(targetCosts)}</strong>
                                </div>
                            </div>
                        </div>

                        <div className="input-group">
                            <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--md-on-surface)', marginBottom: 8, display: 'block' }}>Capaian Revenue Aktual (Rp)</label>
                            <input
                                type="number"
                                value={revInput}
                                onChange={(e) => setRevInput(e.target.value)}
                                placeholder="Cth: 200000000"
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--md-outline)', fontSize: 16 }}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--md-on-surface)', marginBottom: 8, display: 'block' }}>Total Biaya Aktual (Rp)</label>
                            <input
                                type="number"
                                value={costInput}
                                onChange={(e) => setCostInput(e.target.value)}
                                placeholder="Total HPP + Operasional"
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--md-outline)', fontSize: 16 }}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--md-on-surface)', marginBottom: 8, display: 'block' }}>Analisis Kualitatif (Opsional)</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Jelaskan alasan pencapaian di atas/bawah target, kendala, dll..."
                                rows={4}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--md-outline)', fontSize: 14, fontFamily: 'inherit' }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            style={{
                                width: '100%', padding: '14px', borderRadius: '8px',
                                background: 'linear-gradient(to right, var(--md-primary), #0277bd)',
                                color: 'white', border: 'none', fontWeight: 600, fontSize: 15,
                                cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                            }}
                        >
                            <Save size={18} /> {saving ? 'Memproses Data...' : 'Simpan Kinerja'}
                        </button>
                    </form>
                </div>

                {/* 2. ANALYTICS & CHARTS (RIGHT COLUMN) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                    {/* Performance KPIs */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                        <div style={{ background: 'var(--md-surface)', padding: 20, borderRadius: 'var(--md-shape-md)', border: '1px solid var(--md-outline-variant)' }}>
                            <div style={{ fontSize: 13, color: 'var(--md-on-surface-variant)', fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <TrendingUp size={16} color="var(--md-primary)" /> Akumulasi Revenue
                            </div>
                            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--md-on-surface)' }}>{formatCurrency(totalActualRev)}</div>
                            <div style={{ fontSize: 12, marginTop: 6, color: performance >= 100 ? 'var(--md-success)' : 'var(--md-error)' }}>
                                {performance >= 100 ? '▲' : '▼'} {Math.abs(100 - performance).toFixed(1)}% vs Rencana
                            </div>
                        </div>

                        <div style={{ background: 'var(--md-surface)', padding: 20, borderRadius: 'var(--md-shape-md)', border: '1px solid var(--md-outline-variant)' }}>
                            <div style={{ fontSize: 13, color: 'var(--md-on-surface-variant)', fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <BarChart3 size={16} color="var(--md-secondary)" /> Rata-rata Net Profit
                            </div>
                            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--md-on-surface)' }}>
                                {realizations.length > 0 ? formatCurrency(realizations.reduce((s, r) => s + (r.revenue - r.costs), 0) / realizations.length) : 'Rp 0'}
                            </div>
                            <div style={{ fontSize: 12, marginTop: 6, color: 'var(--md-on-surface-variant)' }}>
                                Dari {realizations.length} bulan tercatat
                            </div>
                        </div>

                        <div style={{ background: performance >= 100 ? '#e8f5e9' : '#ffebee', padding: 20, borderRadius: 'var(--md-shape-md)', border: `1px solid ${performance >= 100 ? '#a5d6a7' : '#ef9a9a'}`, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                            <div style={{ fontSize: 12, color: performance >= 100 ? '#2e7d32' : '#c62828', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Indeks Traksi</div>
                            <div style={{ fontSize: 36, fontWeight: 800, color: performance >= 100 ? '#1b5e20' : '#b71c1c', margin: '4px 0' }}>
                                {performance.toFixed(0)}%
                            </div>
                            <div style={{ fontSize: 12, color: performance >= 100 ? '#2e7d32' : '#c62828' }}>
                                {performance >= 100 ? 'Sangat Sehat' : 'Perlu Perhatian'}
                            </div>
                        </div>
                    </div>

                    {/* Chart Card */}
                    <div style={{ background: 'var(--md-surface)', padding: 24, borderRadius: 'var(--md-shape-lg)', border: '1px solid var(--md-outline-variant)' }}>
                        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Grafik Penetrasi Target</h3>
                        <div style={{ height: 320 }}>
                            <RealizationChart
                                projectionData={proj.monthlyProjection}
                                realizationData={realizations}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. VARIANCE ANALYSIS TABLE */}
            <div style={{ marginTop: 32, background: 'var(--md-surface)', borderRadius: 'var(--md-shape-lg)', border: '1px solid var(--md-outline-variant)', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', background: 'var(--md-surface-container-low)', borderBottom: '1px solid var(--md-outline-variant)' }}>
                    <h3 style={{ fontSize: 18, fontWeight: 600 }}>Tabel Analisis Variansi (Plan vs Actual)</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'var(--md-surface-container-lowest)', borderBottom: '2px solid var(--md-outline-variant)' }}>
                                <th style={{ padding: '16px 24px', fontSize: 13, color: 'var(--md-on-surface-variant)', fontWeight: 600 }}>Periode</th>
                                <th style={{ padding: '16px 24px', fontSize: 13, color: 'var(--md-on-surface-variant)', fontWeight: 600 }}>Revenue Aktual</th>
                                <th style={{ padding: '16px 24px', fontSize: 13, color: 'var(--md-on-surface-variant)', fontWeight: 600 }}>Variansi Revenue</th>
                                <th style={{ padding: '16px 24px', fontSize: 13, color: 'var(--md-on-surface-variant)', fontWeight: 600 }}>Laba Aktual</th>
                                <th style={{ padding: '16px 24px', fontSize: 13, color: 'var(--md-on-surface-variant)', fontWeight: 600 }}>Analisis Kualitatif</th>
                            </tr>
                        </thead>
                        <tbody>
                            {realizations.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ padding: 48, textAlign: 'center', color: 'var(--md-on-surface-variant)' }}>
                                        Belum ada history. Sistem siap menganalisis data pertama Anda.
                                    </td>
                                </tr>
                            ) : (
                                realizations.sort((a, b) => a.month - b.month).map((r, idx) => {
                                    const plan = proj.monthlyProjection.find(m => m.month === r.month) || { revenue: 0, netProfit: 0 };
                                    const revVar = r.revenue - plan.revenue;
                                    const actualProfit = r.revenue - r.costs;
                                    const isRevGood = revVar >= 0;

                                    return (
                                        <tr key={idx} style={{ borderBottom: '1px solid var(--md-outline-variant)' }}>
                                            <td style={{ padding: '16px 24px', fontWeight: 600 }}>Bulan ke-{r.month}</td>
                                            <td style={{ padding: '16px 24px', fontWeight: 600 }}>{formatCurrency(r.revenue)}</td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <span style={{
                                                    display: 'inline-block',
                                                    padding: '4px 8px', borderRadius: 4,
                                                    background: isRevGood ? '#e8f5e9' : '#ffebee',
                                                    color: isRevGood ? '#2e7d32' : '#c62828',
                                                    fontWeight: 600, fontSize: 13
                                                }}>
                                                    {isRevGood ? '+' : ''}{formatCurrency(revVar)}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px 24px', fontWeight: 600, color: actualProfit >= 0 ? 'var(--md-success)' : 'var(--md-error)' }}>
                                                {formatCurrency(actualProfit)}
                                            </td>
                                            <td style={{ padding: '16px 24px', fontSize: 13, color: 'var(--md-on-surface-variant)', lineHeight: 1.5, maxWidth: 300 }}>
                                                {r.notes || <span style={{ fontStyle: 'italic', opacity: 0.5 }}>Tanpa catatan</span>}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
