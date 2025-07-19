import { notFound } from 'next/navigation';
import MarqueeForm from './marquee-form';

type TMarqueeViewPageProps = {
  marqueeId: string;
};

async function getMarqueeMessage(id: string) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/marquee/${id}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch marquee message: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching marquee message:', error);
    return null;
  }
}

export async function MarqueeViewPage({
  marqueeId
}: TMarqueeViewPageProps) {
  let marquee = null;
  let pageTitle = 'Create New Marquee Message';

  if (marqueeId !== 'new') {
    marquee = await getMarqueeMessage(marqueeId);
    if (!marquee) {
      notFound();
    }
    pageTitle = `Edit Marquee Message`;
  }

  return <MarqueeForm initialData={marquee} pageTitle={pageTitle} />;
}
