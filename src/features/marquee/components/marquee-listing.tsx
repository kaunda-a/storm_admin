import { searchParamsCache } from '@/lib/searchparams';
import { MarqueeService } from '@/lib/services';
import { MarqueeTable } from './marquee-tables';
import { columns } from './marquee-tables/columns';

type MarqueeListingPage = {};

export default async function MarqueeListingPage({}: MarqueeListingPage) {
  // Get search params
  const page = searchParamsCache.get('page');
  const search = searchParamsCache.get('name');
  const pageLimit = searchParamsCache.get('perPage');

  // Build filters for MarqueeService
  const filters = {
    ...(search && { search })
  };

  // Get marquee messages from database
  const { messages: marqueeMessages, pagination } = await MarqueeService.getAllMessages({
    page: page || 1,
    limit: pageLimit || 10
  });

  return (
    <MarqueeTable
      data={marqueeMessages}
      totalItems={pagination.total}
      columns={columns}
    />
  );
}
