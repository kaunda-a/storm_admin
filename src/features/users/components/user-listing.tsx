import { UserService, UserWithDetails } from '@/lib/services'
import { searchParamsCache } from '@/lib/searchparams'
import { UserTable } from './user-tables'
import { columns } from './user-tables/columns'

type UserListingPageProps = {}

export async function UserListingPage({}: UserListingPageProps) {
  // Get search params
  const page = searchParamsCache.get('page')
  const search = searchParamsCache.get('search')
  const pageLimit = searchParamsCache.get('perPage')
  const role = searchParamsCache.get('role')

  // Get users from database
  const { users, pagination } = await UserService.getUsers({
    search,
    role: role as any,
    page: page || 1,
    limit: pageLimit || 10
  })

  return (
    <UserTable
      data={users}
      totalItems={pagination.total}
      columns={columns}
    />
  )
}
