import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/dashboard';

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            return NextResponse.redirect(`${origin}${next}`);
        }
        console.error('[auth/callback] Code exchange failed:', error.message);
    }

    // Auth code error — redirect to login with error hint
    const redirectUrl = new URL('/auth/login', origin);
    redirectUrl.searchParams.set('error', 'auth_callback_failed');
    return NextResponse.redirect(redirectUrl.toString());
}

