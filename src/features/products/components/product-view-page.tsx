'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import ProductForm from './product-form';
import { toast } from 'sonner';

type TProductViewPageProps = {
  productId: string;
};

export default function ProductViewPage({
  productId
}: TProductViewPageProps) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const pageTitle = productId === 'new' ? 'Create New Product' : 'Edit Product';

  useEffect(() => {
    async function fetchProduct() {
      if (productId === 'new') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/products/${productId}`, {
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError(true);
            toast.error('Product not found');
            return;
          }
          throw new Error(`Failed to fetch product: ${response.status}`);
        }

        const productData = await response.json();
        setProduct(productData);
      } catch (error) {
        console.error('Error fetching product:', error);
        setError(true);
        toast.error('Failed to load product data');
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);

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

  return <ProductForm initialData={product} pageTitle={pageTitle} />;
}
