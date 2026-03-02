'use client';

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
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function RealizationChart({ projectionData, realizationData }) {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: { size: 12, family: 'Inter' }
                },
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                padding: 12,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(0, 0, 0, 0.05)' },
                ticks: {
                    callback: (value) => {
                        if (value >= 1000000) return (value / 1000000).toFixed(1) + 'jt';
                        if (value >= 1000) return (value / 1000).toFixed(0) + 'rb';
                        return value;
                    },
                    font: { size: 11 }
                },
            },
            x: {
                grid: { display: false },
                ticks: { font: { size: 11 } }
            },
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false,
        },
    };

    const labels = projectionData.map(d => d.label);

    const data = {
        labels,
        datasets: [
            {
                label: 'Rencana (Proyeksi)',
                data: projectionData.map(d => d.revenue),
                borderColor: 'rgba(103, 80, 164, 0.4)',
                backgroundColor: 'rgba(103, 80, 164, 0.05)',
                borderDash: [5, 5],
                borderWidth: 2,
                tension: 0.3,
                pointRadius: 0,
            },
            {
                label: 'Realisasi (Aktual)',
                data: labels.map((_, i) => {
                    const real = realizationData.find(r => r.month === i + 1);
                    return real ? real.revenue : null;
                }),
                borderColor: '#2e7d32',
                backgroundColor: 'rgba(46, 125, 50, 0.1)',
                borderWidth: 3,
                tension: 0.3,
                pointRadius: 4,
                pointBackgroundColor: '#2e7d32',
                fill: true,
            },
        ],
    };

    return <Line options={options} data={data} />;
}
