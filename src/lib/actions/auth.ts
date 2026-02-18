'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { MemberRole, Currency } from '@/lib/types/database';

export async function signUp(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const displayName = formData.get('display_name') as string;

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { display_name: displayName || email },
        },
    });

    if (error) {
        return { error: error.message };
    }

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

    // Create couple
    const { data: couple, error: coupleError } = await supabase
        .from('couples')
        .insert({ name, primary_currency: currency })
        .select()
        .single();

    if (coupleError) {
        return { error: coupleError.message };
    }

    // Link user to couple
    const { error: memberError } = await supabase
        .from('couple_members')
        .insert({
            couple_id: couple.id,
            user_id: user.id,
            role,
        });

    if (memberError) {
        return { error: memberError.message };
    }

    redirect('/dashboard');
}
