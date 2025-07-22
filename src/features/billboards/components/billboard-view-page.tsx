'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import BillboardForm from './billboard-form';
import { toast } from 'sonner';

type TBillboardViewPageProps = {
  billboardId: string;
};

export function BillboardViewPage({
  billboardId
}: TBillboardViewPageProps) {
  const [billboard, setBillboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const pageTitle = billboardId === 'new' ? 'Create New Billboard' : 'Edit Billboard';

  useEffect(() => {
    async function fetchBillboard() {
      if (billboardId === 'new') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/billboards/${billboardId}`, {
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError(true);
            toast.error('Billboard not found');
            return;
          }
          throw new Error(`Failed to fetch billboard: ${response.status}`);
        }

        const billboardData = await response.json();
        setBillboard(billboardData);
      } catch (error) {
        console.error('Error fetching billboard:', error);
        setError(true);
        toast.error('Failed to load billboard data');
      } finally {
        setLoading(false);
      }
    }

    fetchBillboard();
  }, [billboardId]);

  if (error) {
    notFound();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return <BillboardForm initialData={billboard} pageTitle={pageTitle} />;
}
