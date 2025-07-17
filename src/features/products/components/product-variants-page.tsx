import { ProductService } from '@/lib/services'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  IconArrowLeft, 
  IconPlus, 
  IconEdit, 
  IconTrash,
  IconPackage,
  IconPalette,
  IconRuler,
  IconCurrencyDollar,
  IconAlertTriangle
} from '@tabler/icons-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface ProductVariantsPageProps {
  productId: string
}

export async function ProductVariantsPage({ productId }: ProductVariantsPageProps) {
  const product = await ProductService.getProductById(productId)

  if (!product) {
    notFound()
  }

  const variants = await ProductService.getProductVariants(productId)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount)
  }

  const getStockStatus = (stock: number, lowStockThreshold: number) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'bg-red-500/10 text-red-600 border-red-200' }
    if (stock <= lowStockThreshold) return { label: 'Low Stock', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200' }
    return { label: 'In Stock', color: 'bg-green-500/10 text-green-600 border-green-200' }
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <Button variant='ghost' size='sm' asChild>
            <Link href='/dashboard/products'>
              <IconArrowLeft className='h-4 w-4 mr-2' />
              Back to Products
            </Link>
          </Button>
          <div>
            <h1 className='text-2xl font-bold'>{product.name} - Variants</h1>
            <p className='text-muted-foreground'>
              Manage sizes, colors, and inventory for this product
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/dashboard/products/${productId}/variants/new`}>
            <IconPlus className='h-4 w-4 mr-2' />
            Add Variant
          </Link>
        </Button>
      </div>

      {/* Product Info */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <IconPackage className='h-5 w-5 mr-2' />
            Product Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label className='text-sm font-medium text-muted-foreground'>Product Name</label>
              <p className='font-semibold'>{product.name}</p>
            </div>
            <div>
              <label className='text-sm font-medium text-muted-foreground'>Category</label>
              <p>{product.category.name}</p>
            </div>
            <div>
              <label className='text-sm font-medium text-muted-foreground'>Brand</label>
              <p>{product.brand.name}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Variants List */}
      <Card>
        <CardHeader>
          <CardTitle>Product Variants</CardTitle>
          <CardDescription>
            Manage different sizes, colors, and pricing for this product
          </CardDescription>
        </CardHeader>
        <CardContent>
          {variants.length === 0 ? (
            <div className='text-center py-12'>
              <IconPackage className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
              <h3 className='text-lg font-semibold mb-2'>No variants found</h3>
              <p className='text-muted-foreground mb-4'>
                Create your first product variant to start selling this item.
              </p>
              <Button asChild>
                <Link href={`/dashboard/products/${productId}/variants/new`}>
                  <IconPlus className='h-4 w-4 mr-2' />
                  Add First Variant
                </Link>
              </Button>
            </div>
          ) : (
            <div className='space-y-4'>
              {variants.map((variant) => {
                const stockStatus = getStockStatus(variant.stock, variant.lowStockThreshold)
                
                return (
                  <div
                    key={variant.id}
                    className='flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors'
                  >
                    <div className='flex items-center space-x-4'>
                      {/* Color Indicator */}
                      <div className='flex items-center space-x-2'>
                        <div 
                          className='w-6 h-6 rounded-full border-2 border-gray-300'
                          style={{ backgroundColor: variant.color.toLowerCase() }}
                          title={variant.color}
                        />
                        <div>
                          <div className='flex items-center space-x-2'>
                            <IconPalette className='h-4 w-4 text-muted-foreground' />
                            <span className='font-medium'>{variant.color}</span>
                          </div>
                          <div className='flex items-center space-x-2 text-sm text-muted-foreground'>
                            <IconRuler className='h-3 w-3' />
                            <span>Size {variant.size}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='flex items-center space-x-6'>
                      {/* Price */}
                      <div className='text-right'>
                        <div className='flex items-center space-x-1'>
                          <IconCurrencyDollar className='h-4 w-4 text-muted-foreground' />
                          <span className='font-semibold'>
                            {formatCurrency(variant.price.toNumber())}
                          </span>
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          SKU: {variant.sku}
                        </div>
                      </div>

                      {/* Stock Status */}
                      <div className='text-right'>
                        <Badge className={stockStatus.color}>
                          {stockStatus.label}
                        </Badge>
                        <div className='text-sm text-muted-foreground mt-1'>
                          {variant.stock} units
                          {variant.stock <= variant.lowStockThreshold && variant.stock > 0 && (
                            <IconAlertTriangle className='inline h-3 w-3 ml-1 text-yellow-600' />
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className='flex items-center space-x-2'>
                        <Button variant='ghost' size='sm' asChild>
                          <Link href={`/dashboard/products/${productId}/variants/${variant.id}/edit`}>
                            <IconEdit className='h-4 w-4' />
                          </Link>
                        </Button>
                        <Button variant='ghost' size='sm'>
                          <IconTrash className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inventory Summary */}
      {variants.length > 0 && (
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>Total Variants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{variants.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>Total Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {variants.reduce((sum, variant) => sum + variant.stock, 0)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>Low Stock Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-yellow-600'>
                {variants.filter(v => v.stock <= v.lowStockThreshold && v.stock > 0).length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>Out of Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-red-600'>
                {variants.filter(v => v.stock === 0).length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
