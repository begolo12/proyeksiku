'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { getProject } from '@/app/lib/storage';
import { generateProjection, calculateMargin, calculateAvgMargin } from '@/app/lib/calculations';
import { formatCurrency, formatPercent, getBusinessIcon, getBusinessLabel } from '@/app/lib/constants';
import { X, ChevronLeft, ChevronRight, Maximize, Minimize, Printer, ShieldCheck, AlertTriangle, Lightbulb } from 'lucide-react';
import dynamic from 'next/dynamic';

const RevenueChart = dynamic(() => import('@/app/components/charts/RevenueChart'), { ssr: false });
const ProfitChart = dynamic(() => import('@/app/components/charts/ProfitChart'), { ssr: false });
const UseOfFundsChart = dynamic(() => import('@/app/components/charts/UseOfFundsChart'), { ssr: false });

const SLIDES = [
    { id: 'cover', title: 'Cover' },
    { id: 'summary', title: 'Ringkasan' },
    { id: 'market', title: 'Pasar' },
    { id: 'competitors', title: 'Kompetitor' },
    { id: 'team', title: 'Tim' },
    { id: 'products', title: 'Produk' },
    { id: 'costs', title: 'Biaya' },
    { id: 'revenue', title: 'Revenue' },
    { id: 'pnl', title: 'P&L' },
    { id: 'cashflow', title: 'Cash Flow' },
    { id: 'scenario', title: 'Skenario' },
    { id: 'swot', title: 'SWOT' },
    { id: 'roi', title: 'ROI' },
    { id: 'cta', title: 'Investasi' },
];

export default function PresentationPage({ params }) {
    const { id } = use(params);
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [project, setProject] = useState(null);
    const [current, setCurrent] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) router.replace('/login');
    }, [user, authLoading, router]);

    useEffect(() => {
        const p = getProject(id);
        if (p) setProject(p);
        else if (!authLoading) router.replace('/dashboard');
    }, [id, authLoading, router]);

    const goNext = useCallback(() => setCurrent(c => Math.min(c + 1, SLIDES.length - 1)), []);
    const goPrev = useCallback(() => setCurrent(c => Math.max(c - 1, 0)), []);

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goNext(); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
            if (e.key === 'Escape') router.push(`/project/${id}`);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [goNext, goPrev, router, id]);

    useEffect(() => {
        let startX = 0;
        const handleStart = (e) => { startX = e.touches[0].clientX; };
        const handleEnd = (e) => {
            const diff = startX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 60) { diff > 0 ? goNext() : goPrev(); }
        };
        window.addEventListener('touchstart', handleStart);
        window.addEventListener('touchend', handleEnd);
        return () => { window.removeEventListener('touchstart', handleStart); window.removeEventListener('touchend', handleEnd); };
    }, [goNext, goPrev]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) { document.documentElement.requestFullscreen(); setIsFullscreen(true); }
        else { document.exitFullscreen(); setIsFullscreen(false); }
    };

    if (authLoading || !user || !project) {
        return <div className="loading-page"><div className="spinner" /><span>Memuat...</span></div>;
    }

    const proj = generateProjection(project);
    const pessimistic = { revenue: proj.monthly.revenue * 0.7, net: (proj.monthly.revenue * 0.7) - (proj.monthly.cogs * 0.7) - proj.monthly.opCosts };
    const optimistic = { revenue: proj.monthly.revenue * 1.3, net: (proj.monthly.revenue * 1.3) - (proj.monthly.cogs * 1.3) - proj.monthly.opCosts };

    return (
        <div className="presentation-mode">
            <div className="presentation-header">
                <button className="btn btn-ghost btn-sm" onClick={() => router.push(`/project/${id}`)}>
                    <X size={18} /> Tutup
                </button>
                <span className="slide-counter">{current + 1} / {SLIDES.length} — {SLIDES[current].title}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-icon" onClick={() => window.print()} title="Export PDF"><Printer size={16} /></button>
                    <button className="btn btn-icon" onClick={toggleFullscreen}>{isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}</button>
                </div>
            </div>

            <div className="presentation-body">
                {current > 0 && <div className="presentation-nav prev"><button className="nav-arrow" onClick={goPrev}><ChevronLeft size={24} /></button></div>}
                {current < SLIDES.length - 1 && <div className="presentation-nav next"><button className="nav-arrow" onClick={goNext}><ChevronRight size={24} /></button></div>}

                <div className="slide-wrapper" key={current} style={{ width: '100%', maxWidth: 960, margin: '0 auto' }}>

                    {/* SLIDE 1 — COVER */}
                    {current === 0 && (
                        <div className="slide slide-cover">
                            <div style={{ fontSize: '4rem', marginBottom: 16 }}>{getBusinessIcon(project.businessType)}</div>
                            <h1>{project.name}</h1>
                            <p className="tagline">{project.description || 'Peluang Investasi Menjanjikan'}</p>
                            <div className="cover-stats">
                                <div className="cover-stat">
                                    <div className="stat-value">{formatCurrency(proj.metrics.totalInvestment)}</div>
                                    <div className="stat-label">Total Modal</div>
                                </div>
                                <div className="cover-stat">
                                    <div className="stat-value">{formatPercent(proj.metrics.roi)}</div>
                                    <div className="stat-label">ROI / Tahun</div>
                                </div>
                                <div className="cover-stat">
                                    <div className="stat-value">{proj.metrics.paybackPeriod > 0 ? `${proj.metrics.paybackPeriod.toFixed(1)} bln` : '-'}</div>
                                    <div className="stat-label">Payback Period</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SLIDE 2 — RINGKASAN */}
                    {current === 1 && (
                        <div className="slide">
                            <h2>📋 Ringkasan Usaha</h2>
                            <div className="slide-content">
                                <div className="summary-row"><span className="label">Jenis Usaha</span><span className="value">{getBusinessIcon(project.businessType)} {getBusinessLabel(project.businessType)}</span></div>
                                {project.location && <div className="summary-row"><span className="label">Lokasi</span><span className="value">📍 {project.location}</span></div>}
                                <div className="summary-row"><span className="label">Jumlah Produk/Jasa</span><span className="value">{project.products?.length || 0}</span></div>
                                <div className="summary-row"><span className="label">Rata-rata Margin</span><span className="value text-success">{formatPercent(calculateAvgMargin(project.products || []))}</span></div>
                                <div className="summary-row highlight"><span className="label">Revenue Bulanan</span><span className="value">{formatCurrency(proj.monthly.revenue)}</span></div>
                                <div className="summary-row highlight"><span className="label">Laba Bersih Bulanan</span><span className="value">{formatCurrency(proj.monthly.netProfit)}</span></div>
                                {project.description && (
                                    <div style={{ marginTop: 24, padding: 20, background: 'var(--md-surface-container-low)', borderRadius: 'var(--md-shape-md)', color: 'var(--md-on-surface-variant)', lineHeight: 1.8, fontSize: 14 }}>
                                        {project.description}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* SLIDE 3 — MARKET SIZING */}
                    {current === 2 && (
                        <div className="slide">
                            <h2>📊 Market Sizing (Potensi Pasar)</h2>
                            <div className="slide-content">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                    <div style={{ background: '#e3f2fd', padding: 24, borderRadius: 'var(--md-shape-md)', border: '1px solid #bbdefb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 600, color: '#1565c0', marginBottom: 4 }}>TAM (TOTAL ADDRESSABLE MARKET)</div>
                                            <div style={{ fontSize: 13, color: '#1976d2' }}>Total keseluruhan pasar yang ada</div>
                                        </div>
                                        <div style={{ fontSize: 32, fontWeight: 700, color: '#0d47a1' }}>{formatCurrency(project.pitch?.marketSize?.tam || 0)}</div>
                                    </div>
                                    <div style={{ background: '#e8f5e9', padding: 20, borderRadius: 'var(--md-shape-md)', border: '1px solid #c8e6c9', width: '90%', alignSelf: 'center', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 600, color: '#2e7d32', marginBottom: 4 }}>SAM (SERVICEABLE AVAILABLE MARKET)</div>
                                            <div style={{ fontSize: 13, color: '#388e3c' }}>Bagian pasar yang dapat dijangkau</div>
                                        </div>
                                        <div style={{ fontSize: 28, fontWeight: 700, color: '#1b5e20' }}>{formatCurrency(project.pitch?.marketSize?.sam || 0)}</div>
                                    </div>
                                    <div style={{ background: '#fff3e0', padding: 16, borderRadius: 'var(--md-shape-md)', border: '1px solid #ffe0b2', width: '80%', alignSelf: 'center', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 600, color: '#ef6c00', marginBottom: 4 }}>SOM (SERVICEABLE OBTAINABLE MARKET)</div>
                                            <div style={{ fontSize: 13, color: '#f57c00' }}>Target realistis yang bisa kita kuasai</div>
                                        </div>
                                        <div style={{ fontSize: 24, fontWeight: 700, color: '#e65100' }}>{formatCurrency(project.pitch?.marketSize?.som || 0)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SLIDE 4 — KOMPETITOR */}
                    {current === 3 && (
                        <div className="slide">
                            <h2>⚔️ Analisis Kompetitor</h2>
                            <div className="slide-content">
                                <div className="data-table-wrapper">
                                    <table className="data-table" style={{ fontSize: '1.1rem' }}>
                                        <thead><tr><th>Kompetitor</th><th>Level Harga</th><th>Kelemahan Mereka</th><th>Keunggulan {project.name}</th></tr></thead>
                                        <tbody>
                                            {(project.pitch?.competitors || []).map(c => (
                                                <tr key={c.id}>
                                                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                                                    <td><span className="badge" style={{ background: 'var(--md-surface-container-high)', color: 'var(--md-on-surface)' }}>{c.price}</span></td>
                                                    <td style={{ color: 'var(--md-error)' }}>{c.weakness}</td>
                                                    <td style={{ color: 'var(--md-success)', fontWeight: 500 }}>Mengatasi: {c.weakness}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {(!project.pitch?.competitors || project.pitch.competitors.length === 0) && (
                                    <div style={{ textAlign: 'center', padding: 40, color: 'var(--md-on-surface-variant)' }}>Belum ada data kompetitor.</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* SLIDE 5 — TIM INTI */}
                    {current === 4 && (
                        <div className="slide">
                            <h2>🧑‍🤝‍🧑 Tim Inti (Founders)</h2>
                            <div className="slide-content">
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
                                    {(project.pitch?.team || []).map(t => (
                                        <div key={t.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 32, background: 'var(--md-surface-container-low)', borderRadius: 'var(--md-shape-lg)', border: '1px solid var(--md-outline-variant)' }}>
                                            <div style={{ width: 80, height: 80, borderRadius: 40, background: 'var(--md-primary-container)', color: 'var(--md-on-primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 32, marginBottom: 16 }}>
                                                {t.name ? t.name.charAt(0).toUpperCase() : '?'}
                                            </div>
                                            <div style={{ fontWeight: 600, fontSize: 20, color: 'var(--md-on-surface)' }}>{t.name}</div>
                                            <div style={{ fontSize: 16, color: 'var(--md-primary)', fontWeight: 500, marginTop: 4 }}>{t.role}</div>
                                            <div style={{ fontSize: 14, color: 'var(--md-on-surface-variant)', marginTop: 12, lineHeight: 1.5 }}>{t.experience}</div>
                                        </div>
                                    ))}
                                </div>
                                {(!project.pitch?.team || project.pitch.team.length === 0) && (
                                    <div style={{ textAlign: 'center', padding: 40, color: 'var(--md-on-surface-variant)' }}>Belum ada data struktur tim.</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* SLIDE 6 — PRODUK */}
                    {current === 5 && (
                        <div className="slide">
                            <h2>🛍️ Produk & Margin</h2>
                            <div className="slide-content">
                                <div className="data-table-wrapper">
                                    <table className="data-table">
                                        <thead><tr><th>Produk/Jasa</th><th>Harga Modal</th><th>Harga Jual</th><th>Margin</th></tr></thead>
                                        <tbody>
                                            {project.products?.map((p, i) => (
                                                <tr key={i}>
                                                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                                                    <td>{formatCurrency(p.costPrice)}</td>
                                                    <td>{formatCurrency(p.sellPrice)}</td>
                                                    <td className={`margin-cell ${calculateMargin(p.costPrice, p.sellPrice) > 0 ? 'positive' : 'negative'}`}>{formatPercent(calculateMargin(p.costPrice, p.sellPrice))}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="summary-box mt-md">
                                    <span className="summary-icon">📊</span>
                                    <div><div className="summary-label">Rata-rata Margin</div><div className="summary-value text-success">{formatPercent(calculateAvgMargin(project.products || []))}</div></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SLIDE 7 — BIAYA */}
                    {current === 6 && (
                        <div className="slide">
                            <h2>💰 Struktur Biaya Operasional</h2>
                            <div className="slide-content">
                                <div className="data-table-wrapper">
                                    <table className="data-table">
                                        <thead><tr><th>Item Biaya</th><th>Kategori</th><th>Jumlah / Bulan</th></tr></thead>
                                        <tbody>
                                            {project.costs?.filter(c => c.amount > 0).map((c, i) => (
                                                <tr key={i}>
                                                    <td>{c.name}</td>
                                                    <td><span className={`badge ${c.category === 'fixed' ? 'badge-primary' : 'badge-warning'}`}>{c.category === 'fixed' ? 'Tetap' : 'Variabel'}</span></td>
                                                    <td style={{ fontWeight: 500 }}>{formatCurrency(c.amount)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="summary-row highlight mt-md">
                                    <span className="label">Total Biaya Operasional / Bulan</span>
                                    <span className="value text-danger">{formatCurrency(proj.monthly.opCosts)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SLIDE 8 — REVENUE CHART */}
                    {current === 7 && (
                        <div className="slide">
                            <h2>📈 Proyeksi Revenue 12 Bulan</h2>
                            <div className="slide-content">
                                <div className="chart-container" style={{ height: 300 }}><RevenueChart data={proj.monthlyProjection} /></div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 24 }}>
                                    <div className="stat-card" style={{ padding: 16 }}><div className="stat-value" style={{ fontSize: '1.1rem' }}>{formatCurrency(proj.monthly.revenue)}</div><div className="stat-label">Revenue / Bulan</div></div>
                                    <div className="stat-card" style={{ padding: 16 }}><div className="stat-value" style={{ fontSize: '1.1rem' }}>{formatCurrency(proj.yearly.revenue)}</div><div className="stat-label">Revenue / Tahun</div></div>
                                    <div className="stat-card" style={{ padding: 16 }}><div className="stat-value text-success" style={{ fontSize: '1.1rem' }}>{formatPercent(project.investment?.growthRate || 3)}</div><div className="stat-label">Pertumbuhan / Bulan</div></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SLIDE 9 — P&L */}
                    {current === 8 && (
                        <div className="slide">
                            <h2>📊 Profit & Loss</h2>
                            <div className="slide-content">
                                <div className="chart-container" style={{ height: 260 }}><ProfitChart data={proj.monthlyProjection} /></div>
                                <div style={{ marginTop: 24 }}>
                                    <div className="summary-row"><span className="label">Pendapatan Kotor / Bulan</span><span className="value">{formatCurrency(proj.monthly.revenue)}</span></div>
                                    <div className="summary-row"><span className="label">HPP / Bulan</span><span className="value text-danger">({formatCurrency(proj.monthly.cogs)})</span></div>
                                    <div className="summary-row highlight"><span className="label">Laba Kotor</span><span className="value">{formatCurrency(proj.monthly.grossProfit)}</span></div>
                                    <div className="summary-row"><span className="label">Biaya Operasional</span><span className="value text-danger">({formatCurrency(proj.monthly.opCosts)})</span></div>
                                    <div className="summary-row highlight"><span className="label">Laba Bersih</span><span className={`value ${proj.monthly.netProfit >= 0 ? '' : 'danger'}`}>{formatCurrency(proj.monthly.netProfit)}</span></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SLIDE 10 — CASH FLOW */}
                    {current === 9 && (
                        <div className="slide">
                            <h2>💸 Proyeksi Cash Flow</h2>
                            <div className="slide-content">
                                <div className="data-table-wrapper">
                                    <table className="data-table">
                                        <thead><tr><th>Bulan</th><th>Revenue</th><th>Total Biaya</th><th>Net Cash</th><th>Kumulatif</th></tr></thead>
                                        <tbody>
                                            {proj.monthlyProjection.map((m, i) => (
                                                <tr key={i}>
                                                    <td style={{ fontWeight: 500 }}>{m.label}</td>
                                                    <td>{formatCurrency(m.revenue)}</td>
                                                    <td className="text-danger">{formatCurrency(m.cogs + m.opCosts)}</td>
                                                    <td style={{ color: m.netProfit >= 0 ? 'var(--md-success)' : 'var(--md-error)', fontWeight: 500 }}>{formatCurrency(m.netProfit)}</td>
                                                    <td style={{ fontWeight: 500, color: m.cumulativeProfit >= proj.metrics.totalInvestment ? 'var(--md-success)' : 'var(--md-on-surface-variant)' }}>{formatCurrency(m.cumulativeProfit)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SLIDE 11 — SKENARIO */}
                    {current === 10 && (
                        <div className="slide">
                            <h2>⚡ Analisis Skenario</h2>
                            <div className="slide-content">
                                <div className="scenario-grid">
                                    <div className="scenario-card pessimistic">
                                        <div className="scenario-label">😟 Pesimistis (-30%)</div>
                                        <div className="scenario-value">{formatCurrency(pessimistic.revenue)}</div>
                                        <div className="scenario-sub">Revenue / bulan</div>
                                        <div className="scenario-value mt-sm" style={{ fontSize: 18 }}>{formatCurrency(pessimistic.net)}</div>
                                        <div className="scenario-sub">Laba Bersih / bulan</div>
                                    </div>
                                    <div className="scenario-card realistic">
                                        <div className="scenario-label">📊 Realistis</div>
                                        <div className="scenario-value">{formatCurrency(proj.monthly.revenue)}</div>
                                        <div className="scenario-sub">Revenue / bulan</div>
                                        <div className="scenario-value mt-sm" style={{ fontSize: 18 }}>{formatCurrency(proj.monthly.netProfit)}</div>
                                        <div className="scenario-sub">Laba Bersih / bulan</div>
                                    </div>
                                    <div className="scenario-card optimistic">
                                        <div className="scenario-label">🚀 Optimistis (+30%)</div>
                                        <div className="scenario-value">{formatCurrency(optimistic.revenue)}</div>
                                        <div className="scenario-sub">Revenue / bulan</div>
                                        <div className="scenario-value mt-sm" style={{ fontSize: 18 }}>{formatCurrency(optimistic.net)}</div>
                                        <div className="scenario-sub">Laba Bersih / bulan</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SLIDE 12 — SWOT */}
                    {current === 11 && (
                        <div className="slide">
                            <h2>🔍 Analisis SWOT</h2>
                            <div className="slide-content">
                                <div className="swot-grid">
                                    <div className="swot-card swot-strengths">
                                        <h4><ShieldCheck size={16} /> Kekuatan</h4>
                                        <ul>
                                            <li>Margin rata-rata {formatPercent(proj.metrics.grossMargin)}</li>
                                            <li>{project.products?.length || 0} variasi produk</li>
                                            {proj.metrics.roi > 50 && <li>ROI tinggi ({formatPercent(proj.metrics.roi)})</li>}
                                        </ul>
                                    </div>
                                    <div className="swot-card swot-weaknesses">
                                        <h4><AlertTriangle size={16} /> Kelemahan</h4>
                                        <ul>
                                            <li>Ketergantungan volume harian</li>
                                            <li>Modal awal {formatCurrency(proj.metrics.totalInvestment)}</li>
                                        </ul>
                                    </div>
                                    <div className="swot-card swot-opportunities">
                                        <h4><Lightbulb size={16} /> Peluang</h4>
                                        <ul>
                                            <li>Pertumbuhan {project.investment?.growthRate || 3}%/bulan</li>
                                            <li>Ekspansi produk/cabang baru</li>
                                        </ul>
                                    </div>
                                    <div className="swot-card swot-threats">
                                        <h4><AlertTriangle size={16} /> Ancaman</h4>
                                        <ul>
                                            <li>Kompetisi lokal</li>
                                            <li>Fluktuasi harga bahan baku</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SLIDE 13 — ROI */}
                    {current === 12 && (
                        <div className="slide">
                            <h2>🎯 Return on Investment</h2>
                            <div className="slide-content">
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 24 }}>
                                    <div className="stat-card" style={{ padding: 20, textAlign: 'center' }}>
                                        <div className="stat-value text-primary" style={{ fontSize: '2rem' }}>{formatPercent(proj.metrics.roi)}</div>
                                        <div className="stat-label">ROI / Tahun</div>
                                    </div>
                                    <div className="stat-card" style={{ padding: 20, textAlign: 'center' }}>
                                        <div className="stat-value text-success" style={{ fontSize: '2rem' }}>{proj.metrics.paybackPeriod > 0 ? `${proj.metrics.paybackPeriod.toFixed(1)}` : '-'}</div>
                                        <div className="stat-label">Payback (Bulan)</div>
                                    </div>
                                    <div className="stat-card" style={{ padding: 20, textAlign: 'center' }}>
                                        <div className="stat-value" style={{ fontSize: '2rem', color: 'var(--md-tertiary)' }}>{formatPercent(proj.metrics.netMargin)}</div>
                                        <div className="stat-label">Net Margin</div>
                                    </div>
                                </div>
                                <div className="bep-bar">
                                    <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 12 }}>Break Even Point: Bulan ke-{proj.metrics.breakEvenMonth || '-'}</div>
                                    <div className="bep-bar-track" style={{ height: 12 }}><div className="bep-bar-fill" style={{ width: `${Math.min(100, (proj.metrics.breakEvenMonth / 12) * 100)}%` }} /></div>
                                    <div className="bep-labels"><span>Mulai</span><span>BEP: Bulan {proj.metrics.breakEvenMonth || '-'}</span><span>12 Bulan</span></div>
                                </div>
                                <div className="summary-row highlight mt-lg">
                                    <span className="label">Laba Bersih / Tahun</span>
                                    <span className="value text-success" style={{ fontSize: '1.3rem' }}>{formatCurrency(proj.yearly.netProfit)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SLIDE 14 — CTA & USE OF FUNDS */}
                    {current === 13 && (
                        <div className="slide">
                            <h2>🤝 Penawaran Investasi</h2>
                            <div className="slide-content" style={{ display: 'flex', gap: 40, alignItems: 'center', height: '100%' }}>
                                {/* Left Side: Use of Funds */}
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: 18, marginBottom: 16 }}>💰 Kebutuhan Modal: {formatCurrency(proj.metrics.totalInvestment)}</h3>
                                    {project.costs && project.costs.length > 0 ? (
                                        <div style={{ height: 300 }}>
                                            <UseOfFundsChart items={project.costs} total={proj.metrics.totalInvestment} />
                                        </div>
                                    ) : (
                                        <div style={{ padding: 40, textAlign: 'center', color: 'var(--md-on-surface-variant)', background: 'var(--md-surface-container-low)', borderRadius: 'var(--md-shape-md)' }}>
                                            Detail alokasi dana belum tersedia.
                                        </div>
                                    )}
                                </div>

                                {/* Right Side: Offer & Closing */}
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
                                    <div style={{ padding: 24, background: 'var(--md-primary-container)', borderRadius: 'var(--md-shape-lg)' }}>
                                        <div style={{ fontSize: 14, color: 'var(--md-on-primary-container)', marginBottom: 8, fontWeight: 600 }}>PENAWARAN KEPADA INVESTOR</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                            <div>
                                                <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--md-primary)', lineHeight: 1 }}>{project.investment?.investorShare || 0}%</div>
                                                <div style={{ fontSize: 15, color: 'var(--md-on-primary-container)' }}>Kepemilikan Saham</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--md-on-primary-container)' }}>
                                                    {formatCurrency((proj.metrics.totalInvestment * (project.investment?.investorShare || 0)) / 100)}
                                                </div>
                                                <div style={{ fontSize: 13, color: 'var(--md-on-primary-container)', opacity: 0.8 }}>Nilai Investasi</div>
                                            </div>
                                        </div>

                                        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                                <span style={{ fontSize: 14 }}>Proyeksi ROI / Tahun:</span>
                                                <strong style={{ color: 'var(--md-primary)' }}>{formatPercent(proj.metrics.roi)}</strong>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ fontSize: 14 }}>Payback Period:</span>
                                                <strong>{proj.metrics.paybackPeriod > 0 ? `${proj.metrics.paybackPeriod.toFixed(1)} bulan` : '-'}</strong>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Interactive Closing (QR placeholder) */}
                                    <div style={{ display: 'flex', gap: 16, alignItems: 'center', padding: 20, border: '1px solid var(--md-outline-variant)', borderRadius: 'var(--md-shape-md)' }}>
                                        <div style={{ width: 80, height: 80, background: '#fff', padding: 4, borderRadius: 8, border: '1px solid var(--md-outline-variant)' }}>
                                            {/* Simulate a QR Code with a grid pattern */}
                                            <div style={{ width: '100%', height: '100%', backgroundImage: 'radial-gradient(var(--md-primary) 20%, transparent 20%)', backgroundSize: '8px 8px' }} />
                                        </div>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: 16, marginBottom: 4 }}>Akses Data Room</h4>
                                            <p style={{ margin: 0, fontSize: 13, color: 'var(--md-on-surface-variant)' }}>Scan QR untuk melihat proyeksi finansial lengkap, dokumen legal, dan profil tim.</p>
                                        </div>
                                    </div>

                                    <button className="btn btn-primary btn-lg" onClick={() => window.print()} style={{ width: '100%' }}>
                                        📥 Download Proposal PDF
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="presentation-footer">
                {SLIDES.map((s, i) => <div key={i} className={`dot ${i === current ? 'active' : ''}`} onClick={() => setCurrent(i)} />)}
            </div>
        </div>
    );
}
