'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileUploader } from '@/components/file-uploader'; // ✅ fixed import

const formSchema = z.object({
  label: z.string().min(2),
  imageUrl: z.string().url(),
});

type BillboardFormValues = z.infer<typeof formSchema>;

interface BillboardFormProps {
  initialData?: BillboardFormValues;
  pageTitle: string;
}

export default function BillboardForm({ initialData, pageTitle }: BillboardFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<BillboardFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      label: '',
      imageUrl: '',
    },
  });

  const onSubmit = async (values: BillboardFormValues) => {
    try {
      setLoading(true);
      let imageUrl = values.imageUrl;

      if (imageUrl.startsWith('blob:')) {
        const file = form.getValues('imageUrl') as unknown as File;
        const uploadResult = await uploadImage(file);
        imageUrl = uploadResult.url;
      }

      const response = await fetch('/api/billboards', {
        method: initialData ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, imageUrl }),
      });

      if (!response.ok) throw new Error('Failed to save billboard');

      toast.success('Billboard saved!');
      router.refresh();
      router.push('/dashboard/billboards');
    } catch (error) {
      toast.error((error as Error).message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <h1 className="text-2xl font-bold">{pageTitle}</h1>
      <Input
        disabled={loading}
        placeholder="Label"
        {...form.register('label')}
      />
      <FileUploader
        disabled={loading}
        onChange={(url) => form.setValue('imageUrl', url || '')}
      />
      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save'}
      </Button>
    </form>
  );
}

// ✅ client-safe upload helper
async function uploadImage(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error('Image upload failed');
  }

  return res.json();
}

