import { UserService } from '@/lib/services'
import { searchParamsCache } from '@/lib/searchparams'
import { UserTable } from './user-tables'
import { columns } from './user-tables/columns'

// Define UserRole type locally to avoid Prisma client generation issues
type UserRole = 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN' | 'MANAGER' | 'STAFF'

type UserListingPageProps = {}

export async function UserListingPage({}: UserListingPageProps) {
  // Get search params
  const page = searchParamsCache.get('page')
  const search = searchParamsCache.get('search')
  const pageLimit = searchParamsCache.get('perPage')
  const role = searchParamsCache.get('role')

  // Get users from database
  const { users, pagination } = await UserService.getUsers({
    search: search || undefined,
    role: (role as UserRole) || undefined,
    page: Number(page) || 1,
    limit: Number(pageLimit) || 10
  })

  return (
    <UserTable
      data={users}
      totalItems={pagination.total}
      columns={columns}
    />
  )
}
