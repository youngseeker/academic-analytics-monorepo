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
        <form onSubmit={handleSubmit} className="glass-card" style={{ marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {editingId ? '✏️ Edit Course Record' : '➕ Add Course Record'}
            </h3>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px',
                marginBottom: '16px'
            }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 700 }}>
                        Semester / Term
                    </label>
                    <select
                        value={semester}
                        onChange={(e) => onSemesterChange(e.target.value)}
                    >
                        {semesterOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 700 }}>
                        Course Code
                    </label>
                    <input
                        type="text"
                        placeholder="e.g. CIT216"
                        value={courseCode}
                        onChange={(e) => onCodeChange(e.target.value)}
                        style={{ textTransform: 'uppercase' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 700 }}>
                        Score (0-100 or Grade)
                    </label>
                    <input
                        type="text"
                        placeholder="e.g. 75 or A"
                        value={courseScore}
                        onChange={(e) => onScoreChange(e.target.value)}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 700 }}>
                        Credit Units
                    </label>
                    <input
                        type="number"
                        placeholder="e.g. 3"
                        min="1"
                        max="6"
                        value={courseUnit}
                        onChange={(e) => onUnitChange(e.target.value)}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                {editingId && (
                    <button
                        type="button"
                        onClick={onCancelEdit}
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                )}

                <button
                    type="submit"
                    className="btn-primary"
                    style={{
                        background: 'linear-gradient(135deg, var(--accent-emerald) 0%, #059669 100%)',
                        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
                    }}
                >
                    {editingId ? 'Save Changes' : 'Add Course'}
                </button>
            </div>
        </form>
    );
}
