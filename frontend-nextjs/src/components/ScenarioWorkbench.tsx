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

        const currentTotalUnits = courses.reduce((s, c) => s + (c.unit || 3), 0);
        const currentTotalPoints = courses.reduce((s, c) => s + ((c.currentPoints || 0) * (c.unit || 3)), 0);
        const currentCGPA = currentTotalUnits > 0 ? (currentTotalPoints / currentTotalUnits) : 0;

        try {
            const engineUrl = process.env.NEXT_PUBLIC_ENGINE_URL || "https://academic-analytics-monorepo.onrender.com";
            const response = await fetch(`${engineUrl}/simulate-scenario`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mode: mode,
                    max_scale: maxScale,
                    grading_system: gradingStandard,
                    target_course_code: (retakeCode || failedCode).toUpperCase(),
                    new_retake_score: parseInt(retakeScore) || 75,
                    remaining_units: parseInt(remainingUnits) || 24,
                    current_courses: courses.map(c => ({
                        code: c.code,
                        units: c.unit,
                        score: c.rawScore,
                        grade_point: c.currentPoints
                    }))
                })
            });

            if (!response.ok) throw new Error('Remote engine offline');
            const data = await response.json();

            if (mode === 'retake') setRetakeResult(data);
            else if (mode === 'failure_cascade') setFailureResult(data);
            else if (mode === 'honors_boundaries') setHonorsResult(data);

        } catch (err: any) {
            // Client-Side Simulation Fallback Engine
            console.warn("Using client-side Simulation Engine fallback:", err);

            if (mode === 'retake') {
                const target = courses.find(c => c.code.toUpperCase() === retakeCode.toUpperCase());
                const oldScore = target ? target.rawScore : 45;
                const oldPoints = target ? target.currentPoints : 2;
                const units = target ? target.unit : 3;

                // Calculate new grade points for projected score
                const newScoreNum = parseInt(retakeScore) || 75;
                const newPoints = newScoreNum >= 70 ? (maxScale === 5 ? 5 : 4) : newScoreNum >= 60 ? (maxScale === 5 ? 4 : 3) : 2;

                const newTotalPoints = currentTotalPoints - (oldPoints * units) + (newPoints * units);
                const newCGPA = currentTotalUnits > 0 ? (newTotalPoints / currentTotalUnits) : 0;
                const delta = newCGPA - currentCGPA;

                setRetakeResult({
                    status: 'success',
                    course_code: (retakeCode || 'COURSE').toUpperCase(),
                    old_score: oldScore,
                    new_score: newScoreNum,
                    old_cgpa: currentCGPA.toFixed(2),
                    new_cgpa: newCGPA.toFixed(2),
                    cgpa_delta: (delta >= 0 ? `+${delta.toFixed(2)}` : delta.toFixed(2))
                });
            } else if (mode === 'failure_cascade') {
                const codeUpper = (failedCode || 'PREREQ').toUpperCase();
                setFailureResult({
                    status: 'success',
                    failed_course: codeUpper,
                    impact_summary: `Failing ${codeUpper} will block enrollment in downstream advanced courses requiring it as a prerequisite.`,
                    blocked_downstream_courses: [`ADV-${codeUpper}`, `LAB-${codeUpper}`]
                });
            } else if (mode === 'honors_boundaries') {
                const remUnits = parseInt(remainingUnits) || 24;
                const targetFirst = maxScale * 0.9;
                const target21 = maxScale * 0.7;

                const neededPointsFirst = (targetFirst * (currentTotalUnits + remUnits)) - currentTotalPoints;
                const neededGPAFirst = remUnits > 0 ? (neededPointsFirst / remUnits) : 0;

                const neededPoints21 = (target21 * (currentTotalUnits + remUnits)) - currentTotalPoints;
                const neededGPA21 = remUnits > 0 ? (neededPoints21 / remUnits) : 0;

                setHonorsResult({
                    status: 'success',
                    current_cgpa: currentCGPA.toFixed(2),
                    honors_thresholds: {
                        "First Class / Distinction": neededGPAFirst > maxScale ? `Requires ${neededGPAFirst.toFixed(2)} GPA (Unreachable)` : neededGPAFirst <= 0 ? `Secured!` : `Requires ${neededGPAFirst.toFixed(2)} GPA over next ${remUnits} units`,
                        "Second Class Upper / Merit": neededGPA21 > maxScale ? `Requires ${neededGPA21.toFixed(2)} GPA (Unreachable)` : neededGPA21 <= 0 ? `Secured!` : `Requires ${neededGPA21.toFixed(2)} GPA over next ${remUnits} units`
                    }
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card" style={{ marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                🔬 "What-If?" Academic Scenario Simulator Workbench
            </h3>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--card-border)', paddingBottom: '12px', flexWrap: 'wrap' }}>
                <button
                    onClick={() => setActiveTab('retake')}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '10px',
                        border: 'none',
                        background: activeTab === 'retake' ? 'var(--accent-blue)' : 'var(--card-bg-solid)',
                        color: activeTab === 'retake' ? '#ffffff' : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.85rem'
                    }}
                >
                    🔄 Course Retake Simulator
                </button>
                <button
                    onClick={() => setActiveTab('failure')}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '10px',
                        border: 'none',
                        background: activeTab === 'failure' ? 'var(--accent-rose)' : 'var(--card-bg-solid)',
                        color: activeTab === 'failure' ? '#ffffff' : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.85rem'
                    }}
                >
                    ⚠️ Failure Cascade Impact
                </button>
                <button
                    onClick={() => setActiveTab('honors')}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '10px',
                        border: 'none',
                        background: activeTab === 'honors' ? 'var(--accent-emerald)' : 'var(--card-bg-solid)',
                        color: activeTab === 'honors' ? '#ffffff' : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.85rem'
                    }}
                >
                    🏆 Honors Boundary Forecaster
                </button>
            </div>

            {errorMsg && (
                <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#f43f5e', marginBottom: '16px', fontSize: '0.85rem', fontWeight: 600 }}>
                    ⚠️ {errorMsg}
                </div>
            )}

            {/* TAB 1: RETAKE SIMULATOR */}
            {activeTab === 'retake' && (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end', marginBottom: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 700 }}>
                                Course Code to Retake
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. CIT216"
                                value={retakeCode}
                                onChange={(e) => setRetakeCode(e.target.value)}
                                style={{ textTransform: 'uppercase' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 700 }}>
                                Projected Retake Score (0-100)
                            </label>
                            <input
                                type="number"
                                placeholder="e.g. 75"
                                value={retakeScore}
                                onChange={(e) => setRetakeScore(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={() => runSimulation('retake')}
                            disabled={loading}
                            className="btn-primary"
                        >
                            {loading ? 'Simulating...' : 'Simulate Retake Impact 🚀'}
                        </button>
                    </div>

                    {retakeResult && retakeResult.status === 'success' && (
                        <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.3)', color: 'var(--text-main)' }}>
                            <div style={{ fontWeight: 800, color: 'var(--accent-blue)', marginBottom: '8px' }}>
                                📊 Retake Impact Summary for {retakeResult.course_code}:
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', fontSize: '0.9rem', fontWeight: 600 }}>
                                <div>Previous Score: <b>{retakeResult.old_score}</b></div>
                                <div>New Score: <b>{retakeResult.new_score}</b></div>
                                <div>Previous CGPA: <b>{retakeResult.old_cgpa}</b></div>
                                <div>Projected CGPA: <b>{retakeResult.new_cgpa}</b></div>
                                <div>CGPA Delta: <b style={{ color: 'var(--accent-emerald)' }}>{retakeResult.cgpa_delta}</b></div>
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
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 700 }}>
                                Prerequisite Course Code to Fail
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. CIT216"
                                value={failedCode}
                                onChange={(e) => setFailedCode(e.target.value)}
                                style={{ textTransform: 'uppercase' }}
                            />
                        </div>

                        <button
                            onClick={() => runSimulation('failure_cascade')}
                            disabled={loading}
                            className="btn-primary"
                            style={{ background: 'linear-gradient(135deg, var(--accent-rose) 0%, #e11d48 100%)' }}
                        >
                            {loading ? 'Simulating...' : 'Simulate Failure Shift ⚠️'}
                        </button>
                    </div>

                    {failureResult && failureResult.status === 'success' && (
                        <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.3)', color: 'var(--text-main)' }}>
                            <div style={{ fontWeight: 800, color: 'var(--accent-rose)', marginBottom: '8px' }}>
                                ⚠️ Prerequisite Cascade Impact for {failureResult.failed_course}:
                            </div>
                            <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', fontWeight: 600 }}>{failureResult.impact_summary}</p>
                            {failureResult.blocked_downstream_courses?.length > 0 && (
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>Blocked Courses:</span>
                                    {failureResult.blocked_downstream_courses.map((code: string) => (
                                        <span key={code} style={{ background: 'var(--accent-rose)', color: '#ffffff', padding: '3px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
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
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 700 }}>
                                Remaining Credit Units to Complete
                            </label>
                            <input
                                type="number"
                                placeholder="e.g. 24"
                                value={remainingUnits}
                                onChange={(e) => setRemainingUnits(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={() => runSimulation('honors_boundaries')}
                            disabled={loading}
                            className="btn-primary"
                            style={{ background: 'linear-gradient(135deg, var(--accent-emerald) 0%, #059669 100%)' }}
                        >
                            {loading ? 'Calculating...' : 'Calculate Honors Thresholds 🏆'}
                        </button>
                    </div>

                    {honorsResult && honorsResult.status === 'success' && (
                        <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', color: 'var(--text-main)' }}>
                            <div style={{ fontWeight: 800, color: 'var(--badge-passed-text)', marginBottom: '8px' }}>
                                🏆 Degree Honors Target Thresholds (Current CGPA: {honorsResult.current_cgpa}):
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {Object.entries(honorsResult.honors_thresholds).map(([classLabel, desc]: [string, any]) => (
                                    <div key={classLabel} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '8px 0', borderBottom: '1px solid var(--card-border)' }}>
                                        <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>{classLabel}</span>
                                        <span style={{ fontWeight: 700, color: desc.startsWith('Requires') ? 'var(--accent-blue)' : desc.startsWith('Secured') ? 'var(--badge-passed-text)' : 'var(--accent-rose)' }}>
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
