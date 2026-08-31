'use client';

import React, { useState } from 'react';

interface ScenarioWorkbenchProps {
    courses: any[];
    maxScale: number;
    gradingStandard: string;
}

export function ScenarioWorkbench({ courses, maxScale, gradingStandard }: ScenarioWorkbenchProps) {
    const [activeTab, setActiveTab] = useState<'retake' | 'failure' | 'honors'>('retake');

    // Retake Form
    const [retakeCode, setRetakeCode] = useState('');
    const [retakeScore, setRetakeScore] = useState('');
    const [retakeResult, setRetakeResult] = useState<any>(null);

    // Failure Form
    const [failedCode, setFailedCode] = useState('');
    const [failureResult, setFailureResult] = useState<any>(null);

    // Honors Form
    const [remainingUnits, setRemainingUnits] = useState('24');
    const [honorsResult, setHonorsResult] = useState<any>(null);

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const runSimulation = async (mode: 'retake' | 'failure_cascade' | 'honors_boundaries') => {
        setLoading(true);
        setErrorMsg('');

        try {
            const bodyPayload: any = {
                mode: mode,
                max_scale: maxScale,
                grading_system: gradingStandard,
                current_courses: courses.map(c => ({
                    code: c.code,
                    units: c.unit,
                    score: c.rawScore,
                    grade_point: c.currentPoints
                }))
            };

            if (mode === 'retake') {
                bodyPayload.target_course_code = retakeCode.toUpperCase();
                bodyPayload.new_retake_score = parseInt(retakeScore) || 75;
            } else if (mode === 'failure_cascade') {
                bodyPayload.target_course_code = failedCode.toUpperCase();
                bodyPayload.curriculum_catalog = [
                    { code: "MTH101", units: 3, prerequisites: [] },
                    { code: "CSC101", units: 3, prerequisites: [] },
                    { code: "CIT216", units: 3, prerequisites: ["CSC101"] },
                    { code: "MTH201", units: 3, prerequisites: ["MTH101"] },
                    { code: "CIT304", units: 3, prerequisites: ["CIT216"] },
                    { code: "CIT427", units: 4, prerequisites: ["CIT304", "MTH201"] }
                ];
            } else if (mode === 'honors_boundaries') {
                bodyPayload.remaining_units = parseInt(remainingUnits) || 24;
            }

            const response = await fetch("http://localhost:8000/simulate-scenario", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyPayload)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || 'Simulation request failed');
            }

            const data = await response.json();

            if (mode === 'retake') setRetakeResult(data);
            else if (mode === 'failure_cascade') setFailureResult(data);
            else if (mode === 'honors_boundaries') setHonorsResult(data);

        } catch (err: any) {
            console.error("Scenario simulation error:", err);
            setErrorMsg(err.message || "Failed to reach simulation engine on port 8000.");
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
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                🔬 "What-If?" Academic Scenario Simulator Workbench
            </h3>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
                <button
                    onClick={() => setActiveTab('retake')}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        background: activeTab === 'retake' ? '#3b82f6' : 'rgba(255,255,255,0.05)',
                        color: activeTab === 'retake' ? '#fff' : '#94a3b8',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.85rem'
                    }}
                >
                    🔄 Course Retake Simulator
                </button>
                <button
                    onClick={() => setActiveTab('failure')}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        background: activeTab === 'failure' ? '#ef4444' : 'rgba(255,255,255,0.05)',
                        color: activeTab === 'failure' ? '#fff' : '#94a3b8',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.85rem'
                    }}
                >
                    ⚠️ Failure Cascade Impact
                </button>
                <button
                    onClick={() => setActiveTab('honors')}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        background: activeTab === 'honors' ? '#10b981' : 'rgba(255,255,255,0.05)',
                        color: activeTab === 'honors' ? '#fff' : '#94a3b8',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.85rem'
                    }}
                >
                    🏆 Honors Boundary Forecaster
                </button>
            </div>

            {errorMsg && (
                <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#f87171', marginBottom: '16px', fontSize: '0.85rem' }}>
                    ⚠️ {errorMsg}
                </div>
            )}

            {/* TAB 1: RETAKE SIMULATOR */}
            {activeTab === 'retake' && (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end', marginBottom: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>
                                Course Code to Retake
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. CIT216"
                                value={retakeCode}
                                onChange={(e) => setRetakeCode(e.target.value)}
                                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: '#0f172a', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>
                                Projected Retake Score (0-100)
                            </label>
                            <input
                                type="number"
                                placeholder="e.g. 75"
                                value={retakeScore}
                                onChange={(e) => setRetakeScore(e.target.value)}
                                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: '#0f172a', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' }}
                            />
                        </div>

                        <button
                            onClick={() => runSimulation('retake')}
                            disabled={loading}
                            style={{ padding: '12px 20px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}
                        >
                            {loading ? 'Simulating...' : 'Simulate Retake Impact 🚀'}
                        </button>
                    </div>

                    {retakeResult && retakeResult.status === 'success' && (
                        <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.12)', border: '1px solid #3b82f6', color: '#f8fafc' }}>
                            <div style={{ fontWeight: 700, color: '#60a5fa', marginBottom: '8px' }}>
                                📊 Retake Impact Summary for {retakeResult.course_code}:
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', fontSize: '0.9rem' }}>
                                <div>Previous Score: <b>{retakeResult.old_score}</b></div>
                                <div>New Score: <b>{retakeResult.new_score}</b></div>
                                <div>Previous CGPA: <b>{retakeResult.old_cgpa}</b></div>
                                <div>Projected CGPA: <b>{retakeResult.new_cgpa}</b></div>
                                <div>CGPA Delta: <b style={{ color: retakeResult.cgpa_delta >= 0 ? '#4ade80' : '#f87171' }}>{retakeResult.cgpa_delta >= 0 ? `+${retakeResult.cgpa_delta}` : retakeResult.cgpa_delta}</b></div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: FAILURE CASCADE SIMULATOR */}
            {activeTab === 'failure' && (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', alignItems: 'end', marginBottom: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>
                                Prerequisite Course Code to Fail
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. CIT216"
                                value={failedCode}
                                onChange={(e) => setFailedCode(e.target.value)}
                                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: '#0f172a', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' }}
                            />
                        </div>

                        <button
                            onClick={() => runSimulation('failure_cascade')}
                            disabled={loading}
                            style={{ padding: '12px 20px', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}
                        >
                            {loading ? 'Simulating...' : 'Simulate Failure Shift ⚠️'}
                        </button>
                    </div>

                    {failureResult && failureResult.status === 'success' && (
                        <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid #ef4444', color: '#f8fafc' }}>
                            <div style={{ fontWeight: 700, color: '#f87171', marginBottom: '8px' }}>
                                ⚠️ Prerequisite Cascade Impact for {failureResult.failed_course}:
                            </div>
                            <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem' }}>{failureResult.impact_summary}</p>
                            {failureResult.blocked_downstream_courses?.length > 0 && (
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Blocked Courses:</span>
                                    {failureResult.blocked_downstream_courses.map((code: string) => (
                                        <span key={code} style={{ background: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                                            {code}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 3: HONORS BOUNDARY FORECASTER */}
            {activeTab === 'honors' && (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', alignItems: 'end', marginBottom: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>
                                Remaining Credit Units to Complete
                            </label>
                            <input
                                type="number"
                                placeholder="e.g. 24"
                                value={remainingUnits}
                                onChange={(e) => setRemainingUnits(e.target.value)}
                                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: '#0f172a', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' }}
                            />
                        </div>

                        <button
                            onClick={() => runSimulation('honors_boundaries')}
                            disabled={loading}
                            style={{ padding: '12px 20px', borderRadius: '8px', border: 'none', background: '#10b981', color: '#fff', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}
                        >
                            {loading ? 'Calculating...' : 'Calculate Honors Thresholds 🏆'}
                        </button>
                    </div>

                    {honorsResult && honorsResult.status === 'success' && (
                        <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid #10b981', color: '#f8fafc' }}>
                            <div style={{ fontWeight: 700, color: '#34d399', marginBottom: '8px' }}>
                                🏆 Degree Honors Target Thresholds (Current CGPA: {honorsResult.current_cgpa}):
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {Object.entries(honorsResult.honors_thresholds).map(([classLabel, desc]: [string, any]) => (
                                    <div key={classLabel} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <span style={{ fontWeight: 700, color: '#f8fafc' }}>{classLabel}</span>
                                        <span style={{ color: desc.startsWith('Requires') ? '#60a5fa' : desc.startsWith('Secured') ? '#4ade80' : '#f87171' }}>
                                            {desc}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
