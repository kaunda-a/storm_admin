import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard Overview | Mzansi Footwear Admin',
  description: 'Overview of your Mzansi Footwear store performance and analytics.'
};

export default function OverviewPage() {
  return (
    <div className="space-y-4">
      <div className="text-center text-muted-foreground">
        <p>Additional analytics and insights will be displayed here.</p>
      </div>
    </div>
  );
}
