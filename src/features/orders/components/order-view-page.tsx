'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { OrderForm } from './order-form';
import { toast } from 'sonner';

type TOrderViewPageProps = {
  orderId: string;
};

export function OrderViewPage({
  orderId
}: TOrderViewPageProps) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const pageTitle = orderId === 'new' ? 'Create New Order' : 'Edit Order';

  useEffect(() => {
    async function fetchOrder() {
      if (orderId === 'new') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/orders/${orderId}`, {
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError(true);
            toast.error('Order not found');
            return;
          }
          throw new Error(`Failed to fetch order: ${response.status}`);
        }

        const orderData = await response.json();
        setOrder(orderData);
      } catch (error) {
        console.error('Error fetching order:', error);
        setError(true);
        toast.error('Failed to load order data');
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

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

  return <OrderForm initialData={order} pageTitle={pageTitle} />;
}
