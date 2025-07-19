import { UserService } from '@/lib/services'
import { searchParamsCache } from '@/lib/searchparams'
import { UserTable } from './user-tables'
import { columns } from './user-tables/columns'

// Define UserRole type locally to avoid Prisma client generation issues
type UserRole = 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN' | 'MANAGER' | 'STAFF'

type UserListingPageProps = {}

export async function UserListingPage({}: UserListingPageProps) {
  try {
    // Get search params
    const page = searchParamsCache.get('page')
    const search = searchParamsCache.get('search')
    const pageLimit = searchParamsCache.get('perPage')
    const role = searchParamsCache.get('role')

    // Get users from database
    const result = await UserService.getUsers({
      search: search || undefined,
      role: (role as UserRole) || undefined,
      page: Number(page) || 1,
      limit: Number(pageLimit) || 10
    })

    // Ensure we have valid data
    const users = result?.users || []
    const pagination = result?.pagination || { total: 0, page: 1, limit: 10, pages: 0 }

    return (
      <UserTable
        data={users}
        totalItems={pagination.total}
        columns={columns}
      />
    )
  } catch (error) {
    console.error('Error loading users:', error)
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">Error Loading Users</h3>
        <p className="text-muted-foreground">
          There was an error loading the users. Please try again later.
        </p>
      </div>
    )
  }
}
