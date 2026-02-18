import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method is called from a Server Component.
                        // This can be ignored if middleware is refreshing sessions.
                    }
                },
            },
        }
    );
}

/**
 * Get the current authenticated user's couple.
 * Returns null if user has no couple yet.
 */
export async function getCurrentCouple() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: member } = await supabase
        .from('couple_members')
        .select('couple_id, role, couples(*)')
        .eq('user_id', user.id)
        .limit(1)
        .single();

    if (!member) return null;

    return {
        couple: member.couples as unknown as import('@/lib/types/database').Couple,
        role: member.role as import('@/lib/types/database').MemberRole,
        userId: user.id,
    };
}

/**
 * Get all members of the current couple, with display names.
 * Uses two queries because couple_members -> profiles has no direct FK.
 */
export async function getCoupleMembers() {
    const couple = await getCurrentCouple();
    if (!couple) return [];

    const supabase = await createClient();

    // 1. Get member records
    const { data: members } = await supabase
        .from('couple_members')
        .select('user_id, role')
        .eq('couple_id', couple.couple.id);

    if (!members || members.length === 0) return [];

    // 2. Get profiles for those user IDs
    const userIds = members.map((m) => m.user_id);
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', userIds);

    const profileMap: Record<string, string> = {};
    (profiles || []).forEach((p) => {
        profileMap[p.id] = p.display_name || 'Unknown';
    });

    return members.map((m) => ({
        id: m.user_id,
        role: m.role as string,
        display_name: profileMap[m.user_id] || m.role,
    }));
}
