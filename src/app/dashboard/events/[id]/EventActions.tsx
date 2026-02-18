'use client';

import DeleteButton from '@/components/DeleteButton';
import { deleteEvent } from '@/lib/actions/events';

export default function EventActions({ eventId }: { eventId: string }) {
    return (
        <DeleteButton
            onDelete={() => deleteEvent(eventId)}
            itemName="this event"
        />
    );
}
