import { MarqueeService } from '@/lib/services'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { IconPlus, IconEdit, IconTrash, IconEye, IconEyeOff } from '@tabler/icons-react'
import Link from 'next/link'

export default async function MarqueePage() {
  const { messages, pagination } = await MarqueeService.getAllMessages({
    page: 1,
    limit: 20
  })

  const stats = await MarqueeService.getMessageStats()

  const typeColors: Record<string, string> = {
    INFO: 'bg-blue-500/10 text-blue-600',
    SUCCESS: 'bg-green-500/10 text-green-600',
    WARNING: 'bg-yellow-500/10 text-yellow-600',
    ERROR: 'bg-red-500/10 text-red-600',
    ALERT: 'bg-orange-500/10 text-orange-600',
    PROMOTION: 'bg-purple-500/10 text-purple-600',
    SYSTEM: 'bg-gray-500/10 text-gray-600',
    INVENTORY: 'bg-indigo-500/10 text-indigo-600',
    ORDER: 'bg-emerald-500/10 text-emerald-600'
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Marquee Messages</h1>
          <p className='text-muted-foreground'>
            Manage scrolling messages and alerts for the admin dashboard
          </p>
        </div>
        <Button asChild>
          <Link href='/dashboard/content/marquee/new'>
            <IconPlus className='mr-2 h-4 w-4' />
            New Message
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Total Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalMessages}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Active Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>{stats.activeMessages}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Expired Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>{stats.expiredMessages}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Message Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.messagesByType.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Messages List */}
      <Card>
        <CardHeader>
          <CardTitle>All Messages</CardTitle>
          <CardDescription>
            Manage your marquee messages and alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {messages.length === 0 ? (
              <div className='text-center py-8 text-muted-foreground'>
                No messages found. Create your first marquee message.
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className='flex items-center justify-between p-4 border rounded-lg'
                >
                  <div className='flex-1 space-y-2'>
                    <div className='flex items-center space-x-3'>
                      <h3 className='font-semibold'>{message.title}</h3>
                      <Badge className={typeColors[message.type] || 'bg-gray-500/10 text-gray-600'}>
                        {message.type}
                      </Badge>
                      <Badge variant='outline'>
                        Priority {message.priority}
                      </Badge>
                      {message.isActive ? (
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
                    <p className='text-sm text-muted-foreground line-clamp-2'>
                      {message.message}
                    </p>
                    <div className='flex items-center space-x-4 text-xs text-muted-foreground'>
                      <span>Created by {message.creator.firstName} {message.creator.lastName}</span>
                      <span>•</span>
                      <span>{new Date(message.createdAt).toLocaleDateString()}</span>
                      {message.endDate && (
                        <>
                          <span>•</span>
                          <span>Expires {new Date(message.endDate).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Button variant='ghost' size='sm' asChild>
                      <Link href={`/dashboard/content/marquee/${message.id}/edit`}>
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
