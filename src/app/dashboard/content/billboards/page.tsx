import { BillboardService } from '@/lib/services'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { IconPlus, IconEdit, IconTrash, IconEye, IconEyeOff, IconExternalLink } from '@tabler/icons-react'
import Link from 'next/link'
import Image from 'next/image'

export default async function BillboardsPage() {
  const { billboards, pagination } = await BillboardService.getAllBillboards({
    page: 1,
    limit: 20
  })

  const stats = await BillboardService.getBillboardStats()

  const typeColors = {
    PROMOTIONAL: 'bg-purple-500/10 text-purple-600',
    ANNOUNCEMENT: 'bg-blue-500/10 text-blue-600',
    PRODUCT_LAUNCH: 'bg-green-500/10 text-green-600',
    SALE: 'bg-red-500/10 text-red-600',
    SEASONAL: 'bg-yellow-500/10 text-yellow-600',
    SYSTEM_MESSAGE: 'bg-gray-500/10 text-gray-600',
    BRAND_CAMPAIGN: 'bg-indigo-500/10 text-indigo-600'
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Billboards</h1>
          <p className='text-muted-foreground'>
            Manage promotional banners and announcements
          </p>
        </div>
        <Button asChild>
          <Link href='/dashboard/content/billboards/new'>
            <IconPlus className='mr-2 h-4 w-4' />
            New Billboard
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Total Billboards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalBillboards}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Active Billboards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>{stats.activeBillboards}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Expired Billboards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>{stats.expiredBillboards}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Billboard Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.billboardsByType.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Billboards List */}
      <Card>
        <CardHeader>
          <CardTitle>All Billboards</CardTitle>
          <CardDescription>
            Manage your promotional billboards and announcements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {billboards.length === 0 ? (
              <div className='text-center py-8 text-muted-foreground'>
                No billboards found. Create your first billboard.
              </div>
            ) : (
              billboards.map((billboard) => (
                <div
                  key={billboard.id}
                  className='flex items-start space-x-4 p-4 border rounded-lg'
                >
                  {/* Image Preview */}
                  {billboard.imageUrl && (
                    <div className='relative w-24 h-16 rounded-md overflow-hidden flex-shrink-0'>
                      <Image
                        src={billboard.imageUrl}
                        alt={billboard.title}
                        fill
                        className='object-cover'
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className='flex-1 space-y-2'>
                    <div className='flex items-center space-x-3'>
                      <h3 className='font-semibold'>{billboard.title}</h3>
                      <Badge className={typeColors[billboard.type]}>
                        {billboard.type.replace('_', ' ')}
                      </Badge>
                      <Badge variant='outline'>
                        {billboard.position.replace('_', ' ')}
                      </Badge>
                      {billboard.isActive ? (
                        <Badge variant='default' className='bg-green-500'>
                          <IconEye className='w-3 h-3 mr-1' />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant='secondary'>
                          <IconEyeOff className='w-3 h-3 mr-1' />
                          Inactive
                        </Badge>
                      )}
                    </div>
                    
                    {billboard.description && (
                      <p className='text-sm text-muted-foreground line-clamp-2'>
                        {billboard.description}
                      </p>
                    )}

                    {billboard.linkUrl && (
                      <div className='flex items-center space-x-2 text-sm'>
                        <IconExternalLink className='w-4 h-4' />
                        <span className='text-muted-foreground'>Links to:</span>
                        <span className='font-medium'>{billboard.linkText || 'Learn More'}</span>
                      </div>
                    )}

                    <div className='flex items-center space-x-4 text-xs text-muted-foreground'>
                      <span>Created by {billboard.creator.firstName} {billboard.creator.lastName}</span>
                      <span>•</span>
                      <span>{new Date(billboard.createdAt).toLocaleDateString()}</span>
                      {billboard.endDate && (
                        <>
                          <span>•</span>
                          <span>Expires {new Date(billboard.endDate).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className='flex items-center space-x-2'>
                    <Button variant='ghost' size='sm' asChild>
                      <Link href={`/dashboard/content/billboards/${billboard.id}/edit`}>
                        <IconEdit className='h-4 w-4' />
                      </Link>
                    </Button>
                    <Button variant='ghost' size='sm'>
                      <IconTrash className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
