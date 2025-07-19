import { notFound } from 'next/navigation';
import BillboardForm from './billboard-form';

type TBillboardViewPageProps = {
  billboardId: string;
};

async function getBillboard(id: string) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/billboards/${id}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch billboard: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching billboard:', error);
    return null;
  }
}

export async function BillboardViewPage({
  billboardId
}: TBillboardViewPageProps) {
  let billboard = null;
  let pageTitle = 'Create New Billboard';

  if (billboardId !== 'new') {
    billboard = await getBillboard(billboardId);
    if (!billboard) {
      notFound();
    }
    pageTitle = `Edit Billboard`;
  }

  return <BillboardForm initialData={billboard} pageTitle={pageTitle} />;
}
