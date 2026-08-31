'use client';

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface GpaSummaryCardProps {
    cgpa: string;
    totalUnits: number;
    totalCourses: number;
    maxScale: number;
    semesterGroups: Record<string, { units: number; qp: number }>;
}

export function GpaSummaryCard({
    cgpa,
    totalUnits,
    totalCourses,
    maxScale,
    semesterGroups
}: GpaSummaryCardProps) {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<Chart | null>(null);

    useEffect(() => {
        if (chartInstance.current) chartInstance.current.destroy();
        if (totalCourses === 0 || !chartRef.current) return;

        const labels = Object.keys(semesterGroups).sort();
        const dataPoints = labels.map(sem => parseFloat((semesterGroups[sem].qp / semesterGroups[sem].units).toFixed(2)));

        chartInstance.current = new Chart(chartRef.current, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'GPA Trend',
                    data: dataPoints,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#10b981',
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: maxScale,
                        grid: { color: 'rgba(148, 163, 184, 0.15)' },
                        ticks: { color: 'var(--text-muted)' }
                    },
                    x: {
                        grid: { color: 'rgba(148, 163, 184, 0.15)' },
                        ticks: { color: 'var(--text-muted)' }
                    }
                },
                plugins: {
                    legend: { labels: { color: 'var(--text-main)' } }
                }
            }
        });

        return () => chartInstance.current?.destroy();
    }, [semesterGroups, maxScale, totalCourses]);

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            marginBottom: '24px'
        }}>
            {/* Stat Box */}
            <div className="glass-card" style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: '4px solid var(--accent-blue)'
            }}>
                <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                        Cumulative GPA (CGPA)
                    </span>
                    <div style={{
                        fontSize: '3.5rem',
                        fontWeight: 900,
                        letterSpacing: '-0.03em',
                        color: parseFloat(cgpa) >= (maxScale * 0.7) ? 'var(--accent-emerald)' : parseFloat(cgpa) >= (maxScale * 0.5) ? 'var(--accent-amber)' : 'var(--accent-rose)',
                        margin: '6px 0'
                    }}>
                        {cgpa} <span style={{ fontSize: '1.2rem', color: 'var(--text-subtle)', fontWeight: 600 }}>/ {maxScale.toFixed(2)}</span>
                    </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    paddingTop: '16px',
                    borderTop: '1px solid var(--card-border)'
                }}>
                    <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontWeight: 700, textTransform: 'uppercase' }}>TOTAL UNITS</span>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>{totalUnits}</div>
                    </div>
                    <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontWeight: 700, textTransform: 'uppercase' }}>TOTAL COURSES</span>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>{totalCourses}</div>
                    </div>
                </div>
            </div>

            {/* Chart Box */}
            <div className="glass-card" style={{ height: '240px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 700 }}>📈 GPA Performance Trend</h4>
                {totalCourses === 0 ? (
                    <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-subtle)', fontSize: '0.85rem' }}>
                        Add courses across semesters to render trend line.
                    </div>
                ) : (
                    <div style={{ height: '160px' }}>
                        <canvas ref={chartRef} />
                    </div>
                )}
            </div>
        </div>
    );
}
