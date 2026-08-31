'use client';

import React from 'react';

interface NavbarProps {
    studentName: string;
    studentSchool: string;
    user: any;
    syncStatus: string;
    onLogout: () => void;
    onLoginClick: () => void;
    onPrivacyClick: () => void;
}

export function Navbar({
    studentName,
    studentSchool,
    user,
    syncStatus,
    onLogout,
    onLoginClick,
    onPrivacyClick
}: NavbarProps) {
    return (
        <header style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 28px',
            background: 'var(--glass-bg, rgba(15, 23, 42, 0.85))',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '24px',
            borderRadius: '16px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.8rem' }}>🎓</span>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
                        My Student OS <span style={{ fontSize: '0.75rem', background: '#3b82f6', padding: '2px 8px', borderRadius: '12px', color: '#fff', verticalAlign: 'middle' }}>V2 Platform</span>
                    </h1>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                        {studentName ? `${studentName} ${studentSchool ? `• ${studentSchool}` : ''}` : 'Academic Decision Platform'}
                    </p>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                    onClick={onPrivacyClick}
                    style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#94a3b8',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600
                    }}
                >
                    🔒 Privacy
                </button>

                {user && (
                    <span style={{
                        fontSize: '0.8rem',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        background: syncStatus === 'Saved ☁️' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                        border: syncStatus === 'Saved ☁️' ? '1px solid #22c55e' : '1px solid #3b82f6',
                        color: syncStatus === 'Saved ☁️' ? '#4ade80' : '#60a5fa',
                        fontWeight: 600
                    }}>
                        {syncStatus}
                    </span>
                )}

                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{user.email}</span>
                        <button
                            onClick={onLogout}
                            style={{
                                background: 'rgba(239, 68, 68, 0.15)',
                                border: '1px solid #ef4444',
                                color: '#f87171',
                                padding: '6px 14px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: 600
                            }}
                        >
                            Sign Out
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={onLoginClick}
                        style={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            border: 'none',
                            color: '#fff',
                            padding: '8px 18px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                        }}
                    >
                        Sign In / Cloud Sync
                    </button>
                )}
            </div>
        </header>
    );
}
