import { delay } from '@/constants/data';
import { BarGraph } from '@/features/overview/components/bar-graph';

export default async function BarStats() {
  await delay(1000);

  return <BarGraph />;
}
