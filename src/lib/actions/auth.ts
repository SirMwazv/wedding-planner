'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { randomUUID } from 'crypto';
import type { MemberRole, Currency } from '@/lib/types/database';

export async function signUp(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const displayName = formData.get('display_name') as string;

    const origin = (formData.get('origin') as string) || process.env.NEXT_PUBLIC_SITE_URL || '';

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { display_name: displayName || email },
            emailRedirectTo: `${origin}/auth/callback`,
        },
    });

    if (error) {
        return { error: error.message };
    }

    // If email confirmation is required, the user won't have a session yet.
    // Check if the user's email is confirmed — if not, prompt them to verify.
    const needsEmailConfirmation =
        data.user && !data.user.confirmed_at && data.session === null;

    if (needsEmailConfirmation) {
        return { success: true, message: 'Check your email for a verification link.' };
    }

    // If email confirmation is disabled, user is immediately authenticated
    redirect('/dashboard');
}

export async function signIn(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error: error.message };
    }

    redirect('/dashboard');
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/auth/login');
}

/**
 * Create a wedding (couple + membership) for authenticated user.
 * Called from CoupleRequired setup form.
 */
export async function createWedding(formData: FormData) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Not authenticated' };
    }

    const name = formData.get('name') as string;
    const role = (formData.get('role') as MemberRole) || 'bride';
    const currency = (formData.get('currency') as Currency) || 'ZAR';

    // Generate ID client-side so we don't need .select() after insert.
    // (.select() triggers the SELECT RLS policy which requires couple membership
    // that doesn't exist yet at this point — a chicken-and-egg problem.)
    const coupleId = randomUUID();

    // Create couple
    const { error: coupleError } = await supabase
        .from('couples')
        .insert({ id: coupleId, name, primary_currency: currency });

    if (coupleError) {
        console.error('Create couple error:', coupleError);
        return { error: `Failed to create couple: ${coupleError.message}` };
    }

    // Link user to couple
    const { error: memberError } = await supabase
        .from('couple_members')
        .insert({
            couple_id: coupleId,
            user_id: user.id,
            role,
        });

    if (memberError) {
        console.error('Create member error:', memberError);
        return { error: `Failed to create membership: ${memberError.message}` };
    }

    // Verify that we can read the couple back (ensures RLS is working and data is there)
    // using the same logic as getCurrentCouple
    const { data: member, error: verifyError } = await supabase
        .from('couple_members')
        .select('couple_id')
        .eq('user_id', user.id)
        .eq('couple_id', coupleId)
        .single();

    if (verifyError || !member) {
        console.error('Verification failed:', verifyError);
        return {
            error: `Verification failed. Code: ${verifyError?.code}, Msg: ${verifyError?.message}. User: ${user.id}, Couple: ${coupleId}`
        };
    }

    redirect('/dashboard');
}
