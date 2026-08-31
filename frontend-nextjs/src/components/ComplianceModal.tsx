'use client';

import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface ComplianceModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
}

export function ComplianceModal({ isOpen, onClose, user }: ComplianceModalProps) {
    const [status, setStatus] = useState('');
    const [exporting, setExporting] = useState(false);

    if (!isOpen) return null;

    const handleExport = async () => {
        if (!user) {
            alert('Please sign in to export cloud data.');
            return;
        }

        setExporting(true);
        setStatus('Preparing GDPR / FERPA data package...');

        try {
            const { data, error } = await supabase.rpc('export_user_data');
            if (error) throw error;

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `student_os_data_export_${user.id.slice(0, 8)}.json`;
            a.click();

            setStatus('✅ Data export downloaded successfully!');
        } catch (e: any) {
            console.error('Export failure:', e);
            setStatus(`⚠️ Export failed: ${e.message}`);
        } finally {
            setExporting(false);
        }
    };

    const handleEraseAccount = async () => {
        if (!user) return;
        if (!confirm('⚠️ PERMANENT DELETION WARNING:\n\nAre you sure you want to permanently erase your account and all academic records from the cloud vault? This action CANNOT be undone and complies with GDPR/FERPA right-to-be-forgotten laws.')) {
            return;
        }

        try {
            const { error } = await supabase.rpc('erase_user_account');
            if (error) throw error;

            alert('Your account and records have been permanently erased.');
            window.location.reload();
        } catch (e: any) {
            alert(`Erasure failed: ${e.message}`);
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
                padding: '32px',
                maxWidth: '480px',
                width: '100%',
                color: '#f8fafc'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                        🔒 Privacy & Compliance Vault (GDPR / FERPA)
                    </h3>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}>
                        ✕
                    </button>
                </div>

                <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: '1.5', marginBottom: '20px' }}>
                    You have full ownership of your academic records. You can download a complete JSON data package or permanently erase your data at any time.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        style={{
                            padding: '12px 18px',
                            borderRadius: '10px',
                            border: '1px solid #3b82f6',
                            background: 'rgba(59, 130, 246, 0.15)',
                            color: '#60a5fa',
                            fontWeight: 700,
                            cursor: exporting ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        📥 Download Data Export Package (JSON)
                    </button>

                    <button
                        onClick={handleEraseAccount}
                        style={{
                            padding: '12px 18px',
                            borderRadius: '10px',
                            border: '1px solid #ef4444',
                            background: 'rgba(239, 68, 68, 0.15)',
                            color: '#f87171',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        🗑️ Right-To-Be-Forgotten: Permanent Account Erasure
                    </button>
                </div>

                {status && (
                    <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', fontSize: '0.85rem' }}>
                        {status}
                    </div>
                )}
            </div>
        </div>
    );
}
