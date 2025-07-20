import { notFound } from 'next/navigation';
import { OrderForm } from './order-form';

type TOrderViewPageProps = {
  orderId: string;
};

async function getOrder(id: string) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/orders/${id}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch order: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
}

export async function OrderViewPage({
  orderId
}: TOrderViewPageProps) {
  let order = null;
  let pageTitle = 'Create New Order';

  if (orderId !== 'new') {
    order = await getOrder(orderId);
    if (!order) {
      notFound();
    }
    pageTitle = `Edit Orders`;
  }

  return <OrderForm initialData={order} pageTitle={pageTitle} />;
}
