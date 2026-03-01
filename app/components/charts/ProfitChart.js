'use client';

import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ProfitChart({ data }) {
    if (!data || data.length === 0) return <p style={{ color: '#49454f' }}>Belum ada data</p>;

    const chartData = {
        labels: data.map(d => d.label),
        datasets: [
            {
                label: 'Laba Kotor',
                data: data.map(d => d.grossProfit),
                backgroundColor: 'rgba(26, 115, 232, 0.7)',
                borderColor: '#1a73e8',
                borderWidth: 1,
                borderRadius: 6,
            },
            {
                label: 'Biaya Operasional',
                data: data.map(d => d.opCosts),
                backgroundColor: 'rgba(211, 47, 47, 0.5)',
                borderColor: '#d32f2f',
                borderWidth: 1,
                borderRadius: 6,
            },
            {
                label: 'Laba Bersih',
                data: data.map(d => d.netProfit),
                backgroundColor: 'rgba(46, 125, 50, 0.7)',
                borderColor: '#2e7d32',
                borderWidth: 1,
                borderRadius: 6,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#49454f',
                    font: { family: 'Roboto', size: 12, weight: 500 },
                    usePointStyle: true,
                    pointStyle: 'rectRounded',
                    padding: 20,
                },
            },
            tooltip: {
                backgroundColor: '#ffffff',
                titleColor: '#1d1b20',
                bodyColor: '#49454f',
                borderColor: '#cac4d0',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 12,
                boxPadding: 6,
                usePointStyle: true,
                callbacks: {
                    label: (ctx) => `${ctx.dataset.label}: Rp ${new Intl.NumberFormat('id-ID').format(Math.round(ctx.raw))}`,
                },
            },
        },
        scales: {
            x: {
                grid: { color: 'rgba(0,0,0,0.04)' },
                ticks: { color: '#49454f', font: { family: 'Roboto', size: 11 } },
            },
            y: {
                grid: { color: 'rgba(0,0,0,0.04)' },
                ticks: {
                    color: '#49454f',
                    font: { family: 'Roboto', size: 11 },
                    callback: (v) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}jt` : v >= 1000 ? `${(v / 1000).toFixed(0)}rb` : v,
                },
            },
        },
    };

    return <Bar data={chartData} options={options} />;
}
