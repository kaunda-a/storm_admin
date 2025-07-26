import { AnalyticsService } from '@/lib/services'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { IconTrendingUp, IconPackage } from '@tabler/icons-react'
import Image from 'next/image'

export async function TopProducts() {
  const topProducts = await AnalyticsService.getTopProducts(5)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount)
  }

  return (
    <Card className='col-span-3'>
      <CardHeader>
        <CardTitle className='flex items-center'>
          <IconTrendingUp className='h-5 w-5 mr-2' />
          Top Products
        </CardTitle>
        <CardDescription>
          Best selling products by quantity sold
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {topProducts.length === 0 ? (
            <div className='text-center py-8 text-muted-foreground'>
              <IconPackage className='h-12 w-12 mx-auto mb-4 opacity-50' />
              <p>No sales data available yet</p>
              <p className='text-sm'>Start selling to see top products here</p>
            </div>
          ) : (
            topProducts.map((product, index) => (
              <div
                key={product.id}
                className='flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors'
              >
                {/* Rank */}
                <div className='flex-shrink-0'>
                  <Badge 
                    variant={index === 0 ? 'default' : 'secondary'}
                    className='w-8 h-8 rounded-full flex items-center justify-center p-0'
                  >
                    {index + 1}
                  </Badge>
                </div>

                {/* Product Image */}
                <div className='flex-shrink-0'>
                  {product.image ? (
                    <div className='relative w-12 h-12 rounded-md overflow-hidden'>
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className='object-cover'
                      />
                    </div>
                  ) : (
                    <div className='w-12 h-12 bg-muted rounded-md flex items-center justify-center'>
                      <IconPackage className='h-6 w-6 text-muted-foreground' />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className='flex-1 min-w-0'>
                  <h4 className='font-semibold truncate'>{product.name}</h4>
                  <div className='flex items-center space-x-2 text-sm text-muted-foreground'>
                    <span>{product.totalSold} sold</span>
                    <span>•</span>
                    <span>{formatCurrency(product.revenue)} revenue</span>
                  </div>
                </div>

                {/* Performance Indicator */}
                <div className='flex-shrink-0 text-right'>
                  <div className='text-sm font-semibold text-green-600'>
                    {formatCurrency(product.revenue / product.totalSold)} avg
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    per unit
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
