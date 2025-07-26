import { searchParamsCache } from '@/lib/searchparams';
import { BillboardService } from '@/lib/services';
import { BillboardTable } from './billboard-tables';
import { columns } from './billboard-tables/columns';

type BillboardListingPage = {};

export default async function BillboardListingPage({}: BillboardListingPage) {
  // Get search params
  const page = searchParamsCache.get('page');
  const search = searchParamsCache.get('name');
  const pageLimit = searchParamsCache.get('perPage');

  // Build filters for BillboardService
  const filters = {
    ...(search && { search })
  };

  // Get billboards from database
  const { billboards, pagination } = await BillboardService.getAllBillboards({
    page: page || 1,
    limit: pageLimit || 10
  });

  return (
    <BillboardTable
      data={billboards}
      totalItems={pagination.total}
      columns={columns}
    />
  );
}
