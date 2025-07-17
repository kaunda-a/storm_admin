import FormCardSkeleton from '@/components/form-card-skeleton'
import PageContainer from '@/components/layout/page-container'
import { Suspense } from 'react'
import { ProductVariantsPage } from '@/features/products/components/product-variants-page'

export const metadata = {
  title: 'Dashboard : Product Variants'
}

type PageProps = { params: Promise<{ productId: string }> }

export default async function Page(props: PageProps) {
  const params = await props.params
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <ProductVariantsPage productId={params.productId} />
        </Suspense>
      </div>
    </PageContainer>
  )
}
