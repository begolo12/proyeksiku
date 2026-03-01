'use client';

export default function GanttChart({ activities = [] }) {
    if (!activities || activities.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--md-on-surface-variant)' }}>
                Belum ada data timeline persiapan.
            </div>
        );
    }

    const maxMonth = Math.max(...activities.map(a => a.endMonth), 1);
    const months = Array.from({ length: maxMonth }, (_, i) => i + 1);

    return (
        <div className="gantt-container" style={{ overflowX: 'auto', paddingBottom: 16 }}>
            <div style={{ minWidth: `${Math.max(600, maxMonth * 60 + 200)}px` }}>
                {/* Header (Months) */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--md-outline-variant)', paddingBottom: 8, marginBottom: 12 }}>
                    <div style={{ width: 220, fontWeight: 500, color: 'var(--md-on-surface-variant)', fontSize: 13 }}>Aktivitas</div>
                    <div style={{ display: 'flex', flex: 1 }}>
                        {months.map(m => (
                            <div key={m} style={{ flex: 1, textAlign: 'center', fontWeight: 500, fontSize: 13, color: 'var(--md-on-surface-variant)', borderLeft: '1px solid var(--md-outline-variant)' }}>
                                Bln {m}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Rows (Activities) */}
                {activities.map((act, i) => {
                    const startIdx = act.startMonth - 1;
                    const duration = (act.endMonth - act.startMonth) + 1;
                    const widthPct = (duration / maxMonth) * 100;
                    const leftPct = (startIdx / maxMonth) * 100;

                    // Cycle through some Material colors
                    const colors = [
                        'var(--md-primary)',
                        '#00897b', // Teal
                        '#f57c00', // Orange
                        '#7c4dff', // Deep Purple
                        '#d32f2f', // Red
                        '#0288d1', // Light Blue
                    ];
                    const color = colors[i % colors.length];

                    return (
                        <div key={act.id || i} style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                            <div style={{ width: 220, paddingRight: 16, fontSize: 14, fontWeight: 500 }}>
                                {act.name}
                                <div style={{ fontSize: 12, color: 'var(--md-on-surface-variant)', fontWeight: 400 }}>
                                    Bulan {act.startMonth} - {act.endMonth} ({duration} bln)
                                </div>
                            </div>
                            <div style={{ flex: 1, position: 'relative', height: 32, background: 'var(--md-surface-container-low)', borderRadius: 'var(--md-shape-sm)' }}>
                                {/* Grid lines */}
                                {months.map(m => (
                                    <div key={m} style={{ position: 'absolute', left: `${((m - 1) / maxMonth) * 100}%`, top: 0, bottom: 0, width: '1px', background: 'var(--md-outline-variant)', opacity: 0.5 }} />
                                ))}

                                {/* Gantt Bar */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        left: `${leftPct}%`,
                                        width: `${widthPct}%`,
                                        height: '100%',
                                        background: color,
                                        borderRadius: 'var(--md-shape-sm)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '0 12px',
                                        color: '#ffffff',
                                        fontSize: 12,
                                        fontWeight: 600,
                                        boxShadow: 'var(--md-elevation-1)',
                                        overflow: 'hidden',
                                        whiteSpace: 'nowrap',
                                        textOverflow: 'ellipsis'
                                    }}
                                >
                                    {act.name}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
