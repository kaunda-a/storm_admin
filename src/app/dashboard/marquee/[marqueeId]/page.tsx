import FormCardSkeleton from '@/components/form-card-skeleton'
import PageContainer from '@/components/layout/page-container'
import { Suspense } from 'react'
import { MarqueeViewPage } from '@/features/marquee/components/marquee-view-page'

export const metadata = {
  title: 'Dashboard : Marquee Details'
}

type PageProps = { params: Promise<{ marqueeId: string }> }

export default async function Page(props: PageProps) {
  const params = await props.params
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <MarqueeViewPage marqueeId={params.marqueeId} />
        </Suspense>
      </div>
    </PageContainer>
  )
}
