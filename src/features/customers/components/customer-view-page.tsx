'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import CustomerForm from './customer-form';
import { toast } from 'sonner';

type TCustomerViewPageProps = {
  customerId: string;
};

export function CustomerViewPage({
  customerId,
}: TCustomerViewPageProps) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const pageTitle = customerId === 'new' ? 'Create New Customer' : 'Edit Customer';

  useEffect(() => {
    async function fetchCustomer() {
      if (customerId === 'new') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/customers/${customerId}`, {
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError(true);
            toast.error('Customer not found');
            return;
          }
          throw new Error(`Failed to fetch customer: ${response.status}`);
        }

        const customerData = await response.json();
        setCustomer(customerData);
      } catch (error) {
        console.error('Error fetching customer:', error);
        setError(true);
        toast.error('Failed to load customer data');
      } finally {
        setLoading(false);
      }
    }

    fetchCustomer();
  }, [customerId]);

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

  return <CustomerForm initialData={customer} pageTitle={pageTitle} />;
}

