import { searchParamsCache } from '@/lib/searchparams';
import { CustomerService } from '@/lib/services';
import { CustomerTable } from './customer-tables';
import { columns } from './customer-tables/columns';

type CustomerListingPageProps = {};

export default async function CustomerListingPage({}: CustomerListingPageProps) {
  // Get search params
  const page = searchParamsCache.get('page');
  const search = searchParamsCache.get('name');
  const pageLimit = searchParamsCache.get('perPage');

  // Build filters for CustomerService
  const filters = {
    ...(search && { search }),
  };

  // Get customers from database
  const { customers, pagination } = await CustomerService.getCustomers({
    page: page || 1,
    limit: pageLimit || 10,
    ...filters,
  });

  return (
    <CustomerTable
      data={customers}
      totalItems={pagination.total}
      columns={columns}
    />
  );
}

