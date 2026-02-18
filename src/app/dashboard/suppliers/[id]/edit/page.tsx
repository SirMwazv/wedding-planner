import { getSupplier } from '@/lib/actions/suppliers';
import { notFound } from 'next/navigation';
import EditSupplierForm from './EditSupplierForm';

export default async function EditSupplierPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supplier = await getSupplier(id);
    if (!supplier) notFound();

    return <EditSupplierForm supplier={supplier} />;
}
