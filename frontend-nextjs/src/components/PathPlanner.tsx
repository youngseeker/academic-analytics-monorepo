'use client';

import React, { useState } from 'react';

export function PathPlanner() {
    const [loading, setLoading] = useState(false);
    const [optimalPlan, setOptimalPlan] = useState<any[]>([]);
    const [maxUnits, setMaxUnits] = useState(24);
    const [errorMsg, setErrorMsg] = useState('');

    const runEngine = async () => {
        setLoading(true);
        setErrorMsg('');
        setOptimalPlan([]);

        try {
            const response = await fetch("http://localhost:8000/build-schedule", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    max_units_per_semester: maxUnits,
                    courses: [
                        { code: "MTH101", units: 3, prerequisites: [] },
                        { code: "CSC101", units: 3, prerequisites: [] },
                        { code: "CSC201", units: 3, prerequisites: ["CSC101", "MTH101"] },
                        { code: "CSC301", units: 4, prerequisites: ["CSC201"] },
                        { code: "MTH201", units: 3, prerequisites: ["MTH101"] },
                        { code: "AI401", units: 4, prerequisites: ["CSC301", "MTH201"] }
                    ]
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || 'Engine request failed');
            }

            const data = await response.json();
            setOptimalPlan(data.optimal_plan || []);
        } catch (err: any) {
            console.error("Failed to reach Python engine:", err);
            setErrorMsg(err.message || "Could not connect to Python backend on port 8000.");
        } finally {
            setLoading(false);
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                        🧩 Algorithmic Prerequisite DAG Scheduler (Python Engine)
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                        Executes Kahn's Topological Sorting under semester credit unit constraints.
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Max Units/Sem:</label>
                    <input
                        type="number"
                        value={maxUnits}
                        onChange={(e) => setMaxUnits(parseInt(e.target.value) || 24)}
                        style={{
                            width: '70px',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid rgba(255,255,255,0.15)',
                            background: '#0f172a',
                            color: '#fff',
                            fontSize: '0.85rem'
                        }}
                    />

                    <button
                        onClick={runEngine}
                        disabled={loading}
                        style={{
                            padding: '10px 18px',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                            color: '#fff',
                            fontWeight: 700,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                        }}
                    >
                        {loading ? 'Computing DAG...' : 'Run DSA Scheduler 🚀'}
                    </button>
                </div>
            </div>

            {errorMsg && (
                <div style={{
                    marginTop: '16px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid #ef4444',
                    color: '#f87171',
                    fontSize: '0.85rem'
                }}>
                    ⚠️ {errorMsg}
                </div>
            )}

            {optimalPlan.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: '#a78bfa' }}>
                        Calculated Optimal Path ({optimalPlan.length} Semesters Needed):
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                        {optimalPlan.map((sem, idx) => (
                            <div key={idx} style={{
                                background: 'rgba(15, 23, 42, 0.8)',
                                padding: '14px',
                                borderRadius: '10px',
                                border: '1px solid rgba(139, 92, 246, 0.2)'
                            }}>
                                <div style={{ fontWeight: 700, color: '#c4b5fd', marginBottom: '6px', fontSize: '0.85rem' }}>
                                    Semester {idx + 1} ({sem.total_units} Units)
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {sem.courses?.map((code: string) => (
                                        <span key={code} style={{
                                            background: 'rgba(139, 92, 246, 0.2)',
                                            color: '#e9d5ff',
                                            padding: '4px 8px',
                                            borderRadius: '6px',
                                            fontSize: '0.8rem',
                                            fontWeight: 600
                                        }}>
                                            {code}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
