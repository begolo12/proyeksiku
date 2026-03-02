'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import Navbar from '@/app/components/Navbar';
import { saveProject } from '@/app/lib/storage';
import { calculateMargin, calculateAvgMargin } from '@/app/lib/calculations';
import { BUSINESS_TYPES, DEFAULT_COST_ITEMS, formatCurrency, formatPercent, generateId } from '@/app/lib/constants';
import {
    ChevronLeft, ChevronRight, Plus, Trash2, Check, Info,
    Building2, ShoppingBag, Receipt, Target, Landmark, Calendar, Presentation
} from 'lucide-react';
import CurrencyInput from '@/app/components/CurrencyInput';

const STEPS = [
    { label: 'Info Usaha', icon: <Building2 size={16} /> },
    { label: 'Produk', icon: <ShoppingBag size={16} /> },
    { label: 'Biaya', icon: <Receipt size={16} /> },
    { label: 'Target', icon: <Target size={16} /> },
    { label: 'Timeline', icon: <Calendar size={16} /> },
    { label: 'Pitch Deck', icon: <Presentation size={16} /> },
    { label: 'Modal', icon: <Landmark size={16} /> },
];

export default function NewProjectPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState(0);

    // Step 1
    const [name, setName] = useState('');
    const [businessType, setBusinessType] = useState('fnb');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');

    // Step 2
    const [products, setProducts] = useState([
        { id: generateId(), name: '', costPrice: 0, sellPrice: 0, dailyQty: 0 }
    ]);

    // Step 3
    const [costs, setCosts] = useState(
        DEFAULT_COST_ITEMS.map(c => ({ ...c, id: generateId() }))
    );

    // Step 4
    const [marketingBudget, setMarketingBudget] = useState(0);
    const [marketingStrategy, setMarketingStrategy] = useState('');

    // Step 5
    const [timelineActivities, setTimelineActivities] = useState([
        { id: generateId(), name: 'Sewa Tempat & Renovasi', startMonth: 1, endMonth: 2 },
        { id: generateId(), name: 'Pembelian Peralatan', startMonth: 2, endMonth: 2 },
        { id: generateId(), name: 'Rekrutmen & Training', startMonth: 2, endMonth: 3 },
        { id: generateId(), name: 'Soft Opening', startMonth: 3, endMonth: 3 },
    ]);

    // Step 6 (Pitch Deck)
    const [valueProposition, setValueProposition] = useState('');
    const [marketSize, setMarketSize] = useState({ tam: 0, sam: 0, som: 0 });
    const [competitors, setCompetitors] = useState([{ id: generateId(), name: 'Kompetitor A', price: 'Menengah', weakness: 'Layanan lambat' }]);
    const [team, setTeam] = useState([{ id: generateId(), name: 'Nama Founder', role: 'CEO', experience: '5 thn di industri' }]);
    const [cac, setCac] = useState(0);
    const [ltv, setLtv] = useState(0);

    // Step 7
    const [totalCapital, setTotalCapital] = useState(0);
    const [investorShare, setInvestorShare] = useState(0);
    const [timeline, setTimeline] = useState('6');
    const [growthRate, setGrowthRate] = useState(3);
    const [inflationRate, setInflationRate] = useState(5); // % per year
    const [discountRate, setDiscountRate] = useState(10); // % per year (Suku bunga / Cost of Capital)

    // Auto-calculate Total Capital based on costs and initial needs
    const [suggestedCapital, setSuggestedCapital] = useState(0);

    useEffect(() => {
        // Sum all operational costs
        const totalMonthlyCosts = costs.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

        // Sum initial product stocking (Assume 1 month worth of inventory as startup stock)
        const totalInitialInventory = products.reduce((sum, p) => sum + ((Number(p.costPrice) || 0) * (Number(p.dailyQty) || 0) * 30), 0);

        // Suggested Capital: All costs + 1 month inventory buffer
        const suggested = totalMonthlyCosts + totalInitialInventory;
        setSuggestedCapital(suggested);

        // Only auto-update if totalCapital is still 0
        if (totalCapital === 0 && suggested > 0) {
            setTotalCapital(suggested);
        }
    }, [costs, products, totalCapital]);

    useEffect(() => {
        if (!authLoading && !user) router.replace('/login');
    }, [user, authLoading, router]);

    // Product handlers
    const addProduct = () => {
        setProducts([...products, { id: generateId(), name: '', costPrice: 0, sellPrice: 0, dailyQty: 0 }]);
    };

    const updateProduct = (id, field, value) => {
        setProducts(products.map(p => p.id === id ? { ...p, [field]: field === 'name' ? value : Number(value) || 0 } : p));
    };

    const removeProduct = (id) => {
        if (products.length <= 1) return;
        setProducts(products.filter(p => p.id !== id));
    };

    // Cost handlers
    const addCost = () => {
        setCosts([...costs, { id: generateId(), name: '', amount: 0, category: 'variable' }]);
    };

    const updateCost = (id, field, value) => {
        setCosts(costs.map(c => c.id === id ? { ...c, [field]: field === 'name' || field === 'category' ? value : Number(value) || 0 } : c));
    };

    const removeCost = (id) => {
        setCosts(costs.filter(c => c.id !== id));
    };

    // Timeline handlers
    const addActivity = () => {
        setTimelineActivities([...timelineActivities, { id: generateId(), name: '', startMonth: 1, endMonth: 1 }]);
    };

    const updateActivity = (id, field, value) => {
        setTimelineActivities(timelineActivities.map(a => a.id === id ? { ...a, [field]: field === 'name' ? value : Number(value) || 1 } : a));
    };

    const removeActivity = (id) => {
        setTimelineActivities(timelineActivities.filter(a => a.id !== id));
    };

    // Pitch Handlers
    const addCompetitor = () => setCompetitors([...competitors, { id: generateId(), name: '', price: '', weakness: '' }]);
    const removeCompetitor = (id) => setCompetitors(competitors.filter(c => c.id !== id));
    const updateCompetitor = (id, field, value) => setCompetitors(competitors.map(c => c.id === id ? { ...c, [field]: value } : c));

    const addTeam = () => setTeam([...team, { id: generateId(), name: '', role: '', experience: '' }]);
    const removeTeam = (id) => setTeam(team.filter(t => t.id !== id));
    const updateTeam = (id, field, value) => setTeam(team.map(t => t.id === id ? { ...t, [field]: value } : t));

    const [saving, setSaving] = useState(false);

    // Save
    const handleSave = async () => {
        setSaving(true);
        // Update marketing cost in costs array
        const updatedCosts = costs.map(c =>
            c.name === 'Marketing / Iklan' ? { ...c, amount: marketingBudget } : c
        );

        const projectData = {
            name,
            businessType,
            description,
            location,
            products: products.map(p => ({
                name: p.name,
                costPrice: p.costPrice,
                sellPrice: p.sellPrice,
                dailyQty: p.dailyQty
            })),
            costs: updatedCosts.map(c => ({
                name: c.name,
                amount: c.amount,
                category: c.category
            })),
            timelineActivities: timelineActivities.map(a => ({
                name: a.name,
                startMonth: a.startMonth,
                endMonth: a.endMonth
            })),
            pitchDeck: {
                valueProposition,
                marketSizeJson: JSON.stringify(marketSize),
                competitorsJson: JSON.stringify(competitors),
                teamJson: JSON.stringify(team),
                cac: Number(cac) || 0,
                ltv: Number(ltv) || 0
            },
            investment: {
                totalCapital: Number(totalCapital) || 0,
                investorShare: Number(investorShare) || 0,
                timeline: Number(timeline) || 12,
                growthRate: Number(growthRate) || 3,
                inflationRate: Number(inflationRate) || 5,
                discountRate: Number(discountRate) || 10
            },
            marketingStrategy,
        };

        try {
            await saveProject(projectData);
            router.push('/dashboard');
        } catch (error) {
            console.error('Save failed:', error);
            alert('Gagal menyimpan proyek: ' + error.message);
            setSaving(false);
        }
    };

    const canNext = () => {
        if (step === 0) return name.trim().length > 0;
        if (step === 1) return products.some(p => p.name.trim() && p.sellPrice > 0);
        return true;
    };

    if (authLoading || !user) {
        return <div className="loading-page"><div className="spinner" /><span>Memuat...</span></div>;
    }

    const selectedBiz = BUSINESS_TYPES.find(b => b.value === businessType);

    return (
        <>
            <Navbar />
            <main className="page">
                <div className="wizard">
                    {/* Stepper */}
                    <div className="stepper">
                        {STEPS.map((s, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                                <div className={`stepper-step ${i === step ? 'active' : i < step ? 'completed' : ''}`}>
                                    <div className="step-number">
                                        {i < step ? <Check size={16} /> : i + 1}
                                    </div>
                                    <span className="step-label">{s.label}</span>
                                </div>
                                {i < STEPS.length - 1 && <div className={`stepper-line ${i < step ? 'active' : ''}`} />}
                            </div>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="wizard-content" key={step}>
                        {/* STEP 1 — Info Usaha */}
                        {step === 0 && (
                            <>
                                <h2><span className="step-emoji">🏢</span> Informasi Usaha</h2>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Nama Usaha *</label>
                                        <input className="form-input" placeholder="Contoh: Warung Makan Sari Rasa" value={name} onChange={e => setName(e.target.value)} id="project-name" />
                                    </div>
                                    <div className="form-group">
                                        <label>Jenis Usaha</label>
                                        <select className="form-select" value={businessType} onChange={e => setBusinessType(e.target.value)}>
                                            {BUSINESS_TYPES.map(b => (
                                                <option key={b.value} value={b.value}>{b.icon} {b.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Lokasi</label>
                                        <input className="form-input" placeholder="Contoh: Jakarta Selatan" value={location} onChange={e => setLocation(e.target.value)} />
                                    </div>
                                </div>
                                <div className="form-group mt-md">
                                    <label>Deskripsi Usaha</label>
                                    <textarea className="form-input form-textarea" placeholder="Ceritakan tentang usaha yang akan dijalankan..." value={description} onChange={e => setDescription(e.target.value)} />
                                </div>
                            </>
                        )}

                        {/* STEP 2 — Produk & Harga */}
                        {step === 1 && (
                            <>
                                <h2><span className="step-emoji">🛍️</span> Produk & Harga</h2>
                                <div className="data-table-wrapper">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Nama Produk/Jasa</th>
                                                <th>Harga Modal (Rp)</th>
                                                <th>Harga Jual (Rp)</th>
                                                <th>Margin</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.map(p => {
                                                const margin = calculateMargin(p.costPrice, p.sellPrice);
                                                return (
                                                    <tr key={p.id}>
                                                        <td className="input-cell">
                                                            <input className="form-input" placeholder="Nama produk" value={p.name} onChange={e => updateProduct(p.id, 'name', e.target.value)} />
                                                        </td>
                                                        <td className="input-cell">
                                                            <CurrencyInput className="form-input" placeholder="0" value={p.costPrice} onChange={val => updateProduct(p.id, 'costPrice', val)} />
                                                        </td>
                                                        <td className="input-cell">
                                                            <CurrencyInput className="form-input" placeholder="0" value={p.sellPrice} onChange={val => updateProduct(p.id, 'sellPrice', val)} />
                                                        </td>
                                                        <td className={`margin-cell ${margin > 0 ? 'positive' : margin < 0 ? 'negative' : ''}`}>
                                                            {formatPercent(margin)}
                                                        </td>
                                                        <td>
                                                            <button className="btn btn-ghost btn-icon" onClick={() => removeProduct(p.id)} disabled={products.length <= 1} style={{ color: 'var(--md-error)' }}>
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                <button className="add-row-btn" onClick={addProduct}>
                                    <Plus size={16} /> Tambah Produk
                                </button>

                                <div className="summary-box">
                                    <span className="summary-icon">📊</span>
                                    <div>
                                        <div className="summary-label">Rata-rata Margin</div>
                                        <div className="summary-value">{formatPercent(calculateAvgMargin(products))}</div>
                                    </div>
                                </div>

                                {selectedBiz && (
                                    <div className="info-tip">
                                        <Info size={16} className="tip-icon" />
                                        <span>💡 {selectedBiz.tips}</span>
                                    </div>
                                )}
                            </>
                        )}

                        {/* STEP 3 — Biaya Operasional */}
                        {step === 2 && (
                            <>
                                <h2><span className="step-emoji">💰</span> Biaya Operasional Bulanan</h2>
                                <div className="data-table-wrapper">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Item Biaya</th>
                                                <th>Jumlah / Bulan (Rp)</th>
                                                <th>Kategori</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {costs.map(c => (
                                                <tr key={c.id}>
                                                    <td className="input-cell">
                                                        <input className="form-input" placeholder="Nama biaya" value={c.name} onChange={e => updateCost(c.id, 'name', e.target.value)} />
                                                    </td>
                                                    <td className="input-cell">
                                                        <CurrencyInput className="form-input" placeholder="0" value={c.amount} onChange={val => updateCost(c.id, 'amount', val)} />
                                                    </td>
                                                    <td className="input-cell">
                                                        <select className="form-select" value={c.category} onChange={e => updateCost(c.id, 'category', e.target.value)} style={{ padding: '8px 32px 8px 12px' }}>
                                                            <option value="fixed">Tetap</option>
                                                            <option value="variable">Variabel</option>
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <button className="btn btn-ghost btn-icon" onClick={() => removeCost(c.id)} style={{ color: 'var(--md-error)' }}>
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <button className="add-row-btn" onClick={addCost}>
                                    <Plus size={16} /> Tambah Biaya
                                </button>

                                <div className="summary-box">
                                    <span className="summary-icon">📋</span>
                                    <div>
                                        <div className="summary-label">Total Biaya Operasional / Bulan</div>
                                        <div className="summary-value">{formatCurrency(costs.reduce((s, c) => s + (c.amount || 0), 0))}</div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* STEP 4 — Target Penjualan */}
                        {step === 3 && (
                            <>
                                <h2><span className="step-emoji">🎯</span> Target Penjualan Harian</h2>
                                <div className="data-table-wrapper">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Produk/Jasa</th>
                                                <th>Harga Jual</th>
                                                <th>Target/Hari</th>
                                                <th>Revenue/Hari</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.map(p => (
                                                <tr key={p.id}>
                                                    <td>{p.name || 'Produk tanpa nama'}</td>
                                                    <td>{formatCurrency(p.sellPrice)}</td>
                                                    <td className="input-cell">
                                                        <CurrencyInput className="form-input" placeholder="0" value={p.dailyQty} onChange={val => updateProduct(p.id, 'dailyQty', val)} />
                                                    </td>
                                                    <td style={{ fontWeight: 600 }}>{formatCurrency(p.sellPrice * (p.dailyQty || 0))}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="summary-box">
                                    <span className="summary-icon">📈</span>
                                    <div>
                                        <div className="summary-label">Total Revenue Harian</div>
                                        <div className="summary-value">{formatCurrency(products.reduce((s, p) => s + (p.sellPrice * (p.dailyQty || 0)), 0))}</div>
                                    </div>
                                </div>

                                <div className="form-grid mt-lg">
                                    <div className="form-group">
                                        <label>Budget Marketing / Bulan (Rp)</label>
                                        <CurrencyInput className="form-input" placeholder="0" value={marketingBudget} onChange={val => setMarketingBudget(val)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Strategi Marketing</label>
                                        <textarea className="form-input form-textarea" placeholder="Contoh: Instagram Ads, leaflet, promo beli 1 gratis 1..." value={marketingStrategy} onChange={e => setMarketingStrategy(e.target.value)} />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* STEP 5 — Timeline Persiapan */}
                        {step === 4 && (
                            <>
                                <h2><span className="step-emoji">🗓️</span> Timeline Persiapan (Gantt Chart)</h2>
                                <p style={{ color: 'var(--md-on-surface-variant)', fontSize: 14, marginBottom: 16 }}>Rencanakan aktivitas sebelum usaha mulai beroperasi penuh.</p>
                                <div className="data-table-wrapper">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Nama Aktivitas</th>
                                                <th>Mulai (Bulan)</th>
                                                <th>Selesai (Bulan)</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {timelineActivities.map(a => (
                                                <tr key={a.id}>
                                                    <td className="input-cell">
                                                        <input className="form-input" placeholder="Contoh: Renovasi" value={a.name} onChange={e => updateActivity(a.id, 'name', e.target.value)} />
                                                    </td>
                                                    <td className="input-cell" style={{ width: 120 }}>
                                                        <input className="form-input" type="number" min="1" max="12" value={a.startMonth} onChange={e => updateActivity(a.id, 'startMonth', e.target.value)} />
                                                    </td>
                                                    <td className="input-cell" style={{ width: 120 }}>
                                                        <input className="form-input" type="number" min="1" max="12" value={a.endMonth} onChange={e => updateActivity(a.id, 'endMonth', e.target.value)} />
                                                    </td>
                                                    <td style={{ width: 60 }}>
                                                        <button className="btn btn-ghost btn-icon" onClick={() => removeActivity(a.id)} style={{ color: 'var(--md-error)' }}>
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <button className="add-row-btn" onClick={addActivity}>
                                    <Plus size={16} /> Tambah Aktivitas
                                </button>

                                <div className="summary-box mt-lg">
                                    <span className="summary-icon">⏰</span>
                                    <div>
                                        <div className="summary-label">Total Durasi Persiapan</div>
                                        <div className="summary-value">
                                            {timelineActivities.length > 0 ? Math.max(...timelineActivities.map(a => a.endMonth)) : 0} Bulan
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* STEP 6 — Pitch Deck Investor */}
                        {step === 5 && (
                            <>
                                <h2><span className="step-emoji">🎤</span> Data Presentasi Investor</h2>
                                <p style={{ color: 'var(--md-on-surface-variant)', fontSize: 14, marginBottom: 16 }}>Lengkapi data ini untuk generate slide presentasi profesional (Pitch Deck).</p>

                                <div className="form-group mb-lg">
                                    <label>Value Proposition (Satu Kalimat Utama)</label>
                                    <input className="form-input" placeholder="Contoh: Solusi katering sehat pertama dengan pengiriman 30 menit." value={valueProposition} onChange={e => setValueProposition(e.target.value)} />
                                </div>

                                <div className="projection-card mb-lg">
                                    <h3 style={{ fontSize: 16, marginBottom: 12 }}>📈 Market Sizing (Potensi Pasar per Tahun)</h3>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>TAM (Total Pasar) Rp</label>
                                            <CurrencyInput className="form-input" placeholder="0" value={marketSize.tam} onChange={val => setMarketSize({ ...marketSize, tam: val })} />
                                        </div>
                                        <div className="form-group">
                                            <label>SAM (Pasar Tersedia) Rp</label>
                                            <CurrencyInput className="form-input" placeholder="0" value={marketSize.sam} onChange={val => setMarketSize({ ...marketSize, sam: val })} />
                                        </div>
                                        <div className="form-group">
                                            <label>SOM (Target Realistis) Rp</label>
                                            <CurrencyInput className="form-input" placeholder="0" value={marketSize.som} onChange={val => setMarketSize({ ...marketSize, som: val })} />
                                        </div>
                                    </div>
                                </div>

                                <div className="projection-card mb-lg">
                                    <h3 style={{ fontSize: 16, marginBottom: 12 }}>⚔️ Kompetitor Utama</h3>
                                    {competitors.map((c, i) => (
                                        <div key={c.id} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                                            <input className="form-input" placeholder="Nama" value={c.name} onChange={e => updateCompetitor(c.id, 'name', e.target.value)} style={{ flex: 1 }} />
                                            <input className="form-input" placeholder="Harga (Murah/Mahal)" value={c.price} onChange={e => updateCompetitor(c.id, 'price', e.target.value)} style={{ flex: 1 }} />
                                            <input className="form-input" placeholder="Kelemahan mereka" value={c.weakness} onChange={e => updateCompetitor(c.id, 'weakness', e.target.value)} style={{ flex: 2 }} />
                                            <button className="btn btn-ghost btn-icon" onClick={() => removeCompetitor(c.id)} style={{ color: 'var(--md-error)' }}><Trash2 size={16} /></button>
                                        </div>
                                    ))}
                                    <button className="btn btn-outlined btn-sm mt-sm" onClick={addCompetitor}><Plus size={14} /> Tambah Kompetitor</button>
                                </div>

                                <div className="projection-card mb-lg">
                                    <h3 style={{ fontSize: 16, marginBottom: 12 }}>👥 Tim Inti (Founders)</h3>
                                    {team.map((t, i) => (
                                        <div key={t.id} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                                            <input className="form-input" placeholder="Nama Lengkap" value={t.name} onChange={e => updateTeam(t.id, 'name', e.target.value)} style={{ flex: 1 }} />
                                            <input className="form-input" placeholder="Posisi (CEO, dll)" value={t.role} onChange={e => updateTeam(t.id, 'role', e.target.value)} style={{ flex: 1 }} />
                                            <input className="form-input" placeholder="Pengalaman (Cth: 5 th di F&B)" value={t.experience} onChange={e => updateTeam(t.id, 'experience', e.target.value)} style={{ flex: 2 }} />
                                            <button className="btn btn-ghost btn-icon" onClick={() => removeTeam(t.id)} style={{ color: 'var(--md-error)' }}><Trash2 size={16} /></button>
                                        </div>
                                    ))}
                                    <button className="btn btn-outlined btn-sm mt-sm" onClick={addTeam}><Plus size={14} /> Tambah Tim</button>
                                </div>

                                <div className="projection-card">
                                    <h3 style={{ fontSize: 16, marginBottom: 12 }}>💵 Unit Economics</h3>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>CAC (Biaya Akuisisi 1 Pelanggan) Rp</label>
                                            <CurrencyInput className="form-input" placeholder="0" value={cac} onChange={val => setCac(val)} />
                                        </div>
                                        <div className="form-group">
                                            <label>LTV (Nilai Transaksi 1 Pelanggan) Rp</label>
                                            <CurrencyInput className="form-input" placeholder="0" value={ltv} onChange={val => setLtv(val)} />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* STEP 7 — Modal & Investasi */}
                        {step === 6 && (
                            <>
                                <h2><span className="step-emoji">🏦</span> Modal & Investasi</h2>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Total Modal Dibutuhkan (Rp) *</label>
                                        <CurrencyInput className="form-input" placeholder="0" value={totalCapital} onChange={val => setTotalCapital(val)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Bagian Investor (%)</label>
                                        <input className="form-input" type="number" placeholder="0" min="0" max="100" value={investorShare || ''} onChange={e => setInvestorShare(Number(e.target.value) || 0)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Timeline Balik Modal (Bulan)</label>
                                        <select className="form-select" value={timeline} onChange={e => setTimeline(e.target.value)}>
                                            <option value="3">3 Bulan</option>
                                            <option value="6">6 Bulan</option>
                                            <option value="12">12 Bulan</option>
                                            <option value="18">18 Bulan</option>
                                            <option value="24">24 Bulan</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Pertumbuhan Bulanan (%)</label>
                                        <input className="form-input" type="number" placeholder="3" min="0" max="50" value={growthRate || ''} onChange={e => setGrowthRate(Number(e.target.value) || 0)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Taksiran Inflasi / Tahun (%)</label>
                                        <input className="form-input" type="number" placeholder="5" min="0" max="100" value={inflationRate || ''} onChange={e => setInflationRate(Number(e.target.value) || 0)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Bunga/Cost of Capital (%)</label>
                                        <input className="form-input" type="number" placeholder="10" min="0" max="100" value={discountRate || ''} onChange={e => setDiscountRate(Number(e.target.value) || 0)} />
                                        <small style={{ color: 'var(--md-on-surface-variant)', fontSize: 11, marginTop: 4, display: 'block' }}>*Digunakan u/ Valuasi Bisnis</small>
                                    </div>
                                </div>

                                <div className="summary-box mt-lg">
                                    <span className="summary-icon">💡</span>
                                    <div style={{ flex: 1 }}>
                                        <div className="summary-label">Sesuai Rencana (COGS + OPEX)</div>
                                        <div className="summary-value">{formatCurrency(suggestedCapital)}</div>
                                    </div>
                                    {totalCapital !== suggestedCapital && suggestedCapital > 0 && (
                                        <button className="btn btn-outlined btn-sm" onClick={() => setTotalCapital(suggestedCapital)}>
                                            Gunakan
                                        </button>
                                    )}
                                </div>

                                <div className="summary-box mt-sm">
                                    <span className="summary-icon">🤝</span>
                                    <div>
                                        <div className="summary-label">Modal dari Investor</div>
                                        <div className="summary-value">{formatCurrency(totalCapital * investorShare / 100)}</div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Navigation */}
                        <div className="wizard-actions">
                            <button className="btn btn-secondary" onClick={() => step > 0 ? setStep(step - 1) : router.push('/dashboard')}>
                                <ChevronLeft size={18} /> {step > 0 ? 'Sebelumnya' : 'Batal'}
                            </button>
                            {step < STEPS.length - 1 ? (
                                <button className="btn btn-primary" onClick={() => setStep(step + 1)} disabled={!canNext()}>
                                    Lanjut <ChevronRight size={18} />
                                </button>
                            ) : (
                                <button className="btn btn-accent btn-lg" onClick={handleSave} disabled={!canNext() || saving} id="save-project-btn">
                                    {saving ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : <><Check size={18} /> Simpan & Lihat Proyeksi</>}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
