'use server';

import { createClient, getCurrentCouple } from '@/lib/supabase/server';
import type { TaskStatus } from '@/lib/types/database';

export async function getTasks(eventId?: string) {
    const supabase = await createClient();

    let query = supabase.from('tasks').select('*, events(name)');

    if (eventId) {
        query = query.eq('event_id', eventId);
    }

    const { data } = await query.order('due_date', { ascending: true, nullsFirst: false });
    return data || [];
}

export async function getAllTasks() {
    const couple = await getCurrentCouple();
    if (!couple) return [];

    const supabase = await createClient();
    const { data } = await supabase
        .from('tasks')
        .select('*, events!inner(name, couple_id)')
        .eq('events.couple_id', couple.couple.id)
        .order('due_date', { ascending: true, nullsFirst: false });

    return data || [];
}

export async function createTask(formData: FormData) {
    const supabase = await createClient();

    const taskData = {
        event_id: formData.get('event_id') as string,
        title: formData.get('title') as string,
        description: (formData.get('description') as string) || undefined,
        due_date: (formData.get('due_date') as string) || undefined,
        assigned_to: (formData.get('assigned_to') as string) || undefined,
        is_milestone: formData.get('is_milestone') === 'true',
        sort_order: parseInt(formData.get('sort_order') as string) || 0,
    };

    const { error } = await supabase.from('tasks').insert(taskData);
    if (error) return { error: error.message };
    return { success: true };
}

export async function updateTaskStatus(id: string, status: TaskStatus) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', id);

    if (error) return { error: error.message };
    return { success: true };
}
export async function updateTask(id: string, formData: FormData) {
    const supabase = await createClient();

    const updates = {
        title: formData.get('title') as string,
        description: (formData.get('description') as string) || null,
        due_date: (formData.get('due_date') as string) || null,
        assigned_to: (formData.get('assigned_to') as string) || null,
        is_milestone: formData.get('is_milestone') === 'true',
        sort_order: parseInt(formData.get('sort_order') as string) || 0,
    };

    const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id);

    if (error) return { error: error.message };
    return { success: true };
}

export async function deleteTask(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) return { error: error.message };
    return { success: true };
}

export async function getMilestones(eventId: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('event_id', eventId)
        .eq('is_milestone', true)
        .order('sort_order', { ascending: true });
    return data || [];
}

export async function getAllMilestones() {
    const couple = await getCurrentCouple();
    if (!couple) return [];

    const supabase = await createClient();
    const { data } = await supabase
        .from('tasks')
        .select('*, events!inner(name, couple_id, type)')
        .eq('events.couple_id', couple.couple.id)
        .eq('is_milestone', true)
        .order('sort_order', { ascending: true });

    return data || [];
}
