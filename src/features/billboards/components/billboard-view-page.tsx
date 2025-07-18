import { BillboardService } from '@/lib/services';
import { notFound } from 'next/navigation';
import BillboardForm from './billboard-form';

type TBillboardViewPageProps = {
  billboardId: string;
};

export async function BillboardViewPage({
  billboardId
}: TBillboardViewPageProps) {
  let billboard = null;
  let pageTitle = 'Create New Billboard';

  if (billboardId !== 'new') {
    billboard = await BillboardService.getBillboardById(billboardId);
    if (!billboard) {
      notFound();
    }
    pageTitle = `Edit Billboard`;
  }

  return <BillboardForm initialData={billboard} pageTitle={pageTitle} />;
}
