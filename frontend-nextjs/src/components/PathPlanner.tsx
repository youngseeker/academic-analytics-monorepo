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

        const sampleCourses = [
            { code: "MTH101", units: 3, prerequisites: [] },
            { code: "CSC101", units: 3, prerequisites: [] },
            { code: "CSC201", units: 3, prerequisites: ["CSC101", "MTH101"] },
            { code: "CSC301", units: 4, prerequisites: ["CSC201"] },
            { code: "MTH201", units: 3, prerequisites: ["MTH101"] },
            { code: "AI401", units: 4, prerequisites: ["CSC301", "MTH201"] }
        ];

        try {
            const engineUrl = process.env.NEXT_PUBLIC_ENGINE_URL || "https://academic-analytics-monorepo.onrender.com";
            const response = await fetch(`${engineUrl}/build-schedule`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    max_units_per_semester: maxUnits,
                    courses: sampleCourses
                })
            });

            if (!response.ok) throw new Error('Remote engine server offline');
            const data = await response.json();
            setOptimalPlan(data.optimal_plan || []);
        } catch (err: any) {
            // Client-Side Topological Sort Kahn's Algorithm Fallback
            console.warn("Using client-side Kahn's DAG solver fallback:", err);
            
            const graph: Record<string, string[]> = {};
            const inDegree: Record<string, number> = {};
            const unitsMap: Record<string, number> = {};

            sampleCourses.forEach(c => {
                inDegree[c.code] = 0;
                unitsMap[c.code] = c.units;
                graph[c.code] = [];
            });

            sampleCourses.forEach(c => {
                c.prerequisites.forEach(p => {
                    if (graph[p]) graph[p].push(c.code);
                    inDegree[c.code] = (inDegree[c.code] || 0) + 1;
                });
            });

            const readyQueue = sampleCourses.filter(c => inDegree[c.code] === 0).map(c => c.code);
            const plan = [];
            let currentQueue = [...readyQueue];

            while (currentQueue.length > 0) {
                let currentUnits = 0;
                const semCourses: string[] = [];
                const nextQueue: string[] = [];

                for (const code of currentQueue) {
                    const u = unitsMap[code] || 3;
                    if (currentUnits + u <= maxUnits) {
                        semCourses.push(code);
                        currentUnits += u;
                        (graph[code] || []).forEach(neighbor => {
                            inDegree[neighbor]--;
                            if (inDegree[neighbor] === 0) nextQueue.push(neighbor);
                        });
                    } else {
                        nextQueue.push(code);
                    }
                }

                if (semCourses.length > 0) {
                    plan.push({ semester_number: plan.length + 1, courses: semCourses, total_units: currentUnits });
                }
                currentQueue = nextQueue;
                if (plan.length > 10) break; // Guard
            }

            setOptimalPlan(plan);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        🧩 Algorithmic Prerequisite DAG Scheduler (Python Engine)
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Executes Kahn's Topological Sorting under semester credit unit constraints.
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Max Units/Sem:</label>
                    <input
                        type="number"
                        value={maxUnits}
                        onChange={(e) => setMaxUnits(parseInt(e.target.value) || 24)}
                        style={{
                            width: '75px',
                            padding: '8px 10px',
                            borderRadius: '10px',
                            border: '1px solid var(--input-border)',
                            background: 'var(--input-bg)',
                            color: 'var(--text-main)',
                            fontSize: '0.9rem',
                            fontWeight: 700
                        }}
                    />

                    <button
                        onClick={runEngine}
                        disabled={loading}
                        className="btn-primary"
                        style={{
                            background: 'linear-gradient(135deg, var(--accent-purple) 0%, #7c3aed 100%)',
                            boxShadow: '0 4px 14px rgba(139, 92, 246, 0.35)'
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
                    borderRadius: '10px',
                    background: 'rgba(244, 63, 94, 0.15)',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    color: '#f43f5e',
                    fontSize: '0.85rem'
                }}>
                    ⚠️ {errorMsg}
                </div>
            )}

            {optimalPlan.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: 'var(--accent-purple)', fontWeight: 700 }}>
                        Calculated Optimal Path ({optimalPlan.length} Semesters Needed):
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                        {optimalPlan.map((sem, idx) => (
                            <div key={idx} style={{
                                background: 'rgba(139, 92, 246, 0.08)',
                                padding: '14px',
                                borderRadius: '12px',
                                border: '1px solid rgba(139, 92, 246, 0.25)'
                            }}>
                                <div style={{ fontWeight: 700, color: 'var(--accent-purple)', marginBottom: '6px', fontSize: '0.85rem' }}>
                                    Semester {idx + 1} ({sem.total_units} Units)
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {sem.courses?.map((code: string) => (
                                        <span key={code} style={{
                                            background: 'rgba(139, 92, 246, 0.2)',
                                            color: 'var(--text-main)',
                                            padding: '4px 8px',
                                            borderRadius: '6px',
                                            fontSize: '0.8rem',
                                            fontWeight: 700
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
