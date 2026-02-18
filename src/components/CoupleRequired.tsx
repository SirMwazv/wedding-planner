'use client';

import { useState } from 'react';
import { createWedding } from '@/lib/actions/auth';
import { CURRENCY_OPTIONS } from '@/lib/types/database';

export default function CoupleRequired() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        const result = await createWedding(formData);
        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
    }

    return (
        <div className="setup-page">
            <div className="setup-card">
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💍</div>
                <h2>Create Your Wedding</h2>
                <p>
                    Welcome to Roora! Let&apos;s set up your wedding planning space.
                    You can add your partner and family members later.
                </p>

                {error && <div className="auth-error">{error}</div>}

                <form action={handleSubmit}>
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
            </div>
        </div>
    );
}
