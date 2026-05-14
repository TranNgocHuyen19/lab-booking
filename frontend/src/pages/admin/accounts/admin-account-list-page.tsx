import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Search, Plus, Users, Eye, MoreVertical, X, User as UserIcon } from 'lucide-react'
import {
  type ColumnDef,
  type RowSelectionState,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAdminFilterUsersQuery, useUpdateUserActiveMutation } from '@/queries/user.queries'
import { toast } from 'sonner'
import { PATHS } from '@/constants/paths'
import { StatusToggle } from '@/components/common/status-toggle'
import PaginationCustom from '@/components/common/pagination-custom'
import { TableSkeleton } from '@/components/common/table-skeleton'
import BulkActionBar from '@/components/common/bulk-action-bar'
import type { SecureUserResponse } from '@/schemas/user.schema'

const PAGE_SIZE = 10

const AdminAccountListPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const page = Number(searchParams.get('page')) || 1
  const keyword = searchParams.get('keyword') || ''
  const role = searchParams.get('role') || 'all'
  const active = searchParams.get('active') || 'all'

  const [searchInput, setSearchInput] = useState(keyword)
  const [localRole, setLocalRole] = useState(role)
  const [localActive, setLocalActive] = useState(active)

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  useEffect(() => {
    setSearchInput(keyword)
    setLocalRole(role)
    setLocalActive(active)
  }, [keyword, role, active])

  const queryParams = useMemo(
    () => ({
      keyword: keyword || undefined,
      role: role === 'all' ? undefined : role,
      active: active === 'all' ? undefined : active === 'true',
      page,
      size: PAGE_SIZE
    }),
    [keyword, role, active, page]
  )

  const { data: userData, isLoading, refetch } = useAdminFilterUsersQuery(queryParams)
  const updateActiveMutation = useUpdateUserActiveMutation()

  const handleToggleActive = async (username: string, currentActive: boolean) => {
    try {
      await updateActiveMutation.mutateAsync({ username, active: !currentActive })
      toast.success(currentActive ? 'Vô hiệu hóa tài khoản thành công' : 'Kích hoạt tài khoản thành công')
      refetch()
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái')
    }
  }

  const selectedCount = Object.keys(rowSelection).length

  const columns: ColumnDef<SecureUserResponse>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Select all'
          className='translate-y-[2px]'
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label='Select row'
          className='translate-y-[2px]'
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40
    },
    {
      id: 'stt',
      header: 'STT',
      cell: ({ row }) => <div className='text-gray-600 font-medium'>{row.index + 1 + (page - 1) * PAGE_SIZE}</div>
    },
    {
      accessorKey: 'fullName',
      header: 'Người dùng',
      cell: ({ row }) => (
        <div className='flex items-center gap-3'>
          <div className='h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-[#153898] font-bold shadow-sm'>
            {row.original.fullName.charAt(0).toUpperCase()}
          </div>
          <div className='flex flex-col'>
            <span className='font-bold text-gray-900'>{row.original.fullName}</span>
            <span className='text-xs text-gray-500 font-mono'>{row.original.username}</span>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'role',
      header: 'Vai trò',
      cell: ({ row }) => {
        const roleValue = row.getValue('role') as string
        switch (roleValue) {
          case 'ADMIN':
            return (
              <Badge className='bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200'>
                Quản trị viên
              </Badge>
            )
          case 'LECTURER':
            return <Badge className='bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200'>Giảng viên</Badge>
          case 'STUDENT':
            return <Badge className='bg-green-100 text-green-700 hover:bg-green-100 border-green-200'>Sinh viên</Badge>
          default:
            return <Badge variant='outline'>{roleValue}</Badge>
        }
      }
    },
    {
      accessorKey: 'faculty',
      header: 'Khoa / Ngành',
      cell: ({ row }) => (
        <div className='flex flex-col'>
          <span className='text-sm text-gray-700 font-medium'>{row.original.faculty || '—'}</span>
          <span className='text-xs text-gray-500'>{row.original.department || '—'}</span>
        </div>
      )
    },
    {
      accessorKey: 'active',
      header: 'Trạng thái',
      cell: ({ row }) => (
        <StatusToggle
          value={row.getValue('active')}
          loading={updateActiveMutation.isPending}
          onToggle={() => handleToggleActive(row.original.username, row.original.active)}
        />
      )
    },
    {
      id: 'actions',
      header: () => <div className='text-right'></div>,
      cell: ({ row }) => (
        <div className='flex justify-center gap-2'>
          <Button
            variant='ghost'
            size='sm'
            className='h-8 w-8 p-0 text-[#153898] hover:bg-blue-50'
            onClick={() => navigate(`${PATHS.ADMIN.ACCOUNTS}/${row.original.username}`)}
          >
            <Eye className='h-4 w-4' />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                <MoreVertical className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-48 rounded-xl'>
              <DropdownMenuItem
                className='font-medium cursor-pointer'
                onClick={() => navigate(`${PATHS.ADMIN.ACCOUNTS}/${row.original.username}`)}
              >
                <UserIcon className='h-4 w-4 mr-2' />
                Xem chi tiết
              </DropdownMenuItem>
              <DropdownMenuItem
                className={`font-medium cursor-pointer ${row.original.active ? 'text-red-500 focus:text-red-500' : 'text-green-600 focus:text-green-600'}`}
                onClick={() => handleToggleActive(row.original.username, row.original.active)}
              >
                {row.original.active ? (
                  <>
                    <X className='h-4 w-4 mr-2' />
                    Khóa tài khoản
                  </>
                ) : (
                  <>
                    <Plus className='h-4 w-4 mr-2' />
                    Kích hoạt lại
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ]

  const data = userData?.data?.data ?? []
  const totalPages = userData?.data?.totalPages ?? 1
  const totalItems = userData?.data?.totalItems ?? 0

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection
    }
  })

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams)
    if (searchInput) params.set('keyword', searchInput)
    else params.delete('keyword')
    if (localRole && localRole !== 'all') params.set('role', localRole)
    else params.delete('role')
    if (localActive && localActive !== 'all') params.set('active', localActive)
    else params.delete('active')
    params.set('page', '1')
    setSearchParams(params)
  }

  const handleClearFilters = () => {
    setSearchInput('')
    setLocalRole('all')
    setLocalActive('all')
    setSearchParams({})
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col md:flex-row md:items-end justify-between gap-6'>
        <div className='flex flex-col gap-2'>
          <h1 className='text-3xl font-black tracking-tight text-[#153898] uppercase flex items-center gap-3'>
            Quản lý Tài khoản
          </h1>
          <p className='text-gray-500 font-medium'>
            Quản lý danh sách người dùng, phân quyền và trạng thái hoạt động trong hệ thống.
          </p>
        </div>
        <Button
          variant='primary'
          className='h-12 px-8 rounded-sm'
          onClick={() => navigate(PATHS.ADMIN.ACCOUNTS + '/create')}
        >
          <Plus className='h-5 w-5' /> Thêm tài khoản GV
        </Button>
      </div>

      <div className='bg-white rounded-md border border-gray-200 p-4 mb-4'>
        <div className='flex flex-wrap items-center gap-4'>
          <div className='relative flex-1 min-w-[300px]'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
            <Input
              placeholder='Tìm kiếm theo mã số, họ tên, email...'
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className='pl-10 h-10 border-gray-200'
            />
          </div>

          <Select value={localRole} onValueChange={setLocalRole}>
            <SelectTrigger className='w-[180px] h-10 border-gray-200'>
              <SelectValue placeholder='Vai trò' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Tất cả vai trò</SelectItem>
              <SelectItem value='LECTURER'>Giảng viên</SelectItem>
              <SelectItem value='STUDENT'>Sinh viên</SelectItem>
              <SelectItem value='ADMIN'>Quản trị viên</SelectItem>
            </SelectContent>
          </Select>

          <Select value={localActive} onValueChange={setLocalActive}>
            <SelectTrigger className='w-[180px] h-10 border-gray-200'>
              <SelectValue placeholder='Trạng thái' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Tất cả trạng thái</SelectItem>
              <SelectItem value='true'>Hoạt động</SelectItem>
              <SelectItem value='false'>Đã khóa</SelectItem>
            </SelectContent>
          </Select>

          <div className='flex gap-2 ml-auto'>
            <Button onClick={handleSearch} variant='primary' className='h-10 px-6'>
              Lọc
            </Button>
            {(keyword || role !== 'all' || active !== 'all') && (
              <Button variant='outline-primary' onClick={handleClearFilters} className='h-10 gap-2 transition-all'>
                <X className='h-4 w-4' />
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </div>
      </div>

      <BulkActionBar
        selectedCount={selectedCount}
        selectedText='tài khoản đã chọn'
        primaryActionLabel='Mở khóa'
        secondaryActionLabel='Khóa'
        onPrimaryAction={() => {}} // TODO: Implement bulk activate
        onSecondaryAction={() => {}} // TODO: Implement bulk lock
      />

      <div className='bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='bg-gray-50/50 hover:bg-gray-50/50'>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className='font-bold text-gray-700 py-4'>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton columnCount={columns.length} rowCount={PAGE_SIZE} />
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className='border-b border-gray-100 hover:bg-blue-50/30 transition-colors'>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className='py-4'>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-40 text-center text-gray-500 font-medium'>
                  <div className='flex flex-col items-center gap-2'>
                    <Users className='h-12 w-12 text-gray-200' />
                    Không tìm thấy người dùng nào phù hợp
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className='flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm'>
        <div className='text-sm text-gray-500 font-medium'>
          Hiển thị <strong>{data.length}</strong> trên tổng số <strong>{totalItems}</strong> người dùng
        </div>
        <PaginationCustom
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          limit={PAGE_SIZE}
          onPageChange={(p) => {
            const params = new URLSearchParams(searchParams)
            params.set('page', String(p))
            setSearchParams(params)
          }}
        />
      </div>
    </div>
  )
}

export default AdminAccountListPage
