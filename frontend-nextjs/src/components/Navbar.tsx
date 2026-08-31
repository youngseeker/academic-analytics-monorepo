'use client';

import React from 'react';

interface NavbarProps {
    studentName: string;
    studentSchool: string;
    user: any;
    syncStatus: string;
    theme: 'dark' | 'light';
    onToggleTheme: () => void;
    onLogout: () => void;
    onLoginClick: () => void;
    onPrivacyClick: () => void;
}

export function Navbar({
    studentName,
    studentSchool,
    user,
    syncStatus,
    theme,
    onToggleTheme,
    onLogout,
    onLoginClick,
    onPrivacyClick
}: NavbarProps) {
    return (
        <header className="glass-card" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            marginBottom: '24px',
            borderRadius: '20px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.4)'
                }}>
                    🎓
                </div>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        My Student OS
                        <span style={{
                            fontSize: '0.7rem',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            color: '#ffffff',
                            padding: '2px 8px',
                            borderRadius: '20px',
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase'
                        }}>
                            V2 Platform
                        </span>
                    </h1>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {studentName ? `${studentName} ${studentSchool ? `• ${studentSchool}` : ''}` : 'Academic Decision Platform'}
                    </p>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Light / Dark Mode Toggle Pill */}
                <button
                    onClick={onToggleTheme}
                    className="btn-secondary"
                    style={{
                        padding: '8px 14px',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: 600
                    }}
                    title="Toggle Theme"
                >
                    {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
                </button>

                <button
                    onClick={onPrivacyClick}
                    className="btn-secondary"
                    style={{
                        padding: '8px 14px',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: 600
                    }}
                >
                    🔒 Privacy
                </button>

                {user && (
                    <span style={{
                        fontSize: '0.8rem',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        background: syncStatus === 'Saved ☁️' ? 'var(--badge-passed-bg)' : 'rgba(59, 130, 246, 0.15)',
                        border: syncStatus === 'Saved ☁️' ? '1px solid var(--badge-passed-border)' : '1px solid rgba(59, 130, 246, 0.4)',
                        color: syncStatus === 'Saved ☁️' ? 'var(--badge-passed-text)' : '#60a5fa',
                        fontWeight: 700
                    }}>
                        {syncStatus}
                    </span>
                )}

                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{user.email}</span>
                        <button
                            onClick={onLogout}
                            style={{
                                background: 'rgba(244, 63, 94, 0.15)',
                                border: '1px solid rgba(244, 63, 94, 0.3)',
                                color: '#f43f5e',
                                padding: '8px 14px',
                                borderRadius: '12px',
                                fontSize: '0.85rem',
                                fontWeight: 700
                            }}
                        >
                            Sign Out
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={onLoginClick}
                        className="btn-primary"
                        style={{
                            padding: '8px 18px',
                            borderRadius: '12px',
                            fontSize: '0.85rem',
                            fontWeight: 700
                        }}
                    >
                        Sign In / Cloud Sync
                    </button>
                )}
            </div>
        </header>
    );
}
