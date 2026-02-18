'use client';

import { useState } from 'react';
import { signIn } from '@/lib/actions/auth';
import Link from 'next/link';

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        const result = await signIn(formData);
        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
    }

    return (
        <div className="auth-card">
            <div className="text-center mb-8">
                <Link href="/" className="inline-flex items-center gap-2 text-sidebar hover:opacity-80 transition-opacity mb-4">
                    <span className="text-2xl">💍</span>
                    <span className="font-bold text-xl tracking-tight">This Is Us</span>
                </Link>
                <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
                <p className="text-gray-500 text-sm mt-1">Sign in to continue planning</p>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <form action={handleSubmit}>
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
                    <div className="flex-between mb-1">
                        <label className="form-label mb-0" htmlFor="password">Password</label>
                        <Link href="/auth/forgot-password" style={{ fontSize: '12px', color: 'var(--color-sidebar)' }}>
                            Forgot password?
                        </Link>
                    </div>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        className="form-input"
                        placeholder="••••••••"
                        required
                        minLength={6}
                    />
                </div>

                <div className="mt-8">
                    <button type="submit" className="btn btn-primary btn-lg w-full" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </div>
            </form>

            <div className="auth-footer">
                Don&apos;t have an account? <Link href="/auth/signup" className="font-semibold text-sidebar">Sign up</Link>
            </div>
        </div>
    );
}

