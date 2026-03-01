'use client';

import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function RevenueChart({ data }) {
    if (!data || data.length === 0) return <p style={{ color: '#49454f' }}>Belum ada data</p>;

    const chartData = {
        labels: data.map(d => d.label),
        datasets: [
            {
                label: 'Revenue',
                data: data.map(d => d.revenue),
                borderColor: '#1a73e8',
                backgroundColor: 'rgba(26, 115, 232, 0.08)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#1a73e8',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
                borderWidth: 3,
            },
            {
                label: 'Net Profit',
                data: data.map(d => d.netProfit),
                borderColor: '#2e7d32',
                backgroundColor: 'rgba(46, 125, 50, 0.06)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#2e7d32',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
                borderWidth: 3,
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
                    pointStyle: 'circle',
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

    return <Line data={chartData} options={options} />;
}
