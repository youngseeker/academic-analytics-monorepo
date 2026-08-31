'use client';

import React from 'react';

interface SemesterOption {
    value: string;
    label: string;
}

interface CourseFormProps {
    semester: string;
    courseCode: string;
    courseScore: string;
    courseUnit: string;
    editingId: string | null;
    semesterOptions: SemesterOption[];
    onSemesterChange: (val: string) => void;
    onCodeChange: (val: string) => void;
    onScoreChange: (val: string) => void;
    onUnitChange: (val: string) => void;
    onSubmit: () => void;
    onCancelEdit: () => void;
}

export function CourseForm({
    semester,
    courseCode,
    courseScore,
    courseUnit,
    editingId,
    semesterOptions,
    onSemesterChange,
    onCodeChange,
    onScoreChange,
    onUnitChange,
    onSubmit,
    onCancelEdit
}: CourseFormProps) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <form onSubmit={handleSubmit} style={{
            background: 'var(--glass-bg, rgba(15, 23, 42, 0.7))',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '24px'
        }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                {editingId ? '✏️ Edit Course Record' : '➕ Add Course Record'}
            </h3>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px',
                marginBottom: '16px'
            }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>
                        Semester / Term
                    </label>
                    <select
                        value={semester}
                        onChange={(e) => onSemesterChange(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.15)',
                            background: '#0f172a',
                            color: '#fff',
                            fontSize: '0.9rem'
                        }}
                    >
                        {semesterOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>
                        Course Code
                    </label>
                    <input
                        type="text"
                        placeholder="e.g. CIT216"
                        value={courseCode}
                        onChange={(e) => onCodeChange(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.15)',
                            background: '#0f172a',
                            color: '#fff',
                            fontSize: '0.9rem',
                            textTransform: 'uppercase',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>
                        Score (0-100 or Grade)
                    </label>
                    <input
                        type="text"
                        placeholder="e.g. 75 or A"
                        value={courseScore}
                        onChange={(e) => onScoreChange(e.target.value)}
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
                        Credit Units
                    </label>
                    <input
                        type="number"
                        placeholder="e.g. 3"
                        min="1"
                        max="6"
                        value={courseUnit}
                        onChange={(e) => onUnitChange(e.target.value)}
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
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                {editingId && (
                    <button
                        type="button"
                        onClick={onCancelEdit}
                        style={{
                            padding: '10px 18px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.2)',
                            background: 'transparent',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            fontWeight: 600
                        }}
                    >
                        Cancel
                    </button>
                )}

                <button
                    type="submit"
                    style={{
                        padding: '10px 24px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: '#fff',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                    }}
                >
                    {editingId ? 'Save Changes' : 'Add Course'}
                </button>
            </div>
        </form>
    );
}
