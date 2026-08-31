'use client';

import React from 'react';

export interface DegreeCourseNode {
    code: string;
    units: number;
    prerequisites: string[];
    term?: string;
    status?: 'passed' | 'eligible' | 'blocked';
    grade?: string;
}

interface DegreeMapProps {
    courses: DegreeCourseNode[];
    completedCodes: Set<string>;
}

export function DegreeMap({ courses, completedCodes }: DegreeMapProps) {
    const hasStudentCourses = courses && courses.length > 0;

    // Use student's dynamic courses if available
    const targetNodes = hasStudentCourses ? courses : [];

    const processedNodes = targetNodes.map(node => {
        const isPassed = completedCodes.has(node.code.toUpperCase());
        const prereqsFulfilled = (node.prerequisites || []).every(p => completedCodes.has(p.toUpperCase()));
        
        let status: 'passed' | 'eligible' | 'blocked' = 'eligible';
        if (isPassed) status = 'passed';
        else if (!prereqsFulfilled) status = 'blocked';

        return { ...node, status };
    });

    // Group by term level
    const termGroups: Record<string, typeof processedNodes> = {};
    processedNodes.forEach(node => {
        const termKey = node.term || '1.1';
        if (!termGroups[termKey]) termGroups[termKey] = [];
        termGroups[termKey].push(node);
    });

    const sortedTerms = Object.keys(termGroups).sort();

    return (
        <div className="glass-card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        🗺️ Visual Degree Prerequisite Map (Contextual DAG)
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Dynamic directed acyclic graph constructed from your specific program record.
                    </p>
                </div>

                {hasStudentCourses && (
                    <div style={{ display: 'flex', gap: '14px', fontSize: '0.85rem', fontWeight: 700 }}>
                        <span style={{ color: 'var(--badge-passed-text)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            🟢 Passed ({processedNodes.filter(n => n.status === 'passed').length})
                        </span>
                        <span style={{ color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            🔵 Eligible ({processedNodes.filter(n => n.status === 'eligible').length})
                        </span>
                        <span style={{ color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            🔴 Blocked ({processedNodes.filter(n => n.status === 'blocked').length})
                        </span>
                    </div>
                )}
            </div>

            {!hasStudentCourses ? (
                <div style={{
                    textAlign: 'center',
                    padding: '48px 20px',
                    color: 'var(--text-subtle)',
                    border: '2px dashed var(--card-border)',
                    borderRadius: '16px'
                }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🗺️</div>
                    <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-muted)', fontWeight: 700 }}>No Curriculum Courses Recorded Yet</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem' }}>Add your courses in the Academic Dashboard to generate your contextual DAG degree map.</p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${Math.max(sortedTerms.length, 1)}, minmax(220px, 1fr))`,
                    gap: '16px',
                    overflowX: 'auto',
                    paddingBottom: '12px'
                }}>
                    {sortedTerms.map(term => (
                        <div key={term} style={{
                            background: 'var(--card-bg-solid)',
                            padding: '16px',
                            borderRadius: '14px',
                            border: '1px solid var(--card-border)'
                        }}>
                            <div style={{
                                fontSize: '0.85rem',
                                fontWeight: 800,
                                color: 'var(--text-muted)',
                                marginBottom: '12px',
                                paddingBottom: '6px',
                                borderBottom: '1px solid var(--card-border)'
                            }}>
                                Term {term}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {termGroups[term].map(node => (
                                    <div key={node.code} style={{
                                        padding: '12px',
                                        borderRadius: '10px',
                                        background: node.status === 'passed' ? 'var(--badge-passed-bg)' : node.status === 'blocked' ? 'rgba(244, 63, 94, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                                        border: node.status === 'passed' ? '1px solid var(--badge-passed-border)' : node.status === 'blocked' ? '1px solid rgba(244, 63, 94, 0.4)' : '1px solid rgba(59, 130, 246, 0.4)',
                                        transition: 'all 0.2s ease'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                                                {node.code}
                                            </span>
                                            <span style={{
                                                fontSize: '0.7rem',
                                                padding: '2px 6px',
                                                borderRadius: '6px',
                                                background: node.status === 'passed' ? 'var(--badge-passed-text)' : node.status === 'blocked' ? 'var(--accent-rose)' : 'var(--accent-blue)',
                                                color: '#ffffff',
                                                fontWeight: 800,
                                                textTransform: 'uppercase'
                                            }}>
                                                {node.status}
                                            </span>
                                        </div>

                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontWeight: 600 }}>
                                            {node.units} Credit Units
                                        </div>

                                        {node.prerequisites && node.prerequisites.length > 0 && (
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px', fontWeight: 600 }}>
                                                Prereqs: {node.prerequisites.join(', ')}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
