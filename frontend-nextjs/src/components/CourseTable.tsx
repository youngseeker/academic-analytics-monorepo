'use client';

import React from 'react';

export interface CalculatedCourse {
    id: string;
    semester: string;
    code: string;
    rawScore: number;
    unit: number;
    currentGrade: string;
    currentPoints: number;
    color: string;
}

interface SemesterOption {
    value: string;
    label: string;
}

interface CourseTableProps {
    courses: CalculatedCourse[];
    filterSem: string;
    semesterOptions: SemesterOption[];
    onFilterChange: (val: string) => void;
    onEdit: (course: CalculatedCourse) => void;
    onDelete: (id: string) => void;
}

export function CourseTable({
    courses,
    filterSem,
    semesterOptions,
    onFilterChange,
    onEdit,
    onDelete
}: CourseTableProps) {
    return (
        <div style={{
            background: 'var(--glass-bg, rgba(15, 23, 42, 0.7))',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '24px',
            marginBottom: '24px'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '12px'
            }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                    📚 Academic Record ({courses.length} Courses)
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Filter:</span>
                    <select
                        value={filterSem}
                        onChange={(e) => onFilterChange(e.target.value)}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.15)',
                            background: '#0f172a',
                            color: '#fff',
                            fontSize: '0.85rem'
                        }}
                    >
                        <option value="all">Show All Semesters</option>
                        {semesterOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {courses.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '48px 20px',
                    color: '#64748b',
                    border: '2px dashed rgba(255,255,255,0.08)',
                    borderRadius: '12px'
                }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📭</div>
                    <h4 style={{ margin: '0 0 4px 0', color: '#94a3b8' }}>No courses added yet</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem' }}>Select a semester and add your first course above!</p>
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        textAlign: 'left',
                        fontSize: '0.9rem'
                    }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                                <th style={{ padding: '12px 8px' }}>Term</th>
                                <th style={{ padding: '12px 8px' }}>Code</th>
                                <th style={{ padding: '12px 8px' }}>Units</th>
                                <th style={{ padding: '12px 8px' }}>Score</th>
                                <th style={{ padding: '12px 8px' }}>Grade</th>
                                <th style={{ padding: '12px 8px' }}>Points</th>
                                <th style={{ padding: '12px 8px' }}>QP</th>
                                <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map((c) => {
                                const qp = (c.currentPoints * c.unit).toFixed(2);
                                return (
                                    <tr key={c.id} style={{
                                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                                        transition: 'background 0.2s'
                                    }}>
                                        <td style={{ padding: '12px 8px', color: '#cbd5e1' }}>{c.semester}</td>
                                        <td style={{ padding: '12px 8px', fontWeight: 700, color: '#f8fafc' }}>{c.code}</td>
                                        <td style={{ padding: '12px 8px', color: '#cbd5e1' }}>{c.unit}</td>
                                        <td style={{ padding: '12px 8px', color: '#cbd5e1' }}>{c.rawScore}</td>
                                        <td style={{ padding: '12px 8px', fontWeight: 800, color: c.color }}>{c.currentGrade}</td>
                                        <td style={{ padding: '12px 8px', color: '#cbd5e1' }}>{c.currentPoints}</td>
                                        <td style={{ padding: '12px 8px', color: '#60a5fa', fontWeight: 600 }}>{qp}</td>
                                        <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                                            <button
                                                onClick={() => onEdit(c)}
                                                style={{
                                                    background: 'rgba(59, 130, 246, 0.15)',
                                                    border: 'none',
                                                    color: '#60a5fa',
                                                    padding: '4px 10px',
                                                    borderRadius: '6px',
                                                    marginRight: '8px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.8rem'
                                                }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => onDelete(c.id)}
                                                style={{
                                                    background: 'rgba(239, 68, 68, 0.15)',
                                                    border: 'none',
                                                    color: '#f87171',
                                                    padding: '4px 10px',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.8rem'
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
