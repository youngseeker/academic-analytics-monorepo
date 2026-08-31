'use client';

import React, { useEffect, useState } from 'react';
import { V1MigrationSentinel, MigrationResult } from '../lib/v1MigrationSentinel';

interface MigrationBannerProps {
    user: any;
    onMigrationSuccess?: () => void;
}

export function MigrationBanner({ user, onMigrationSuccess }: MigrationBannerProps) {
    const [hasV1, setHasV1] = useState(false);
    const [isMigrated, setIsMigrated] = useState(false);
    const [migrating, setMigrating] = useState(false);
    const [result, setResult] = useState<MigrationResult | null>(null);

    useEffect(() => {
        setHasV1(V1MigrationSentinel.hasV1Data());
        setIsMigrated(V1MigrationSentinel.isAlreadyMigrated());
    }, []);

    if (!hasV1 || isMigrated) return null;

    const handleMigrate = async () => {
        if (!user) {
            alert('Please sign in to sync your V1 academic record to your Cloud Vault.');
            return;
        }

        setMigrating(true);
        setResult(null);

        const res = await V1MigrationSentinel.executeAtomicMigration(user.id);
        setMigrating(false);
        setResult(res);

        if (res.status === 'success') {
            setIsMigrated(true);
            if (onMigrationSuccess) onMigrationSuccess();
        }
    };

    return (
        <div style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            border: '1px solid #3b82f6',
            borderRadius: '12px',
            padding: '16px 24px',
            margin: '16px 0',
            color: '#f8fafc',
            boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
        }}>
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.25rem' }}>📦</span>
                    <h4 style={{ margin: 0, fontWeight: 700, color: '#60a5fa' }}>
                        Legacy V1 Academic Record Found
                    </h4>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#94a3b8' }}>
                    Upgrade seamlessly to V2 Cloud Vault without losing your existing grades or semester records.
                </p>
            </div>

            <div>
                {result?.status === 'success' ? (
                    <span style={{ color: '#4ade80', fontWeight: 600 }}>
                        ✅ {result.message}
                    </span>
                ) : result?.status === 'error' ? (
                    <div style={{ textAlign: 'right' }}>
                        <span style={{ color: '#f87171', fontSize: '0.85rem' }}>
                            ⚠️ {result.message}
                        </span>
                        <button
                            onClick={handleMigrate}
                            style={{
                                marginLeft: '12px',
                                background: '#ef4444',
                                color: '#fff',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 600
                            }}
                        >
                            Retry Migration
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleMigrate}
                        disabled={migrating}
                        style={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            color: '#ffffff',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            cursor: migrating ? 'not-allowed' : 'pointer',
                            fontWeight: 700,
                            boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.39)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {migrating ? 'Migrating Cloud Vault...' : 'Upgrade & Sync to V2 🚀'}
                    </button>
                )}
            </div>
        </div>
    );
}
