import { OrderService, OrderWithDetails, OrderStatus, PaymentStatus, ShippingStatus } from '@/lib/services'
import { searchParamsCache } from '@/lib/searchparams'
import { OrderTable } from './order-tables'
import { columns } from './order-tables/columns'

type OrderListingPageProps = {}

export async function OrderListingPage({}: OrderListingPageProps) {
  // Get search params
  const page = searchParamsCache.get('page')
  const search = searchParamsCache.get('search')
  const pageLimit = searchParamsCache.get('perPage')
  const status = searchParamsCache.get('status')
  const paymentStatus = searchParamsCache.get('paymentStatus')
  const shippingStatus = searchParamsCache.get('shippingStatus')

  // Build filters for OrderService
  const filters = {
    ...(search && { search }),
    ...(status && { status: status as OrderStatus }),
    ...(paymentStatus && { paymentStatus: paymentStatus as PaymentStatus }),
    ...(shippingStatus && { shippingStatus: shippingStatus as ShippingStatus })
  }

  // Get orders from database
  const { orders, pagination } = await OrderService.getOrders({
    filters,
    page: Number(page) || 1,
    limit: Number(pageLimit) || 10
  })

  return (
    <OrderTable
      data={orders}
      totalItems={pagination.total}
      columns={columns}
    />
  )
}
