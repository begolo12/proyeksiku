'use client';

import { Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';
import { formatCurrency } from '@/app/lib/constants';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function UseOfFundsChart({ items = [], total = 0 }) {
    if (!items || items.length === 0 || total === 0) {
        return <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--md-on-surface-variant)' }}>Tidak ada data alokasi dana.</div>;
    }

    // Sort by amount descending
    const sortedItems = [...items].sort((a, b) => b.amount - a.amount);

    const data = {
        labels: sortedItems.map(item => item.name),
        datasets: [
            {
                data: sortedItems.map(item => item.amount),
                backgroundColor: [
                    'var(--md-primary)',           // #1a73e8
                    '#00897b',                     // Teal
                    '#f57c00',                     // Orange
                    '#7c4dff',                     // Deep Purple
                    '#d32f2f',                     // Red
                    '#0288d1',                     // Light Blue
                    '#c2185b',                     // Pink
                    '#455a64'                      // Blue Grey
                ],
                borderWidth: 2,
                borderColor: '#ffffff',
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    color: 'var(--md-on-surface-variant)',
                    font: { family: 'var(--md-font-sans)', size: 13 },
                    usePointStyle: true,
                    padding: 20
                },
            },
            tooltip: {
                backgroundColor: 'var(--md-surface)',
                titleColor: 'var(--md-on-surface)',
                bodyColor: 'var(--md-on-surface-variant)',
                borderColor: 'var(--md-outline)',
                borderWidth: 1,
                padding: 12,
                callbacks: {
                    label: function (context) {
                        const value = context.raw;
                        const percentage = ((value / total) * 100).toFixed(1);
                        return ` ${formatCurrency(value)} (${percentage}%)`;
                    }
                }
            },
        },
        cutout: '50%', // Make it a donut chart
    };

    return <Pie data={data} options={options} />;
}
