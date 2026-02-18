import { getEvent } from '@/lib/actions/events';
import { notFound } from 'next/navigation';
import EditEventForm from './EditEventForm';

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const event = await getEvent(id);
    if (!event) notFound();

    return <EditEventForm event={event} />;
}
