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
                    borderColor: '#00b894',
                    backgroundColor: 'rgba(0, 184, 148, 0.15)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#ffffff',
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
                        grid: { color: 'rgba(255,255,255,0.08)' },
                        ticks: { color: '#94a3b8' }
                    },
                    x: {
                        grid: { color: 'rgba(255,255,255,0.08)' },
                        ticks: { color: '#94a3b8' }
                    }
                },
                plugins: {
                    legend: { labels: { color: '#f8fafc' } }
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
            <div style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
            }}>
                <div>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Cumulative GPA (CGPA)
                    </span>
                    <div style={{
                        fontSize: '3.5rem',
                        fontWeight: 900,
                        color: parseFloat(cgpa) >= (maxScale * 0.7) ? '#4ade80' : parseFloat(cgpa) >= (maxScale * 0.5) ? '#fbbf24' : '#f87171',
                        margin: '8px 0'
                    }}>
                        {cgpa} <span style={{ fontSize: '1.2rem', color: '#64748b' }}>/ {maxScale.toFixed(2)}</span>
                    </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    paddingTop: '16px',
                    borderTop: '1px solid rgba(255,255,255,0.08)'
                }}>
                    <div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>TOTAL UNITS</span>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>{totalUnits}</div>
                    </div>
                    <div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>TOTAL COURSES</span>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>{totalCourses}</div>
                    </div>
                </div>
            </div>

            {/* Chart Box */}
            <div style={{
                background: 'var(--glass-bg, rgba(15, 23, 42, 0.7))',
                padding: '20px',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                height: '240px'
            }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: '#f8fafc' }}>📈 GPA Performance Trend</h4>
                {totalCourses === 0 ? (
                    <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                        Add courses across semesters to render trend line.
                    </div>
                ) : (
                    <div style={{ height: '180px' }}>
                        <canvas ref={chartRef} />
                    </div>
                )}
            </div>
        </div>
    );
}
