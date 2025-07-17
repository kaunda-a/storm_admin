import { ProductService, ProductWithDetails } from '@/lib/services';
import { searchParamsCache } from '@/lib/searchparams';
import { ProductTable } from './product-tables';
import { columns } from './product-tables/columns';

type ProductListingPage = {};

export default async function ProductListingPage({}: ProductListingPage) {
  // Get search params
  const page = searchParamsCache.get('page');
  const search = searchParamsCache.get('name');
  const pageLimit = searchParamsCache.get('perPage');
  const category = searchParamsCache.get('category');

  // Build filters for ProductService
  const filters = {
    ...(search && { search }),
    ...(category && { categoryId: category }),
    isActive: true // Only show active products
  };

  // Get products from database
  const { products, pagination } = await ProductService.getProducts({
    filters,
    page: page || 1,
    limit: pageLimit || 10,
    sort: { field: 'createdAt', direction: 'desc' }
  });

  return (
    <ProductTable
      data={products}
      totalItems={pagination.total}
      columns={columns}
    />
  );
}
