'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import MarqueeForm from './marquee-form';
import { toast } from 'sonner';

type TMarqueeViewPageProps = {
  marqueeId: string;
};

export function MarqueeViewPage({
  marqueeId
}: TMarqueeViewPageProps) {
  const [marquee, setMarquee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const pageTitle = marqueeId === 'new' ? 'Create New Marquee Message' : 'Edit Marquee Message';

  useEffect(() => {
    async function fetchMarquee() {
      if (marqueeId === 'new') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/marquee/${marqueeId}`, {
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError(true);
            toast.error('Marquee message not found');
            return;
          }
          throw new Error(`Failed to fetch marquee message: ${response.status}`);
        }

        const marqueeData = await response.json();
        setMarquee(marqueeData);
      } catch (error) {
        console.error('Error fetching marquee message:', error);
        setError(true);
        toast.error('Failed to load marquee message data');
      } finally {
        setLoading(false);
      }
    }

    fetchMarquee();
  }, [marqueeId]);

  if (error) {
    notFound();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return <MarqueeForm initialData={marquee} pageTitle={pageTitle} />;
}
