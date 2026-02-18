'use client';

import { useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

interface UseRealtimeTableOptions {
    table: string;
    filterColumn?: string;
    filterValue?: string;
}

export function useRealtimeTable<T extends { id: string }>({
    table,
    filterColumn,
    filterValue,
}: UseRealtimeTableOptions) {
    const [changes, setChanges] = useState<{ event: RealtimeEvent; record: T }[]>([]);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleChange = useCallback((payload: { eventType: RealtimeEvent; new: T; old: { id: string } }) => {
        setChanges(prev => [...prev, { event: payload.eventType, record: payload.new || payload.old as T }]);
    }, []);

    useEffect(() => {
        const channelName = `realtime-${table}-${filterColumn || 'all'}-${filterValue || 'all'}`;

        let filter: string | undefined;
        if (filterColumn && filterValue) {
            filter = `${filterColumn}=eq.${filterValue}`;
        }

        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes' as 'system',
                {
                    event: '*',
                    schema: 'public',
                    table,
                    ...(filter ? { filter } : {}),
                } as Record<string, unknown>,
                handleChange as unknown as (payload: Record<string, unknown>) => void
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [table, filterColumn, filterValue, supabase, handleChange]);

    function clearChanges() {
        setChanges([]);
    }

    return { changes, clearChanges, hasChanges: changes.length > 0 };
}
