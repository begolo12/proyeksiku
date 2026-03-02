'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import Navbar from '@/app/components/Navbar';
import { getProject, saveProject } from '@/app/lib/storage';
import { calculateMargin, calculateAvgMargin } from '@/app/lib/calculations';
import { BUSINESS_TYPES, DEFAULT_COST_ITEMS, formatCurrency, formatPercent, generateId } from '@/app/lib/constants';
import {
    ChevronLeft, ChevronRight, Plus, Trash2, Check, Info,
    Building2, ShoppingBag, Receipt, Target, Landmark,
    Calendar, Presentation
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

export default function EditProjectPage({ params }) {
    const { id } = use(params);
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [loaded, setLoaded] = useState(false);

    const [name, setName] = useState('');
    const [businessType, setBusinessType] = useState('fnb');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [products, setProducts] = useState([]);
    const [costs, setCosts] = useState([]);
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
    const [inflationRate, setInflationRate] = useState(0);
    const [discountRate, setDiscountRate] = useState(0);

    // SWOT Analysis
    const [strengths, setStrengths] = useState('');
    const [weaknesses, setWeaknesses] = useState('');
    const [opportunities, setOpportunities] = useState('');
    const [threats, setThreats] = useState('');

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) router.replace('/login');
    }, [user, authLoading, router]);

    useEffect(() => {
        const fetchProjectData = async () => {
            if (!id) return;
            const p = await getProject(id);
            if (p) {
                setName(p.name || '');
                setBusinessType(p.businessType || 'fnb');
                setDescription(p.description || '');
                setLocation(p.location || '');
                setProducts(p.products || [{ id: generateId(), name: '', costPrice: 0, sellPrice: 0, dailyQty: 0 }]);
                setCosts(p.costs || DEFAULT_COST_ITEMS.map(c => ({ ...c, id: generateId() })));
                setMarketingBudget(p.costs?.find(c => c.name === 'Marketing / Iklan')?.amount || 0);
                setMarketingStrategy(p.marketingStrategy || '');
                if (p.timelineActivities) setTimelineActivities(p.timelineActivities);

                if (p.pitch) {
                    setValueProposition(p.pitch.valueProposition || '');
                    if (p.pitch.marketSize) setMarketSize(p.pitch.marketSize);
                    if (p.pitch.competitors) setCompetitors(p.pitch.competitors);
                    if (p.pitch.team) setTeam(p.pitch.team);
                    if (p.pitch.unitEconomics) {
                        setCac(p.pitch.unitEconomics.cac || 0);
                        setLtv(p.pitch.unitEconomics.ltv || 0);
                    }
                }

                setTotalCapital(p.investment?.totalCapital || 0);
                setInvestorShare(p.investment?.investorShare || 0);
                setTimeline(String(p.investment?.timeline || '6'));
                setGrowthRate(p.investment?.growthRate || 3);
                setInflationRate(p.investment?.inflationRate || 0);
                setDiscountRate(p.investment?.discountRate || 0);

                // SWOT
                setStrengths(p.strengths || '');
                setWeaknesses(p.weaknesses || '');
                setOpportunities(p.opportunities || '');
                setThreats(p.threats || '');

                setLoaded(true);
            } else if (!authLoading) {
                router.replace('/dashboard');
            }
        };

        if (!authLoading) fetchProjectData();
    }, [id, authLoading, router]);

    const addProduct = () => setProducts([...products, { id: generateId(), name: '', costPrice: 0, sellPrice: 0, dailyQty: 0 }]);
    const updateProduct = (pid, field, value) => setProducts(products.map(p => p.id === pid ? { ...p, [field]: field === 'name' ? value : Number(value) || 0 } : p));
    const removeProduct = (pid) => { if (products.length > 1) setProducts(products.filter(p => p.id !== pid)); };
    const addCost = () => setCosts([...costs, { id: generateId(), name: '', amount: 0, category: 'variable' }]);
    const updateCost = (cid, field, value) => setCosts(costs.map(c => c.id === cid ? { ...c, [field]: field === 'name' || field === 'category' ? value : Number(value) || 0 } : c));
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

    const handleSave = async () => {
        setSaving(true);
        const updatedCosts = costs.map(c => c.name === 'Marketing / Iklan' ? { ...c, amount: marketingBudget } : c);
        const projectData = {
            id,
            name, businessType, description, location,
            products, costs: updatedCosts,
            timelineActivities,
            pitch: {
                valueProposition,
                marketSize,
                competitors,
                team,
                unitEconomics: { cac, ltv }
            },
            investment: { totalCapital, investorShare, timeline: Number(timeline), growthRate, inflationRate, discountRate },
            marketingStrategy,
            strengths, weaknesses, opportunities, threats,
        };

        try {
            await saveProject(projectData);
            router.push(`/project/${id}`);
        } catch (error) {
            console.error('Save failed:', error);
            alert('Gagal menyimpan perubahan: ' + error.message);
            setSaving(false);
        }
    };

    if (authLoading || !user || !loaded) {
        return <div className="loading-page"><div className="spinner" /><span>Memuat...</span></div>;
    }

    const selectedBiz = BUSINESS_TYPES.find(b => b.value === businessType);

    return (
        <>
            <Navbar />
            <main className="page">
                <div className="wizard">
                    <div className="stepper">
                        {STEPS.map((s, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                                <div className={`stepper-step ${i === step ? 'active' : i < step ? 'completed' : ''}`}>
                                    <div className="step-number">{i < step ? <Check size={16} /> : i + 1}</div>
                                    <span className="step-label">{s.label}</span>
                                </div>
                                {i < STEPS.length - 1 && <div className={`stepper-line ${i < step ? 'active' : ''}`} />}
                            </div>
                        ))}
                    </div>

                    <div className="wizard-content" key={step}>
                        {step === 0 && (
                            <>
                                <h2><span className="step-emoji">🏢</span> Informasi Usaha</h2>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Nama Usaha *</label>
                                        <input className="form-input" value={name} onChange={e => setName(e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Jenis Usaha</label>
                                        <select className="form-select" value={businessType} onChange={e => setBusinessType(e.target.value)}>
                                            {BUSINESS_TYPES.map(b => <option key={b.value} value={b.value}>{b.icon} {b.label}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Lokasi</label>
                                        <input className="form-input" value={location} onChange={e => setLocation(e.target.value)} />
                                    </div>
                                </div>
                                <div className="form-group mt-md">
                                    <label>Deskripsi</label>
                                    <textarea className="form-input form-textarea" value={description} onChange={e => setDescription(e.target.value)} />
                                </div>
                            </>
                        )}

                        {step === 1 && (
                            <>
                                <h2><span className="step-emoji">🛍️</span> Produk & Harga</h2>
                                <div className="data-table-wrapper">
                                    <table className="data-table">
                                        <thead><tr><th>Nama</th><th>Modal (Rp)</th><th>Jual (Rp)</th><th>Margin</th><th></th></tr></thead>
                                        <tbody>
                                            {products.map(p => {
                                                const margin = calculateMargin(p.costPrice, p.sellPrice);
                                                return (
                                                    <tr key={p.id}>
                                                        <td className="input-cell"><input className="form-input" value={p.name} onChange={e => updateProduct(p.id, 'name', e.target.value)} /></td>
                                                        <td className="input-cell">
                                                            <CurrencyInput className="form-input" placeholder="0" value={p.costPrice} onChange={val => updateProduct(p.id, 'costPrice', val)} />
                                                        </td>
                                                        <td className="input-cell">
                                                            <CurrencyInput className="form-input" placeholder="0" value={p.sellPrice} onChange={val => updateProduct(p.id, 'sellPrice', val)} />
                                                        </td>        <td className={`margin-cell ${margin > 0 ? 'positive' : margin < 0 ? 'negative' : ''}`}>{formatPercent(margin)}</td>
                                                        <td><button className="btn btn-ghost btn-icon" onClick={() => removeProduct(p.id)} disabled={products.length <= 1} style={{ color: 'var(--danger)' }}><Trash2 size={16} /></button></td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                <button className="add-row-btn" onClick={addProduct}><Plus size={16} /> Tambah Produk</button>
                                <div className="summary-box"><span className="summary-icon">📊</span><div><div className="summary-label">Rata-rata Margin</div><div className="summary-value">{formatPercent(calculateAvgMargin(products))}</div></div></div>
                                {selectedBiz && <div className="info-tip"><Info size={16} className="tip-icon" /><span>💡 {selectedBiz.tips}</span></div>}
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <h2><span className="step-emoji">💰</span> Biaya Operasional Bulanan</h2>
                                <div className="data-table-wrapper">
                                    <table className="data-table">
                                        <thead><tr><th>Item</th><th>Jumlah/Bulan (Rp)</th><th>Kategori</th><th></th></tr></thead>
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
                                                            <option value="fixed">Tetap</option><option value="variable">Variabel</option>
                                                        </select>
                                                    </td>
                                                    <td><button className="btn btn-ghost btn-icon" onClick={() => removeCost(c.id)} style={{ color: 'var(--danger)' }}><Trash2 size={16} /></button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <button className="add-row-btn" onClick={addCost}><Plus size={16} /> Tambah Biaya</button>
                                <div className="summary-box"><span className="summary-icon">📋</span><div><div className="summary-label">Total / Bulan</div><div className="summary-value">{formatCurrency(costs.reduce((s, c) => s + (c.amount || 0), 0))}</div></div></div>
                            </>
                        )}

                        {step === 3 && (
                            <>
                                <h2><span className="step-emoji">🎯</span> Target Penjualan Harian</h2>
                                <div className="data-table-wrapper">
                                    <table className="data-table">
                                        <thead><tr><th>Produk</th><th>Harga Jual</th><th>Target/Hari</th><th>Revenue/Hari</th></tr></thead>
                                        <tbody>
                                            {products.map(p => (
                                                <tr key={p.id}>
                                                    <td>{p.name || '-'}</td>
                                                    <td>{formatCurrency(p.sellPrice)}</td>
                                                    <td className="input-cell">
                                                        <CurrencyInput className="form-input" placeholder="0" value={p.dailyQty} onChange={val => updateProduct(p.id, 'dailyQty', val)} />
                                                    </td>        <td style={{ fontWeight: 600 }}>{formatCurrency(p.sellPrice * (p.dailyQty || 0))}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="summary-box"><span className="summary-icon">📈</span><div><div className="summary-label">Revenue Harian</div><div className="summary-value">{formatCurrency(products.reduce((s, p) => s + p.sellPrice * (p.dailyQty || 0), 0))}</div></div></div>
                                <div className="form-grid mt-lg">
                                    <div className="form-group">
                                        <label>Budget Marketing / Bulan (Rp)</label>
                                        <CurrencyInput className="form-input" placeholder="0" value={marketingBudget} onChange={val => setMarketingBudget(val)} />
                                    </div>        <div className="form-group"><label>Strategi Marketing</label><textarea className="form-input form-textarea" value={marketingStrategy} onChange={e => setMarketingStrategy(e.target.value)} /></div>
                                </div>
                            </>
                        )}
                        {step === 4 && (
                            <>
                                <h2><span className="step-emoji">🗓️</span> Timeline Kegiatan</h2>
                                <div className="data-table-wrapper">
                                    <table className="data-table">
                                        <thead><tr><th>Kegiatan</th><th>Mulai (Bulan)</th><th>Selesai (Bulan)</th><th></th></tr></thead>
                                        <tbody>
                                            {timelineActivities.map(a => (
                                                <tr key={a.id}>
                                                    <td className="input-cell"><input className="form-input" value={a.name} onChange={e => updateActivity(a.id, 'name', e.target.value)} /></td>
                                                    <td className="input-cell"><input className="form-input" type="number" min="1" max="12" value={a.startMonth} onChange={e => updateActivity(a.id, 'startMonth', e.target.value)} /></td>
                                                    <td className="input-cell"><input className="form-input" type="number" min="1" max="12" value={a.endMonth} onChange={e => updateActivity(a.id, 'endMonth', e.target.value)} /></td>
                                                    <td><button className="btn btn-ghost btn-icon" onClick={() => removeActivity(a.id)} style={{ color: 'var(--danger)' }}><Trash2 size={16} /></button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <button className="add-row-btn" onClick={addActivity}><Plus size={16} /> Tambah Kegiatan</button>
                            </>
                        )}

                        {step === 5 && (
                            <>
                                <h2><span className="step-emoji">📢</span> Pitch Deck & Analisis SWOT</h2>
                                <div className="form-group mb-md">
                                    <label>Value Proposition *</label>
                                    <textarea className="form-input" value={valueProposition} onChange={e => setValueProposition(e.target.value)} rows={2} placeholder="Apa keunggulan utama bisnis Anda?" />
                                </div>
                                <div className="form-grid">
                                    <div className="form-group"><label>Strengths</label><textarea className="form-input" value={strengths} onChange={e => setStrengths(e.target.value)} rows={2} /></div>
                                    <div className="form-group"><label>Weaknesses</label><textarea className="form-input" value={weaknesses} onChange={e => setWeaknesses(e.target.value)} rows={2} /></div>
                                    <div className="form-group"><label>Opportunities</label><textarea className="form-input" value={opportunities} onChange={e => setOpportunities(e.target.value)} rows={2} /></div>
                                    <div className="form-group"><label>Threats</label><textarea className="form-input" value={threats} onChange={e => setThreats(e.target.value)} rows={2} /></div>
                                </div>
                                <h3 className="text-h3 mt-md mb-sm">Market Sizing (Rp)</h3>
                                <div className="form-grid">
                                    <div className="form-group"><label>TAM</label><CurrencyInput className="form-input" value={marketSize.tam} onChange={val => setMarketSize({ ...marketSize, tam: val })} /></div>
                                    <div className="form-group"><label>SAM</label><CurrencyInput className="form-input" value={marketSize.sam} onChange={val => setMarketSize({ ...marketSize, sam: val })} /></div>
                                    <div className="form-group"><label>SOM</label><CurrencyInput className="form-input" value={marketSize.som} onChange={val => setMarketSize({ ...marketSize, som: val })} /></div>
                                </div>
                            </>
                        )}

                        {step === 6 && (
                            <>
                                <h2><span className="step-emoji">🏦</span> Modal & Investasi</h2>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Total Modal Dibutuhkan (Rp) *</label>
                                        <CurrencyInput className="form-input" placeholder="0" value={totalCapital} onChange={val => setTotalCapital(val)} />
                                    </div>
                                    <div className="form-group"><label>Bagian Investor (%)</label><input className="form-input" type="number" min="0" max="100" value={investorShare || ''} onChange={e => setInvestorShare(Number(e.target.value) || 0)} /></div>
                                    <div className="form-group"><label>Timeline (Bulan)</label>
                                        <select className="form-select" value={timeline} onChange={e => setTimeline(e.target.value)}>
                                            <option value="3">3 Bulan</option><option value="6">6 Bulan</option><option value="12">12 Bulan</option><option value="18">18 Bulan</option><option value="24">24 Bulan</option>
                                        </select>
                                    </div>
                                    <div className="form-group"><label>Pertumbuhan/Bulan (%)</label><input className="form-input" type="number" min="0" max="50" value={growthRate || ''} onChange={e => setGrowthRate(Number(e.target.value) || 0)} /></div>
                                    <div className="form-group">
                                        <label>Asumsi Inflasi / Thn (%)</label>
                                        <input className="form-input" type="number" value={inflationRate || ''} onChange={e => setInflationRate(Number(e.target.value) || 0)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Discount Rate (%)</label>
                                        <input className="form-input" type="number" value={discountRate || ''} onChange={e => setDiscountRate(Number(e.target.value) || 0)} />
                                    </div>
                                </div>
                                <div className="summary-box mt-lg"><span className="summary-icon">💡</span><div><div className="summary-label">Modal Investor</div><div className="summary-value">{formatCurrency(totalCapital * investorShare / 100)}</div></div></div>
                            </>
                        )}

                        <div className="wizard-actions">
                            <button className="btn btn-secondary" onClick={() => step > 0 ? setStep(step - 1) : router.push(`/project/${id}`)} disabled={saving}>
                                <ChevronLeft size={18} /> {step > 0 ? 'Sebelumnya' : 'Batal'}
                            </button>
                            {step < STEPS.length - 1 ? (
                                <button className="btn btn-primary" onClick={() => setStep(step + 1)}>Lanjut <ChevronRight size={18} /></button>
                            ) : (
                                <button className="btn btn-accent btn-lg" onClick={handleSave} disabled={saving}>
                                    {saving ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : <><Check size={18} /> Simpan Perubahan</>}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
