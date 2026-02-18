'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentCouple } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateBudget(amount: number) {
    const coupleData = await getCurrentCouple();
    if (!coupleData) return { error: 'No couple found' };

    if (isNaN(amount) || amount < 0) {
        return { error: 'Budget must be a positive number' };
    }

    const supabase = await createClient();
    const { error } = await supabase
        .from('couples')
        .update({ total_budget: amount })
        .eq('id', coupleData.couple.id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/dashboard/budget');
    return { success: true };
}
