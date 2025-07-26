import { Button } from '@/components/ui/button';
import { IconMessageCircle, IconPlus } from '@tabler/icons-react';
import Link from 'next/link';

export function MarqueeEmptyState() {
  return (
    <div className='flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed'>
      <div className='mx-auto flex max-w-[420px] flex-col items-center justify-center text-center'>
        <IconMessageCircle className='h-10 w-10 text-muted-foreground' />
        <h3 className='mt-4 text-lg font-semibold'>No marquee messages found</h3>
        <p className='mb-4 mt-2 text-sm text-muted-foreground'>
          You haven't created any marquee messages yet. Add one below.
        </p>
        <Button size='sm' className='relative' asChild>
          <Link href='/dashboard/marquee/new'>
            <IconPlus className='mr-2 h-4 w-4' />
            Add Marquee Message
          </Link>
        </Button>
      </div>
    </div>
  );
}
