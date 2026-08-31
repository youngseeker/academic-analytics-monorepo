'use client';

import React, { useState } from 'react';

interface TargetCalculatorProps {
    totalUnits: number;
    totalPoints: number;
    maxScale: number;
}

export function TargetCalculator({ totalUnits, totalPoints, maxScale }: TargetCalculatorProps) {
    const [targetGPA, setTargetGPA] = useState('');
    const [nextUnits, setNextUnits] = useState('');
    const [targetResult, setTargetResult] = useState('');

    const calculateTarget = (e: React.FormEvent) => {
        e.preventDefault();
        const target = parseFloat(targetGPA);
        const units = parseFloat(nextUnits);

        if (!target || !units) {
            setTargetResult("Please enter both a Target CGPA and Next Semester Units.");
            return;
        }

        const requiredGPA = ((target * (totalUnits + units)) - totalPoints) / units;

        if (requiredGPA > maxScale) {
            setTargetResult(`⚠️ Impossible! You would need a ${requiredGPA.toFixed(2)} GPA (Max scale is ${maxScale.toFixed(2)}).`);
        } else if (requiredGPA < 0) {
            setTargetResult(`🎉 Great news! Your current standing is already above this target.`);
        } else {
            setTargetResult(`🎯 Target Goal: Aim for a ${requiredGPA.toFixed(2)} GPA next semester.`);
        }
    };

    return (
        <div style={{
            background: 'var(--glass-bg, rgba(15, 23, 42, 0.7))',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '24px'
        }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                🎯 Target CGPA Forecasting Simulator
            </h3>

            <form onSubmit={calculateTarget} style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                alignItems: 'end'
            }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>
                        Desired Target CGPA
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        placeholder={`e.g. ${(maxScale * 0.9).toFixed(2)}`}
                        value={targetGPA}
                        onChange={(e) => setTargetGPA(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.15)',
                            background: '#0f172a',
                            color: '#fff',
                            fontSize: '0.9rem',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>
                        Upcoming Semester Units
                    </label>
                    <input
                        type="number"
                        placeholder="e.g. 24"
                        value={nextUnits}
                        onChange={(e) => setNextUnits(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.15)',
                            background: '#0f172a',
                            color: '#fff',
                            fontSize: '0.9rem',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                <button
                    type="submit"
                    style={{
                        padding: '12px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        color: '#fff',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                    }}
                >
                    Calculate Needed GPA
                </button>
            </form>

            {targetResult && (
                <div style={{
                    marginTop: '16px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: targetResult.startsWith('⚠️') ? 'rgba(239, 68, 68, 0.15)' : targetResult.startsWith('🎉') ? 'rgba(34, 197, 94, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                    border: targetResult.startsWith('⚠️') ? '1px solid #ef4444' : targetResult.startsWith('🎉') ? '1px solid #22c55e' : '1px solid #3b82f6',
                    color: targetResult.startsWith('⚠️') ? '#f87171' : targetResult.startsWith('🎉') ? '#4ade80' : '#60a5fa',
                    fontWeight: 600,
                    fontSize: '0.9rem'
                }}>
                    {targetResult}
                </div>
            )}
        </div>
    );
}
