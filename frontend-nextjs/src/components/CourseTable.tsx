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
        <div className="glass-card" style={{ marginBottom: '24px' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                flexWrap: 'wrap',
                gap: '12px'
            }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    📚 Academic Record ({courses.length} Courses)
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Filter:</span>
                    <select
                        value={filterSem}
                        onChange={(e) => onFilterChange(e.target.value)}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '10px',
                            width: 'auto',
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
                    color: 'var(--text-subtle)',
                    border: '2px dashed var(--card-border)',
                    borderRadius: '16px'
                }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📭</div>
                    <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-muted)', fontWeight: 700 }}>No courses added yet</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem' }}>Select a semester and add your first course above!</p>
                </div>
            ) : (
                <div className="custom-table-container">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Term</th>
                                <th>Code</th>
                                <th>Units</th>
                                <th>Score</th>
                                <th>Grade</th>
                                <th>Points</th>
                                <th>QP</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map((c) => {
                                const qp = (c.currentPoints * c.unit).toFixed(2);
                                return (
                                    <tr key={c.id}>
                                        <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{c.semester}</td>
                                        <td style={{ fontWeight: 800, color: 'var(--text-main)' }}>{c.code}</td>
                                        <td>{c.unit}</td>
                                        <td>{c.rawScore}</td>
                                        <td>
                                            <span style={{
                                                padding: '3px 10px',
                                                borderRadius: '6px',
                                                background: c.color === '#10b981' ? 'rgba(16, 185, 129, 0.15)' : c.color === '#f59e0b' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                                                color: c.color,
                                                fontWeight: 800
                                            }}>
                                                {c.currentGrade}
                                            </span>
                                        </td>
                                        <td>{c.currentPoints}</td>
                                        <td style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>{qp}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                onClick={() => onEdit(c)}
                                                style={{
                                                    background: 'rgba(59, 130, 246, 0.15)',
                                                    color: 'var(--accent-blue)',
                                                    padding: '4px 10px',
                                                    borderRadius: '8px',
                                                    marginRight: '8px',
                                                    fontSize: '0.8rem'
                                                }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => onDelete(c.id)}
                                                style={{
                                                    background: 'rgba(244, 63, 94, 0.15)',
                                                    color: '#f43f5e',
                                                    padding: '4px 10px',
                                                    borderRadius: '8px',
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
