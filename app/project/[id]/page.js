'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import Navbar from '@/app/components/Navbar';
import { getProject } from '@/app/lib/storage';
import { generateProjection, calculateMargin } from '@/app/lib/calculations';
import { formatCurrency, formatPercent, getBusinessIcon, getBusinessLabel } from '@/app/lib/constants';
import {
    ArrowLeft, Presentation, Edit3, TrendingUp, DollarSign,
    PieChart, BarChart3, Target, Calendar, Percent, Users,
    ShieldCheck, AlertTriangle, Lightbulb, Zap, Clock,
} from 'lucide-react';
import dynamic from 'next/dynamic';

const RevenueChart = dynamic(() => import('@/app/components/charts/RevenueChart'), { ssr: false });
const ProfitChart = dynamic(() => import('@/app/components/charts/ProfitChart'), { ssr: false });
const GanttChart = dynamic(() => import('@/app/components/charts/GanttChart'), { ssr: false });

export default function ProjectDetailPage({ params }) {
    const { id } = use(params);
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [project, setProject] = useState(null);
    const [tab, setTab] = useState('bulanan');
    const [section, setSection] = useState('overview');

    useEffect(() => {
        if (!authLoading && !user) router.replace('/login');
    }, [user, authLoading, router]);

    useEffect(() => {
        const p = getProject(id);
        if (p) setProject(p);
        else if (!authLoading) router.replace('/dashboard');
    }, [id, authLoading, router]);

    if (authLoading || !user || !project) {
        return <div className="loading-page"><div className="spinner" /><span>Memuat...</span></div>;
    }

    const proj = generateProjection(project);
    const data = tab === 'harian' ? proj.daily : tab === 'bulanan' ? proj.monthly : proj.yearly;
    const periodLabel = tab === 'harian' ? '/hari' : tab === 'bulanan' ? '/bulan' : '/tahun';

    // Scenario analysis
    const pessimisticFactor = 0.7;
    const optimisticFactor = 1.3;
    const scenarios = {
        pessimistic: { revenue: proj.monthly.revenue * pessimisticFactor, netProfit: (proj.monthly.revenue * pessimisticFactor) - (proj.monthly.cogs * pessimisticFactor) - proj.monthly.opCosts },
        realistic: { revenue: proj.monthly.revenue, netProfit: proj.monthly.netProfit },
        optimistic: { revenue: proj.monthly.revenue * optimisticFactor, netProfit: (proj.monthly.revenue * optimisticFactor) - (proj.monthly.cogs * optimisticFactor) - proj.monthly.opCosts },
    };

    // Cost breakdown
    const totalMonthlyCost = proj.monthly.cogs + proj.monthly.opCosts;
    const costBreakdown = [
        { label: 'HPP (Bahan Baku)', value: proj.monthly.cogs, pct: totalMonthlyCost > 0 ? (proj.monthly.cogs / totalMonthlyCost) * 100 : 0, color: '#1a73e8' },
        ...(project.costs || []).filter(c => c.amount > 0).map((c, i) => ({
            label: c.name,
            value: c.amount,
            pct: totalMonthlyCost > 0 ? (c.amount / totalMonthlyCost) * 100 : 0,
            color: ['#2e7d32', '#f57c00', '#7c4dff', '#00897b', '#d32f2f', '#0288d1', '#c2185b', '#455a64'][i % 8],
        })),
    ];

    // Milestones
    const milestones = [
        { month: 1, title: 'Soft Opening', desc: 'Mulai operasional & testing pasar', done: true },
        { month: 2, title: 'Marketing Intensif', desc: 'Kampanye digital & promo opening', done: true },
        { month: 3, title: 'Evaluasi Produk', desc: 'Review performa & optimasi menu/layanan', done: false },
        { month: Math.ceil(proj.metrics.paybackPeriod) || 6, title: 'Break Even Point', desc: 'Modal kembali sepenuhnya', done: false },
        { month: 12, title: 'Target Tahunan', desc: `Laba kumulatif: ${formatCurrency(proj.yearly.netProfit)}`, done: false },
    ];

    const SECTIONS = [
        { key: 'overview', label: 'Overview', icon: <BarChart3 size={16} /> },
        { key: 'financial', label: 'Keuangan', icon: <DollarSign size={16} /> },
        { key: 'scenario', label: 'Skenario', icon: <Zap size={16} /> },
        { key: 'pitch', label: 'Pitch deck', icon: <Presentation size={16} /> },
        { key: 'timeline', label: 'Timeline', icon: <Clock size={16} /> },
    ];

    return (
        <>
            <Navbar />
            <main className="page projection-page">
                {/* Header */}
                <div className="page-header">
                    <div>
                        <button className="btn btn-ghost btn-sm" onClick={() => router.push('/dashboard')} style={{ marginBottom: 8 }}>
                            <ArrowLeft size={16} /> Kembali
                        </button>
                        <h1>{getBusinessIcon(project.businessType)} {project.name}</h1>
                        <p style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginTop: 4 }}>
                            <span className="badge badge-primary">{getBusinessLabel(project.businessType)}</span>
                            {project.location && <span style={{ color: 'var(--md-on-surface-variant)' }}>📍 {project.location}</span>}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-outlined" onClick={() => router.push(`/project/${id}/edit`)}>
                            <Edit3 size={16} /> Edit
                        </button>
                        <button className="btn btn-primary" onClick={() => router.push(`/project/${id}/present`)} id="present-btn">
                            <Presentation size={16} /> Presentasi
                        </button>
                    </div>
                </div>

                {/* Section navigation */}
                <div className="segmented-btn-group mb-lg">
                    {SECTIONS.map(s => (
                        <button key={s.key} className={`segmented-btn ${section === s.key ? 'active' : ''}`} onClick={() => setSection(s.key)}>
                            {s.icon} {s.label}
                        </button>
                    ))}
                </div>

                {/* ═══════ OVERVIEW SECTION ═══════ */}
                {section === 'overview' && (
                    <>
                        {/* Period Tabs */}
                        <div className="tab-bar">
                            {['harian', 'bulanan', 'tahunan'].map(t => (
                                <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Stats */}
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon blue"><DollarSign size={22} /></div>
                                <div className="stat-value">{formatCurrency(data.revenue)}</div>
                                <div className="stat-label">Revenue {periodLabel}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon amber"><BarChart3 size={22} /></div>
                                <div className="stat-value">{formatCurrency(data.grossProfit)}</div>
                                <div className="stat-label">Laba Kotor {periodLabel}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon green"><TrendingUp size={22} /></div>
                                <div className="stat-value">{formatCurrency(data.netProfit)}</div>
                                <div className="stat-label">Laba Bersih {periodLabel}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon purple"><Percent size={22} /></div>
                                <div className="stat-value">{formatPercent(proj.metrics.roi)}</div>
                                <div className="stat-label">ROI / Tahun</div>
                            </div>
                        </div>

                        {/* Charts */}
                        <div className="two-col">
                            <div className="projection-card">
                                <h3>📈 Proyeksi Revenue 12 Bulan</h3>
                                <div className="chart-container">
                                    <RevenueChart data={proj.monthlyProjection} />
                                </div>
                            </div>
                            <div className="projection-card">
                                <h3>📊 Profit & Loss</h3>
                                <div className="chart-container">
                                    <ProfitChart data={proj.monthlyProjection} />
                                </div>
                            </div>
                        </div>

                        {/* ROI & BEP */}
                        <div className="projection-card mt-md">
                            <h3>🎯 ROI & Break Even Analysis</h3>
                            <div className="two-col">
                                <div>
                                    <div className="summary-row">
                                        <span className="label">Total Investasi</span>
                                        <span className="value">{formatCurrency(proj.metrics.totalInvestment)}</span>
                                    </div>
                                    <div className="summary-row">
                                        <span className="label">Margin Kotor</span>
                                        <span className="value">{formatPercent(proj.metrics.grossMargin)}</span>
                                    </div>
                                    <div className="summary-row">
                                        <span className="label">Margin Bersih</span>
                                        <span className="value">{formatPercent(proj.metrics.netMargin)}</span>
                                    </div>
                                    <div className="summary-row highlight">
                                        <span className="label">ROI (Return on Investment)</span>
                                        <span className={`value ${proj.metrics.roi >= 0 ? '' : 'danger'}`}>{formatPercent(proj.metrics.roi)}</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="summary-row highlight">
                                        <span className="label">Payback Period</span>
                                        <span className="value">{proj.metrics.paybackPeriod > 0 ? `${proj.metrics.paybackPeriod.toFixed(1)} bulan` : '-'}</span>
                                    </div>
                                    <div className="bep-bar mt-md">
                                        <div style={{ fontSize: 14, color: 'var(--md-on-surface-variant)', marginBottom: 8 }}>
                                            Break Even Point: <strong style={{ color: 'var(--md-primary)' }}>Bulan ke-{proj.metrics.breakEvenMonth || '-'}</strong>
                                        </div>
                                        <div className="bep-bar-track">
                                            <div className="bep-bar-fill" style={{ width: `${Math.min(100, (proj.metrics.breakEvenMonth / 12) * 100)}%` }} />
                                        </div>
                                        <div className="bep-labels">
                                            <span>Bulan 1</span>
                                            <span>Bulan 12</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* ═══════ FINANCIAL DETAIL ═══════ */}
                {section === 'financial' && (
                    <>
                        {/* P&L */}
                        <div className="projection-card">
                            <h3>📋 Laporan Laba Rugi (Bulanan)</h3>
                            <div className="summary-row">
                                <span className="label">Pendapatan Kotor</span>
                                <span className="value">{formatCurrency(proj.monthly.revenue)}</span>
                            </div>
                            <div className="summary-row">
                                <span className="label">Harga Pokok Penjualan (HPP)</span>
                                <span className="value" style={{ color: 'var(--md-error)' }}>({formatCurrency(proj.monthly.cogs)})</span>
                            </div>
                            <div className="summary-row highlight">
                                <span className="label">Laba Kotor</span>
                                <span className="value">{formatCurrency(proj.monthly.grossProfit)}</span>
                            </div>
                            <div className="summary-row">
                                <span className="label">Biaya Operasional</span>
                                <span className="value" style={{ color: 'var(--md-error)' }}>({formatCurrency(proj.monthly.opCosts)})</span>
                            </div>
                            <div className="summary-row highlight">
                                <span className="label">Laba Bersih</span>
                                <span className={`value ${proj.monthly.netProfit >= 0 ? '' : 'danger'}`}>{formatCurrency(proj.monthly.netProfit)}</span>
                            </div>
                        </div>

                        {/* Cost Breakdown */}
                        <div className="projection-card mt-md">
                            <h3>💰 Breakdown Biaya</h3>
                            {costBreakdown.map((c, i) => (
                                <div key={i} style={{ marginBottom: 12 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                                        <span style={{ color: 'var(--md-on-surface-variant)' }}>{c.label}</span>
                                        <span style={{ fontWeight: 500 }}>{formatCurrency(c.value)} ({c.pct.toFixed(1)}%)</span>
                                    </div>
                                    <div style={{ width: '100%', height: 6, background: 'var(--md-surface-container-high)', borderRadius: 'var(--md-shape-full)', overflow: 'hidden' }}>
                                        <div style={{ width: `${c.pct}%`, height: '100%', background: c.color, borderRadius: 'var(--md-shape-full)', transition: 'width 0.5s ease' }} />
                                    </div>
                                </div>
                            ))}
                            <div className="summary-row highlight mt-md">
                                <span className="label">Total Biaya / Bulan</span>
                                <span className="value" style={{ color: 'var(--md-error)' }}>{formatCurrency(totalMonthlyCost)}</span>
                            </div>
                        </div>

                        {/* Products Table */}
                        <div className="projection-card mt-md">
                            <h3>🛍️ Detail Produk & Margin</h3>
                            <div className="data-table-wrapper">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Produk</th>
                                            <th>Modal</th>
                                            <th>Jual</th>
                                            <th>Margin</th>
                                            <th>Qty/hari</th>
                                            <th>Revenue/hari</th>
                                            <th>Profit/hari</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {project.products?.map((p, i) => {
                                            const margin = calculateMargin(p.costPrice, p.sellPrice);
                                            const dailyRev = p.sellPrice * (p.dailyQty || 0);
                                            const dailyProfit = (p.sellPrice - p.costPrice) * (p.dailyQty || 0);
                                            return (
                                                <tr key={i}>
                                                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                                                    <td>{formatCurrency(p.costPrice)}</td>
                                                    <td>{formatCurrency(p.sellPrice)}</td>
                                                    <td className={`margin-cell ${margin > 0 ? 'positive' : 'negative'}`}>{formatPercent(margin)}</td>
                                                    <td>{p.dailyQty || 0}</td>
                                                    <td>{formatCurrency(dailyRev)}</td>
                                                    <td style={{ color: 'var(--md-success)', fontWeight: 500 }}>{formatCurrency(dailyProfit)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Cash Flow Table */}
                        <div className="projection-card mt-md">
                            <h3>💸 Proyeksi Cash Flow 12 Bulan</h3>
                            <div className="data-table-wrapper">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Bulan</th>
                                            <th>Revenue</th>
                                            <th>Total Biaya</th>
                                            <th>Net Cash</th>
                                            <th>Kumulatif</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {proj.monthlyProjection.map((m, i) => (
                                            <tr key={i}>
                                                <td style={{ fontWeight: 500 }}>{m.label}</td>
                                                <td>{formatCurrency(m.revenue)}</td>
                                                <td style={{ color: 'var(--md-error)' }}>{formatCurrency(m.cogs + m.opCosts)}</td>
                                                <td style={{ color: m.netProfit >= 0 ? 'var(--md-success)' : 'var(--md-error)', fontWeight: 500 }}>
                                                    {formatCurrency(m.netProfit)}
                                                </td>
                                                <td style={{ color: m.cumulativeProfit >= proj.metrics.totalInvestment ? 'var(--md-success)' : 'var(--md-on-surface-variant)', fontWeight: 500 }}>
                                                    {formatCurrency(m.cumulativeProfit)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* ═══════ SCENARIO ANALYSIS ═══════ */}
                {section === 'scenario' && (
                    <>
                        <div className="projection-card">
                            <h3>⚡ Analisis Skenario (Bulanan)</h3>
                            <p style={{ color: 'var(--md-on-surface-variant)', fontSize: 14, marginBottom: 16 }}>
                                Perbandingan 3 skenario berdasarkan variasi volume penjualan (±30%)
                            </p>
                            <div className="scenario-grid">
                                <div className="scenario-card pessimistic">
                                    <div className="scenario-label">😟 Pesimistis (-30%)</div>
                                    <div className="scenario-value">{formatCurrency(scenarios.pessimistic.revenue)}</div>
                                    <div className="scenario-sub">Revenue / bulan</div>
                                    <div className="scenario-value mt-sm" style={{ fontSize: 18 }}>{formatCurrency(scenarios.pessimistic.netProfit)}</div>
                                    <div className="scenario-sub">Laba Bersih / bulan</div>
                                </div>
                                <div className="scenario-card realistic">
                                    <div className="scenario-label">📊 Realistis</div>
                                    <div className="scenario-value">{formatCurrency(scenarios.realistic.revenue)}</div>
                                    <div className="scenario-sub">Revenue / bulan</div>
                                    <div className="scenario-value mt-sm" style={{ fontSize: 18 }}>{formatCurrency(scenarios.realistic.netProfit)}</div>
                                    <div className="scenario-sub">Laba Bersih / bulan</div>
                                </div>
                                <div className="scenario-card optimistic">
                                    <div className="scenario-label">🚀 Optimistis (+30%)</div>
                                    <div className="scenario-value">{formatCurrency(scenarios.optimistic.revenue)}</div>
                                    <div className="scenario-sub">Revenue / bulan</div>
                                    <div className="scenario-value mt-sm" style={{ fontSize: 18 }}>{formatCurrency(scenarios.optimistic.netProfit)}</div>
                                    <div className="scenario-sub">Laba Bersih / bulan</div>
                                </div>
                            </div>
                        </div>

                        {/* Sensitivity */}
                        <div className="projection-card mt-md">
                            <h3>📐 Analisis Sensitivitas</h3>
                            <div className="data-table-wrapper">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Perubahan Volume</th>
                                            <th>Revenue/Bulan</th>
                                            <th>Laba Bersih/Bulan</th>
                                            <th>ROI / Tahun</th>
                                            <th>Payback</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[-30, -20, -10, 0, 10, 20, 30].map(pct => {
                                            const factor = 1 + pct / 100;
                                            const rev = proj.monthly.revenue * factor;
                                            const cogs = proj.monthly.cogs * factor;
                                            const net = rev - cogs - proj.monthly.opCosts;
                                            const roi = proj.metrics.totalInvestment > 0 ? ((net * 12) / proj.metrics.totalInvestment) * 100 : 0;
                                            const payback = net > 0 ? proj.metrics.totalInvestment / net : 0;
                                            return (
                                                <tr key={pct} style={pct === 0 ? { background: 'var(--md-primary-container)' } : {}}>
                                                    <td style={{ fontWeight: 500 }}>{pct > 0 ? '+' : ''}{pct}%</td>
                                                    <td>{formatCurrency(rev)}</td>
                                                    <td style={{ color: net >= 0 ? 'var(--md-success)' : 'var(--md-error)', fontWeight: 500 }}>{formatCurrency(net)}</td>
                                                    <td>{formatPercent(roi)}</td>
                                                    <td>{payback > 0 ? `${payback.toFixed(1)} bln` : '-'}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* SWOT */}
                        <div className="projection-card mt-md">
                            <h3>🔍 Analisis SWOT</h3>
                            <div className="swot-grid">
                                <div className="swot-card swot-strengths">
                                    <h4><ShieldCheck size={18} /> Kekuatan</h4>
                                    <ul>
                                        <li>Margin rata-rata {formatPercent(proj.metrics.grossMargin)}</li>
                                        <li>{project.products?.length || 0} variasi produk/layanan</li>
                                        {proj.metrics.roi > 50 && <li>ROI tinggi ({formatPercent(proj.metrics.roi)})</li>}
                                        {proj.metrics.paybackPeriod < 12 && <li>Payback period singkat</li>}
                                    </ul>
                                </div>
                                <div className="swot-card swot-weaknesses">
                                    <h4><AlertTriangle size={18} /> Kelemahan</h4>
                                    <ul>
                                        <li>Ketergantungan pada volume penjualan harian</li>
                                        {proj.monthly.opCosts > proj.monthly.grossProfit * 0.5 && <li>Biaya operasional cukup tinggi</li>}
                                        <li>Modal awal {formatCurrency(proj.metrics.totalInvestment)}</li>
                                    </ul>
                                </div>
                                <div className="swot-card swot-opportunities">
                                    <h4><Lightbulb size={18} /> Peluang</h4>
                                    <ul>
                                        <li>Pertumbuhan {project.investment?.growthRate || 3}% per bulan</li>
                                        <li>Ekspansi produk/layanan baru</li>
                                        <li>Potensi cabang baru jika terbukti profitable</li>
                                    </ul>
                                </div>
                                <div className="swot-card swot-threats">
                                    <h4><AlertTriangle size={18} /> Ancaman</h4>
                                    <ul>
                                        <li>Kompetisi di area {project.location || 'sekitar'}</li>
                                        <li>Fluktuasi harga bahan baku</li>
                                        <li>Perubahan perilaku konsumen</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* ═══════ PITCH DECK ═══════ */}
                {section === 'pitch' && (
                    <>
                        <div className="projection-card" style={{ background: 'linear-gradient(135deg, var(--md-primary-container), var(--md-surface))' }}>
                            <div style={{ padding: '24px 0', textAlign: 'center' }}>
                                <h2 style={{ fontSize: 24, marginBottom: 8, color: 'var(--md-on-surface)' }}>{project.name}</h2>
                                <p style={{ fontSize: 18, color: 'var(--md-primary)', fontWeight: 500, maxWidth: 600, margin: '0 auto', lineHeight: 1.5 }}>
                                    "{project.pitch?.valueProposition || 'Solusi inovatif untuk masalah di pasar saat ini.'}"
                                </p>
                            </div>
                        </div>

                        <div className="two-col mt-md">
                            {/* Market Sizing */}
                            <div className="projection-card">
                                <h3>📊 Market Sizing (Potensi Pasar)</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
                                    <div style={{ background: '#e3f2fd', padding: 16, borderRadius: 'var(--md-shape-md)', border: '1px solid #bbdefb' }}>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: '#1565c0' }}>TAM (TOTAL ADDRESSABLE MARKET)</div>
                                        <div style={{ fontSize: 24, fontWeight: 700, color: '#0d47a1' }}>{formatCurrency(project.pitch?.marketSize?.tam || 0)}</div>
                                        <div style={{ fontSize: 12, color: '#1976d2', marginTop: 4 }}>Total keseluruhan pasar yang ada</div>
                                    </div>
                                    <div style={{ background: '#e8f5e9', padding: 16, borderRadius: 'var(--md-shape-md)', border: '1px solid #c8e6c9', width: '85%', alignSelf: 'center' }}>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: '#2e7d32' }}>SAM (SERVICEABLE AVAILABLE MARKET)</div>
                                        <div style={{ fontSize: 22, fontWeight: 700, color: '#1b5e20' }}>{formatCurrency(project.pitch?.marketSize?.sam || 0)}</div>
                                        <div style={{ fontSize: 12, color: '#388e3c', marginTop: 4 }}>Bagian pasar yang dapat dijangkau bisnis</div>
                                    </div>
                                    <div style={{ background: '#fff3e0', padding: 16, borderRadius: 'var(--md-shape-md)', border: '1px solid #ffe0b2', width: '70%', alignSelf: 'center' }}>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: '#ef6c00' }}>SOM (SERVICEABLE OBTAINABLE MARKET)</div>
                                        <div style={{ fontSize: 20, fontWeight: 700, color: '#e65100' }}>{formatCurrency(project.pitch?.marketSize?.som || 0)}</div>
                                        <div style={{ fontSize: 12, color: '#f57c00', marginTop: 4 }}>Target realistis yang bisa kita kuasai</div>
                                    </div>
                                </div>
                            </div>

                            {/* Unit Economics */}
                            <div className="projection-card">
                                <h3>💵 Unit Economics</h3>
                                <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
                                    <div style={{ flex: 1, minWidth: 150, background: 'var(--md-surface-container)', padding: 16, borderRadius: 'var(--md-shape-md)' }}>
                                        <div style={{ fontSize: 13, color: 'var(--md-on-surface-variant)', marginBottom: 4 }}>CAC (Customer Acquisition Cost)</div>
                                        <div style={{ fontSize: 20, fontWeight: 600 }}>{formatCurrency(project.pitch?.unitEconomics?.cac || 0)}</div>
                                        <div style={{ fontSize: 12, color: 'var(--md-on-surface-variant)', marginTop: 4 }}>Biaya akuisisi 1 pelanggan</div>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 150, background: 'var(--md-surface-container)', padding: 16, borderRadius: 'var(--md-shape-md)' }}>
                                        <div style={{ fontSize: 13, color: 'var(--md-on-surface-variant)', marginBottom: 4 }}>LTV (Lifetime Value)</div>
                                        <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--md-primary)' }}>{formatCurrency(project.pitch?.unitEconomics?.ltv || 0)}</div>
                                        <div style={{ fontSize: 12, color: 'var(--md-on-surface-variant)', marginTop: 4 }}>Nilai transaksi 1 pelanggan</div>
                                    </div>
                                </div>

                                <h3 style={{ marginTop: 24, marginBottom: 16 }}>🧑‍🤝‍🧑 Tim Init (Founders)</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {(project.pitch?.team || []).map(t => (
                                        <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, border: '1px solid var(--md-outline-variant)', borderRadius: 'var(--md-shape-sm)' }}>
                                            <div style={{ width: 40, height: 40, borderRadius: 20, background: 'var(--md-primary-container)', color: 'var(--md-on-primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 16 }}>
                                                {t.name ? t.name.charAt(0).toUpperCase() : '?'}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: 15 }}>{t.name}</div>
                                                <div style={{ fontSize: 13, color: 'var(--md-primary)', fontWeight: 500 }}>{t.role}</div>
                                                <div style={{ fontSize: 12, color: 'var(--md-on-surface-variant)', marginTop: 2 }}>{t.experience}</div>
                                            </div>
                                        </div>
                                    ))}
                                    {(!project.pitch?.team || project.pitch.team.length === 0) && (
                                        <div style={{ fontSize: 13, color: 'var(--md-on-surface-variant)', textAlign: 'center', padding: 16 }}>Belum ada data tim.</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Competitor Matrix */}
                        <div className="projection-card mt-md">
                            <h3>⚔️ Analisis Kompetitor</h3>
                            <div className="data-table-wrapper mt-md">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Kompetitor</th>
                                            <th>Level Harga</th>
                                            <th>Titik Lemah (Peluang Kita)</th>
                                            <th>Keunggulan Kita ({project.name})</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(project.pitch?.competitors || []).map(c => (
                                            <tr key={c.id}>
                                                <td style={{ fontWeight: 600 }}>{c.name}</td>
                                                <td><span className="badge" style={{ background: 'var(--md-surface-container-high)', color: 'var(--md-on-surface)' }}>{c.price}</span></td>
                                                <td style={{ color: 'var(--md-error)' }}>{c.weakness}</td>
                                                <td style={{ color: 'var(--md-success)', fontWeight: 500 }}>Mengatasi: {c.weakness}</td>
                                            </tr>
                                        ))}
                                        {(!project.pitch?.competitors || project.pitch.competitors.length === 0) && (
                                            <tr><td colSpan={4} style={{ textAlign: 'center', padding: 24, color: 'var(--md-on-surface-variant)' }}>Belum ada data kompetitor.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </>
                )}

                {/* ═══════ TIMELINE ═══════ */}
                {section === 'timeline' && (
                    <>
                        <div className="projection-card">
                            <h3>🗓️ Timeline Persiapan</h3>
                            <div className="mt-md">
                                <GanttChart activities={project.timelineActivities || []} />
                            </div>
                        </div>

                        {/* Team Planning */}
                        <div className="projection-card mt-md">
                            <h3><Users size={18} /> Kebutuhan Tim</h3>
                            <div className="data-table-wrapper">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Posisi</th>
                                            <th>Jumlah</th>
                                            <th>Gaji/Bulan</th>
                                            <th>Total/Bulan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(project.costs || []).filter(c => c.name.toLowerCase().includes('gaji')).map((c, i) => (
                                            <tr key={i}>
                                                <td style={{ fontWeight: 500 }}>Karyawan</td>
                                                <td>-</td>
                                                <td>{formatCurrency(c.amount)}</td>
                                                <td style={{ fontWeight: 500 }}>{formatCurrency(c.amount)}</td>
                                            </tr>
                                        ))}
                                        {(project.costs || []).filter(c => c.name.toLowerCase().includes('gaji')).length === 0 && (
                                            <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--md-on-surface-variant)' }}>Belum ada data gaji karyawan</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Investment Summary */}
                        <div className="projection-card mt-md">
                            <h3>🏦 Ringkasan Investasi</h3>
                            <div className="two-col">
                                <div>
                                    <div className="summary-row">
                                        <span className="label">Total Modal Dibutuhkan</span>
                                        <span className="value">{formatCurrency(proj.metrics.totalInvestment)}</span>
                                    </div>
                                    <div className="summary-row">
                                        <span className="label">Bagian Investor ({project.investment?.investorShare || 0}%)</span>
                                        <span className="value" style={{ color: 'var(--md-primary)' }}>
                                            {formatCurrency(proj.metrics.totalInvestment * (project.investment?.investorShare || 0) / 100)}
                                        </span>
                                    </div>
                                    <div className="summary-row">
                                        <span className="label">Bagian Pemilik ({100 - (project.investment?.investorShare || 0)}%)</span>
                                        <span className="value">
                                            {formatCurrency(proj.metrics.totalInvestment * (100 - (project.investment?.investorShare || 0)) / 100)}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <div className="summary-row highlight">
                                        <span className="label">Laba Bersih / Tahun</span>
                                        <span className="value">{formatCurrency(proj.yearly.netProfit)}</span>
                                    </div>
                                    <div className="summary-row highlight">
                                        <span className="label">Return Investor / Tahun</span>
                                        <span className="value" style={{ color: 'var(--md-primary)' }}>
                                            {formatCurrency(proj.yearly.netProfit * (project.investment?.investorShare || 0) / 100)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </>
    );
}
