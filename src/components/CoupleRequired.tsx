'use client';

import { useState } from 'react';
import { createWedding, joinWedding } from '@/lib/actions/auth';
import { CURRENCY_OPTIONS } from '@/lib/types/database';

export default function CoupleRequired() {
    const [mode, setMode] = useState<'create' | 'join'>('create');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleCreate(formData: FormData) {
        setLoading(true);
        setError(null);
        const result = await createWedding(formData);
        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
    }

    async function handleJoin(formData: FormData) {
        setLoading(true);
        setError(null);
        const result = await joinWedding(formData);
        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
    }

    return (
        <div className="setup-page">
            <div className="setup-card">
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💍</div>
                <h2>{mode === 'create' ? 'Create Your Wedding' : 'Join a Wedding'}</h2>
                <p>
                    {mode === 'create'
                        ? "Welcome to This Is Us! Let's set up your wedding planning space."
                        : "Enter the invite code from your partner to join their wedding planning space."}
                </p>

                {error && <div className="auth-error">{error}</div>}

                {mode === 'create' ? (
                    <form action={handleCreate}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="name">Wedding Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                className="form-input"
                                placeholder="e.g. Tendai & Naledi's Wedding"
                                required
                            />
                            <span className="form-hint">Give your wedding a name both of you will recognize</span>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label" htmlFor="role">Your Role</label>
                                <select id="role" name="role" className="form-input form-select">
                                    <option value="bride">Bride</option>
                                    <option value="groom">Groom</option>
                                    <option value="planner">Planner</option>
                                    <option value="family">Family</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="currency">Primary Currency</label>
                                <select id="currency" name="currency" className="form-input form-select">
                                    {CURRENCY_OPTIONS.map((c) => (
                                        <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-accent btn-lg" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Setting up...' : 'Get Started'}
                        </button>
                    </form>
                ) : (
                    <form action={handleJoin}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="invite_code">Invite Code</label>
                            <input
                                id="invite_code"
                                name="invite_code"
                                type="text"
                                className="form-input text-center font-mono text-lg tracking-widest uppercase"
                                placeholder="XXXXXXX"
                                required
                                maxLength={7}
                            />
                            <span className="form-hint">Ask your partner for the code in their Settings</span>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="join_role">Your Role</label>
                            <select id="join_role" name="role" className="form-input form-select">
                                <option value="bride">Bride</option>
                                <option value="groom">Groom</option>
                                <option value="planner">Planner</option>
                                <option value="family">Family</option>
                            </select>
                        </div>

                        <button type="submit" className="btn btn-accent btn-lg" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Joining...' : 'Join Wedding'}
                        </button>
                    </form>
                )}

                <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                    <button
                        onClick={() => {
                            setMode(mode === 'create' ? 'join' : 'create');
                            setError(null);
                        }}
                        className="text-sm text-gray-500 hover:text-primary transition-colors"
                    >
                        {mode === 'create'
                            ? "Has your partner already set it up? Join here"
                            : "Need to create a new wedding? Create here"}
                    </button>
                </div>
            </div>
        </div>
    );
}
