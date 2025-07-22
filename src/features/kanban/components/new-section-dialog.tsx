'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import { useTaskStore } from '../utils/store';

export default function NewSectionDialog() {
  const addCol = useTaskStore((state) => state.addCol);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    const { title } = Object.fromEntries(formData);

    if (typeof title !== 'string') return;
    addCol(title);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='secondary' size='lg' className='w-full'>
          ＋ Add New Section
        </Button>
      </DialogTrigger>
      <DialogContent className='w-[95vw] max-w-[425px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Add New Section</DialogTitle>
          <DialogDescription>
            What section you want to add today?
          </DialogDescription>
        </DialogHeader>
        <form
          id='todo-form'
          className='grid gap-4 py-4 px-1'
          onSubmit={handleSubmit}
        >
          <div className='space-y-2'>
            <Input
              id='title'
              name='title'
              placeholder='Section title...'
              className='w-full text-sm'
            />
          </div>
        </form>
        <DialogFooter>
          <DialogTrigger asChild>
            <Button type='submit' size='sm' form='todo-form'>
              Add Section
            </Button>
          </DialogTrigger>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
