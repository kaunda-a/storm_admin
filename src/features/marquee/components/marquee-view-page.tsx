import { MarqueeService } from '@/lib/services';
import { notFound } from 'next/navigation';
import MarqueeForm from './marquee-form';

type TMarqueeViewPageProps = {
  marqueeId: string;
};

export async function MarqueeViewPage({
  marqueeId
}: TMarqueeViewPageProps) {
  let marquee = null;
  let pageTitle = 'Create New Marquee Message';

  if (marqueeId !== 'new') {
    marquee = await MarqueeService.getMessageById(marqueeId);
    if (!marquee) {
      notFound();
    }
    pageTitle = `Edit Marquee Message`;
  }

  return <MarqueeForm initialData={marquee} pageTitle={pageTitle} />;
}
