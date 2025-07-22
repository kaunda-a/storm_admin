import { Button } from '@/components/ui/button';
import { IconUsers, IconPlus } from '@tabler/icons-react';
import Link from 'next/link';

export function UserEmptyState() {
  return (
    <div className='flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed'>
      <div className='mx-auto flex max-w-[420px] flex-col items-center justify-center text-center'>
        <IconUsers className='h-10 w-10 text-muted-foreground' />
        <h3 className='mt-4 text-lg font-semibold'>no admin users</h3>
        <p className='mb-4 mt-2 text-sm text-muted-foreground'>
          You haven't added any Admin user yet. Add one below.
        </p>
        <Button size='sm' className='relative' asChild>
          <Link href='/dashboard/users/new'>
            <IconPlus className='mr-2 h-4 w-4' />
            Add admin user to help you manage your dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
