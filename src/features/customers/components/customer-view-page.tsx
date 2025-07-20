import { notFound } from 'next/navigation';
import CustomerForm from './customer-form';

type TCustomerViewPageProps = {
  customerId: string;
};

async function getCustomer(id: string) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/customers/${id}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch customer: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching customer:', error);
    return null;
  }
}

export async function CustomerViewPage({
  customerId,
}: TCustomerViewPageProps) {
  let customer = null;
  let pageTitle = 'Create New Customer';

  if (customerId !== 'new') {
    customer = await getCustomer(customerId);
    if (!customer) {
      notFound();
    }
    pageTitle = `Edit Customer`;
  }

  return <CustomerForm initialData={customer} pageTitle={pageTitle} />;
}

