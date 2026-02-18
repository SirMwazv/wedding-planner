'use client';

import { useState } from 'react';
import { signUp } from '@/lib/actions/auth';
import Link from 'next/link';

export default function SignupPage() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        const result = await signUp(formData);
        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-brand">
                    <h1>Roora</h1>
                    <p>Plan your cultural wedding, your way</p>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form action={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="display_name">Your Name</label>
                        <input
                            id="display_name"
                            name="display_name"
                            type="text"
                            className="form-input"
                            placeholder="e.g. Tendai & Naledi"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className="form-input"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            className="form-input"
                            placeholder="At least 6 characters"
                            required
                            minLength={6}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <Link href="/auth/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
}
