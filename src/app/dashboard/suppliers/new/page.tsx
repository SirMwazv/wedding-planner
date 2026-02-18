import { Suspense } from 'react';
import { getEvents } from '@/lib/actions/events';
import NewSupplierForm from './NewSupplierForm';

export default async function NewSupplierPage() {
    const events = await getEvents();
    const eventList = events.map((e: { id: string; name: string }) => ({ id: e.id, name: e.name }));

    return (
        <Suspense fallback={
            <div>
                <div className="page-header">
                    <div>
                        <h2>Add Supplier</h2>
                        <p>Loading...</p>
                    </div>
                </div>
            </div>
        }>
            <NewSupplierForm events={eventList} />
        </Suspense>
    );
}
