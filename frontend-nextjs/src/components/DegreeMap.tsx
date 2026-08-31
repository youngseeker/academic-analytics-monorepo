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
    const defaultCatalog: DegreeCourseNode[] = courses.length > 0 ? courses : [
        { code: 'MTH101', units: 3, prerequisites: [], term: '1.1' },
        { code: 'CSC101', units: 3, prerequisites: [], term: '1.1' },
        { code: 'CIT216', units: 3, prerequisites: ['CSC101'], term: '1.2' },
        { code: 'MTH201', units: 3, prerequisites: ['MTH101'], term: '2.1' },
        { code: 'CIT304', units: 3, prerequisites: ['CIT216'], term: '2.2' },
        { code: 'CIT427', units: 4, prerequisites: ['CIT304', 'MTH201'], term: '3.1' }
    ];

    const processedNodes = defaultCatalog.map(node => {
        const isPassed = completedCodes.has(node.code.toUpperCase());
        const prereqsFulfilled = node.prerequisites.every(p => completedCodes.has(p.toUpperCase()));
        
        let status: 'passed' | 'eligible' | 'blocked' = 'eligible';
        if (isPassed) status = 'passed';
        else if (!prereqsFulfilled) status = 'blocked';

        return { ...node, status };
    });

    // Group by term level
    const termGroups: Record<string, DegreeCourseNode[]> = {};
    processedNodes.forEach(node => {
        const termKey = node.term || '1.1';
        if (!termGroups[termKey]) termGroups[termKey] = [];
        termGroups[termKey].push(node);
    });

    const sortedTerms = Object.keys(termGroups).sort();

    return (
        <div style={{
            background: 'var(--glass-bg, rgba(15, 23, 42, 0.7))',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '24px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                        🗺️ Visual Degree Prerequisite Map (DAG Topology)
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                        Real-time directed acyclic graph mapping course dependency constraints.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem' }}>
                    <span style={{ color: '#4ade80', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        🟢 Passed
                    </span>
                    <span style={{ color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        🔵 Eligible
                    </span>
                    <span style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        🔴 Blocked
                    </span>
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.max(sortedTerms.length, 1)}, minmax(220px, 1fr))`,
                gap: '16px',
                overflowX: 'auto',
                paddingBottom: '12px'
            }}>
                {sortedTerms.map(term => (
                    <div key={term} style={{
                        background: 'rgba(15, 23, 42, 0.8)',
                        padding: '16px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.06)'
                    }}>
                        <div style={{
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: '#94a3b8',
                            marginBottom: '12px',
                            paddingBottom: '6px',
                            borderBottom: '1px solid rgba(255,255,255,0.08)'
                        }}>
                            Term {term}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {termGroups[term].map(node => (
                                <div key={node.code} style={{
                                    padding: '12px',
                                    borderRadius: '8px',
                                    background: node.status === 'passed' ? 'rgba(34, 197, 94, 0.12)' : node.status === 'blocked' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                                    border: node.status === 'passed' ? '1px solid #22c55e' : node.status === 'blocked' ? '1px solid #ef4444' : '1px solid #3b82f6',
                                    transition: 'all 0.2s ease'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                        <span style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.95rem' }}>
                                            {node.code}
                                        </span>
                                        <span style={{
                                            fontSize: '0.7rem',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            background: node.status === 'passed' ? '#22c55e' : node.status === 'blocked' ? '#ef4444' : '#3b82f6',
                                            color: '#fff',
                                            fontWeight: 700,
                                            textTransform: 'uppercase'
                                        }}>
                                            {node.status}
                                        </span>
                                    </div>

                                    <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                                        {node.units} Credit Units
                                    </div>

                                    {node.prerequisites.length > 0 && (
                                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '6px' }}>
                                            Prereqs: {node.prerequisites.join(', ')}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
