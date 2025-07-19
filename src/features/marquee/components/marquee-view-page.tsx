import { notFound } from 'next/navigation';
import MarqueeForm from './marquee-form';

type TMarqueeViewPageProps = {
  marqueeId: string;
};

async function getMarqueeMessage(id: string) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/marquee/${id}`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      return null;
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
