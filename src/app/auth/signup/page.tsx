'use client';

import { useState } from 'react';
import { signUp } from '@/lib/actions/auth';
import Link from 'next/link';

export default function SignupPage() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        // Pass the browser origin so the server action can build the redirect URL
        formData.set('origin', window.location.origin);

        const result = await signUp(formData);
        if (result?.error) {
            setError(result.error);
            setLoading(false);
        } else if (result?.success) {
            setSuccessMessage(result.message ?? 'Check your email for a verification link.');
            setLoading(false);
        }
    }

    if (successMessage) {
        return (
            <div className="auth-card">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-sidebar hover:opacity-80 transition-opacity mb-4">
                        <span className="text-2xl">💍</span>
                        <span className="font-bold text-xl tracking-tight">This Is Us</span>
                    </Link>
                </div>
                <div className="bg-success-bg border border-success text-success-text rounded-lg p-6 text-center">
                    <p className="text-lg font-semibold mb-2">✉️ Verify your email</p>
                    <p className="text-sm">{successMessage}</p>
                </div>
                <div className="auth-footer">
                    Already verified? <Link href="/auth/login" className="font-semibold text-sidebar">Sign in</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-card">
            <div className="text-center mb-8">
                <Link href="/" className="inline-flex items-center gap-2 text-sidebar hover:opacity-80 transition-opacity mb-4">
                    <span className="text-2xl">💍</span>
                    <span className="font-bold text-xl tracking-tight">This Is Us</span>
                </Link>
                <h2 className="text-2xl font-bold text-gray-900">Get started</h2>
                <p className="text-gray-500 text-sm mt-1">Plan your cultural wedding, your way</p>
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
                        placeholder="e.g. Tendai"
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="email">Email address</label>
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

                <div className="mt-8">
                    <button type="submit" className="btn btn-primary btn-lg w-full" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </div>
            </form>

            <div className="auth-footer">
                Already have an account? <Link href="/auth/login" className="font-semibold text-sidebar">Sign in</Link>
            </div>
        </div>
    );
}

