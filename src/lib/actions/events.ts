'use server';

import { createClient, getCurrentCouple } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function getEvents() {
    const couple = await getCurrentCouple();
    if (!couple) return [];

    const supabase = await createClient();
    const { data } = await supabase
        .from('events')
        .select('*')
        .eq('couple_id', couple.couple.id)
        .order('date', { ascending: true, nullsFirst: false });

    return data || [];
}

export async function getEvent(id: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

    return data;
}

export async function createEvent(formData: FormData) {
    const couple = await getCurrentCouple();
    if (!couple) return { error: 'No couple found' };

    const supabase = await createClient();

    const eventData = {
        couple_id: couple.couple.id,
        name: formData.get('name') as string,
        type: formData.get('type') as string,
        date: (formData.get('date') as string) || undefined,
        location: (formData.get('location') as string) || undefined,
        currency: (formData.get('currency') as string) || couple.couple.primary_currency,
        notes: (formData.get('notes') as string) || undefined,
    };

    const { error } = await supabase.from('events').insert(eventData);

    if (error) return { error: error.message };

    redirect('/dashboard/events');
}

export async function updateEvent(id: string, formData: FormData) {
    const supabase = await createClient();

    const updates = {
        name: formData.get('name') as string,
        type: formData.get('type') as string,
        date: (formData.get('date') as string) || null,
        location: (formData.get('location') as string) || null,
        currency: formData.get('currency') as string,
        notes: (formData.get('notes') as string) || null,
    };

    const { error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id);

    if (error) return { error: error.message };

    redirect(`/dashboard/events`);
}

export async function deleteEvent(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) return { error: error.message };
    redirect('/dashboard/events');
}

export async function getEventSuppliers(eventId: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from('suppliers')
        .select('*, quotes(*)')
        .eq('event_id', eventId)
        .order('name');
    return data || [];
}

export async function getEventTasks(eventId: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('event_id', eventId)
        .order('due_date', { ascending: true, nullsFirst: false });
    return data || [];
}
