'use client';

import React, { useState } from 'react';

interface OnboardingWizardProps {
    onComplete: (profileData: {
        name: string;
        school: string;
        system: string;
        duration: number;
        term: number;
    }) => void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [school, setSchool] = useState('');
    const [system, setSystem] = useState('5.0_ng');
    const [duration, setDuration] = useState(4);
    const [term, setTerm] = useState(2);

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
        else {
            onComplete({
                name,
                school,
                system,
                duration: Number(duration),
                term: Number(term)
            });
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(16px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '24px',
                padding: '40px',
                maxWidth: '520px',
                width: '100%',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                color: '#f8fafc'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#60a5fa', fontWeight: 700, textTransform: 'uppercase' }}>
                        Step {step} of 3 • Global Setup
                    </span>
                    <span style={{ fontSize: '1.5rem' }}>🌐</span>
                </div>

                {step === 1 && (
                    <div>
                        <h2 style={{ margin: '0 0 8px 0', fontSize: '1.8rem', fontWeight: 800 }}>Welcome to Student OS</h2>
                        <p style={{ margin: '0 0 24px 0', color: '#94a3b8', fontSize: '0.95rem' }}>
                            Let's set up your profile and institution preferences.
                        </p>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                                Full Name
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Adeyemi Adeniji"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: '#0f172a', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box' }}
                            />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                                Institution / University
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. National Open University of Nigeria"
                                value={school}
                                onChange={(e) => setSchool(e.target.value)}
                                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: '#0f172a', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <h2 style={{ margin: '0 0 8px 0', fontSize: '1.8rem', fontWeight: 800 }}>Grading System</h2>
                        <p style={{ margin: '0 0 24px 0', color: '#94a3b8', fontSize: '0.95rem' }}>
                            Select your region's official academic grading scale.
                        </p>

                        <div style={{ marginBottom: '24px' }}>
                            <select
                                value={system}
                                onChange={(e) => setSystem(e.target.value)}
                                style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid rgba(59, 130, 246, 0.4)', background: '#0f172a', color: '#fff', fontSize: '1rem' }}
                            >
                                <option value="5.0_ng">Nigeria / Africa Standard (5.0 Scale: A, B, C...)</option>
                                <option value="7.0_special">UI / Postgraduate Standard (7.0 Scale)</option>
                                <option value="4.0_poly">Polytechnic Standard (4.0 Scale: A, AB, B...)</option>
                                <option value="4.0_us">North America / US Standard (4.0 Scale: A, B, C...)</option>
                                <option value="4.0_uk">United Kingdom / EU Standard (1st, 2:1, 2:2...)</option>
                                <option value="10.0">India Standard (10.0 CGPA Scale: O, A+, A...)</option>
                            </select>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div>
                        <h2 style={{ margin: '0 0 8px 0', fontSize: '1.8rem', fontWeight: 800 }}>Degree Duration</h2>
                        <p style={{ margin: '0 0 24px 0', color: '#94a3b8', fontSize: '0.95rem' }}>
                            Configure your program length and semester structure.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                                    Program Duration (Years)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="7"
                                    value={duration}
                                    onChange={(e) => setDuration(Number(e.target.value))}
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: '#0f172a', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                                    Terms per Year
                                </label>
                                <select
                                    value={term}
                                    onChange={(e) => setTerm(Number(e.target.value))}
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: '#0f172a', color: '#fff', fontSize: '0.95rem' }}
                                >
                                    <option value={2}>2 Semesters / Year</option>
                                    <option value={3}>3 Trimesters / Year</option>
                                    <option value={4}>4 Quarters / Year</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    {step > 1 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            style={{ padding: '12px 20px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontWeight: 600 }}
                        >
                            Back
                        </button>
                    )}

                    <button
                        onClick={handleNext}
                        style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)' }}
                    >
                        {step === 3 ? 'Complete Setup 🚀' : 'Next Step'}
                    </button>
                </div>
            </div>
        </div>
    );
}
