import FormCardSkeleton from '@/components/form-card-skeleton'
import PageContainer from '@/components/layout/page-container'
import { Suspense } from 'react'
import { BillboardViewPage } from '@/features/billboards/components/billboard-view-page'

export const metadata = {
  title: 'Dashboard : Billboard Details'
}

type PageProps = { params: Promise<{ billboardId: string }> }

export default async function Page(props: PageProps) {
  const params = await props.params
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <BillboardViewPage billboardId={params.billboardId} />
        </Suspense>
      </div>
    </PageContainer>
  )
}
