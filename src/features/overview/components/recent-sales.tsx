import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AnalyticsService } from '@/lib/services'

export async function RecentSales() {
  const recentSales = await AnalyticsService.getRecentSales(5)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount)
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'U'
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-ZA', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
        <CardDescription>
          Latest completed orders from your store
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-8'>
          {recentSales.length === 0 ? (
            <div className='text-center text-muted-foreground py-8'>
              No recent sales to display
            </div>
          ) : (
            recentSales.map((sale: any) => (
              <div key={sale.id} className='flex items-center'>
                <Avatar className='h-9 w-9'>
                  <AvatarImage src={sale.user.imageUrl || undefined} alt='Avatar' />
                  <AvatarFallback>
                    {getInitials(sale.user.firstName, sale.user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className='ml-4 space-y-1'>
                  <p className='text-sm font-medium leading-none'>
                    {sale.user.firstName} {sale.user.lastName}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    {sale.user.email}
                  </p>
                  {sale.items[0] && (
                    <p className='text-xs text-muted-foreground'>
                      {sale.items[0].product.name}
                      {sale.items.length > 1 && ` +${sale.items.length - 1} more`}
                    </p>
                  )}
                </div>
                <div className='ml-auto space-y-1 text-right'>
                  <div className='font-medium'>
                    {formatCurrency(sale.totalAmount.toNumber())}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    {formatDate(sale.deliveredAt || sale.createdAt)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
