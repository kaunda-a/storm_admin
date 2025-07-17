import { OrderService, OrderWithDetails } from '@/lib/services'

// Type for order items with product details
type OrderItemWithDetails = OrderWithDetails['items'][0]
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  IconArrowLeft, 
  IconPackage, 
  IconUser, 
  IconMapPin, 
  IconCreditCard,
  IconTruck,
  IconCalendar,
  IconEdit,
  IconPrinter
} from '@tabler/icons-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Image from 'next/image'

interface OrderViewPageProps {
  orderId: string
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
  PROCESSING: 'bg-blue-500/10 text-blue-600 border-blue-200',
  CONFIRMED: 'bg-blue-500/10 text-blue-600 border-blue-200',
  SHIPPED: 'bg-purple-500/10 text-purple-600 border-purple-200',
  DELIVERED: 'bg-green-500/10 text-green-600 border-green-200',
  CANCELLED: 'bg-red-500/10 text-red-600 border-red-200',
  REFUNDED: 'bg-gray-500/10 text-gray-600 border-gray-200'
}

const paymentStatusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
  PROCESSING: 'bg-blue-500/10 text-blue-600 border-blue-200',
  PAID: 'bg-green-500/10 text-green-600 border-green-200',
  FAILED: 'bg-red-500/10 text-red-600 border-red-200',
  REFUNDED: 'bg-gray-500/10 text-gray-600 border-gray-200'
}

const shippingStatusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
  PROCESSING: 'bg-blue-500/10 text-blue-600 border-blue-200',
  IN_TRANSIT: 'bg-purple-500/10 text-purple-600 border-purple-200',
  SHIPPED: 'bg-purple-500/10 text-purple-600 border-purple-200',
  DELIVERED: 'bg-green-500/10 text-green-600 border-green-200',
  RETURNED: 'bg-orange-500/10 text-orange-600 border-orange-200'
}

export async function OrderViewPage({ orderId }: OrderViewPageProps) {
  const order = await OrderService.getOrderById(orderId)

  if (!order) {
    notFound()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount)
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <Button variant='ghost' size='sm' asChild>
            <Link href='/dashboard/orders'>
              <IconArrowLeft className='h-4 w-4 mr-2' />
              Back to Orders
            </Link>
          </Button>
          <div>
            <h1 className='text-2xl font-bold'>Order {order.orderNumber}</h1>
            <p className='text-muted-foreground'>
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className='flex items-center space-x-2'>
          <Button variant='outline' size='sm'>
            <IconPrinter className='h-4 w-4 mr-2' />
            Print Invoice
          </Button>
          <Button size='sm' asChild>
            <Link href={`/dashboard/orders/${order.id}/edit`}>
              <IconEdit className='h-4 w-4 mr-2' />
              Edit Order
            </Link>
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Order Details */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <IconPackage className='h-5 w-5 mr-2' />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {order.items.map((item: OrderItemWithDetails) => (
                  <div key={item.id} className='flex items-center space-x-4 p-4 border rounded-lg'>
                    {item.product.images[0] && (
                      <div className='relative w-16 h-16 rounded-md overflow-hidden'>
                        <Image
                          src={item.product.images[0].url}
                          alt={item.product.name}
                          fill
                          className='object-cover'
                        />
                      </div>
                    )}
                    <div className='flex-1'>
                      <h3 className='font-semibold'>{item.product.name}</h3>
                      <p className='text-sm text-muted-foreground'>
                        Size: {item.productVariant.size} • Color: {item.productVariant.color}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        SKU: {item.productVariant.sku}
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='font-semibold'>
                        {formatCurrency(item.unitPrice.toNumber())} × {item.quantity}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {formatCurrency(item.totalPrice.toNumber())}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator className='my-4' />
              
              {/* Order Totals */}
              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <span>Subtotal:</span>
                  <span>{formatCurrency(order.subtotal.toNumber())}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Tax:</span>
                  <span>{formatCurrency(order.taxAmount.toNumber())}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Shipping:</span>
                  <span>{formatCurrency(order.shippingAmount.toNumber())}</span>
                </div>
                <Separator />
                <div className='flex justify-between font-semibold text-lg'>
                  <span>Total:</span>
                  <span>{formatCurrency(order.totalAmount.toNumber())}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className='space-y-6'>
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <label className='text-sm font-medium'>Order Status</label>
                <div className='mt-1'>
                  <Badge className={statusColors[order.status] || 'bg-gray-500/10 text-gray-600 border-gray-200'}>
                    {order.status.toLowerCase()}
                  </Badge>
                </div>
              </div>
              
              <div>
                <label className='text-sm font-medium'>Payment Status</label>
                <div className='mt-1'>
                  <Badge className={paymentStatusColors[order.paymentStatus] || 'bg-gray-500/10 text-gray-600 border-gray-200'}>
                    <IconCreditCard className='w-3 h-3 mr-1' />
                    {order.paymentStatus.toLowerCase()}
                  </Badge>
                </div>
              </div>
              
              <div>
                <label className='text-sm font-medium'>Shipping Status</label>
                <div className='mt-1 space-y-1'>
                  <Badge className={shippingStatusColors[order.shippingStatus] || 'bg-gray-500/10 text-gray-600 border-gray-200'}>
                    <IconTruck className='w-3 h-3 mr-1' />
                    {order.shippingStatus.toLowerCase()}
                  </Badge>
                  {order.trackingNumber && (
                    <p className='text-sm text-muted-foreground'>
                      Tracking: {order.trackingNumber}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <IconUser className='h-5 w-5 mr-2' />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                <p className='font-semibold'>
                  {order.user.firstName} {order.user.lastName}
                </p>
                <p className='text-sm text-muted-foreground'>{order.user.email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <IconMapPin className='h-5 w-5 mr-2' />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-1 text-sm'>
                <p className='font-semibold'>
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                {order.shippingAddress.company && (
                  <p>{order.shippingAddress.company}</p>
                )}
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && (
                  <p>{order.shippingAddress.addressLine2}</p>
                )}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && (
                  <p>Phone: {order.shippingAddress.phone}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <IconCalendar className='h-5 w-5 mr-2' />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3 text-sm'>
                <div className='flex justify-between'>
                  <span>Order placed:</span>
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                {order.shippedAt && (
                  <div className='flex justify-between'>
                    <span>Shipped:</span>
                    <span>{new Date(order.shippedAt).toLocaleDateString()}</span>
                  </div>
                )}
                {order.deliveredAt && (
                  <div className='flex justify-between'>
                    <span>Delivered:</span>
                    <span>{new Date(order.deliveredAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
