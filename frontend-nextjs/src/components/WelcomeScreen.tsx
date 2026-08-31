'use client';

import React, { useState } from 'react';

interface WelcomeScreenProps {
    onStartGuest: () => void;
    onLogin: (email: string) => Promise<{ error: any; message: string }>;
}

export function WelcomeScreen({ onStartGuest, onLogin }: WelcomeScreenProps) {
    const [email, setEmail] = useState('');
    const [authMessage, setAuthMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setAuthMessage('Please enter a valid email address.');
            return;
        }
        setLoading(true);
        setAuthMessage('Sending magic link to your email...');
        const res = await onLogin(email);
        setLoading(false);
        setAuthMessage(res.message);
    };

    return (
        <main style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                background: 'var(--glass-bg, rgba(15, 23, 42, 0.9))',
                padding: '48px 40px',
                borderRadius: '24px',
                maxWidth: '460px',
                width: '100%',
                textAlign: 'center',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>🎓</div>
                <h2 style={{ fontSize: '2.2rem', margin: '0 0 8px 0', fontWeight: 800, color: '#f8fafc' }}>
                    My Student OS
                </h2>
                <p style={{ color: '#94a3b8', marginBottom: '28px', fontSize: '0.95rem', lineHeight: '1.5' }}>
                    Production-Oriented Academic Decision & CGPA Planning Engine.
                </p>

                <form onSubmit={handleMagicLink} style={{ marginBottom: '24px' }}>
                    <input
                        type="email"
                        placeholder="Enter your student email..."
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '14px 16px',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.15)',
                            background: 'rgba(0,0,0,0.3)',
                            color: '#fff',
                            fontSize: '1rem',
                            marginBottom: '14px',
                            outline: 'none',
                            boxSizing: 'border-box'
                        }}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            borderRadius: '12px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            color: '#fff',
                            fontSize: '1rem',
                            fontWeight: 700,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {loading ? 'Sending Link...' : 'Sign In with Magic Link 🚀'}
                    </button>
                </form>

                {authMessage && (
                    <div style={{
                        padding: '10px',
                        borderRadius: '8px',
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        color: '#60a5fa',
                        fontSize: '0.85rem',
                        marginBottom: '20px'
                    }}>
                        {authMessage}
                    </div>
                )}

                <div style={{ position: 'relative', margin: '24px 0' }}>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }} />
                    <span style={{
                        position: 'absolute',
                        top: '-10px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#0f172a',
                        padding: '0 12px',
                        color: '#64748b',
                        fontSize: '0.8rem'
                    }}>
                        OR
                    </span>
                </div>

                <button
                    onClick={onStartGuest}
                    style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#cbd5e1',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    Continue as Guest (Local Offline Mode)
                </button>
            </div>
        </main>
    );
}
