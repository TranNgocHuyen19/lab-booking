import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router'
import { Users, MoreVertical, Search, Plus, X, Lock, Globe, Pencil, Eye, UserPlus } from 'lucide-react'
import { type VariantProps } from 'class-variance-authority'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type RowSelectionState,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge, badgeVariants } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useManagedResearchGroupsQuery, useToggleResearchGroupStatus } from '@/queries/research-group.queries'
import { StatusToggle } from '@/components/common/status-toggle'
import PaginationCustom from '@/components/common/pagination-custom'
import type { SecureResearchGroupResponse } from '@/schemas/research-group.schema'
import { GroupType, GroupTypeLabel } from '@/constants/types'
import { formatDateTime } from '@/utils/format'
import { PATHS } from '@/constants/paths'
import { handleErrorApi } from '@/utils/error-handler'
import { DialogAddMember } from '@/components/lecturer/research-group/dialog-add-member'

import { TableSkeleton } from '@/components/common/table-skeleton'

const PAGE_SIZE = 10

const ActiveToggleCell = ({ groupId, initialActive }: { groupId: number; initialActive: boolean }) => {
  const { mutate, isPending } = useToggleResearchGroupStatus()

  return (
    <StatusToggle
      value={initialActive}
      loading={isPending}
      onToggle={() => {
        mutate(groupId, {
          onSuccess: () => toast.success('Cập nhật trạng thái thành công'),
          onError: (error) => handleErrorApi({ error })
        })
      }}
    />
  )
}

export const columns: ColumnDef<SecureResearchGroupResponse>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Chọn tất cả'
        className='border-gray-300'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Chọn dòng'
        className='border-gray-300'
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    id: 'stt',
    header: 'STT',
    cell: ({ row }) => <div className='text-gray-600 font-medium'>{row.index + 1}</div>
  },
  {
    accessorKey: 'groupName',
    header: 'Tên nhóm',
    cell: ({ row }) => (
      <div className='flex flex-col'>
        <span className='font-semibold text-gray-900'>{row.getValue('groupName')}</span>
      </div>
    )
  },
  {
    accessorKey: 'projectName',
    header: 'Tên đề tài',
    cell: ({ row }) => <div className='text-gray-600 max-w-[200px] truncate'>{row.getValue('projectName') || '—'}</div>
  },
  {
    accessorKey: 'groupType',
    header: 'Loại nhóm',
    cell: ({ row }) => {
      const type = row.getValue('groupType') as string
      return (
        <Badge variant={type.toLowerCase() as VariantProps<typeof badgeVariants>['variant']} className='capitalize'>
          {GroupTypeLabel[type as keyof typeof GroupTypeLabel] || type}
        </Badge>
      )
    }
  },
  {
    accessorKey: 'isPrivate',
    header: 'Quyền riêng tư',
    cell: ({ row }) => {
      const isPrivate = row.getValue('isPrivate') as boolean
      return (
        <div className='flex items-center gap-1.5 text-gray-600'>
          {isPrivate ? <Lock className='h-3.5 w-3.5' /> : <Globe className='h-3.5 w-3.5' />}
          <span className='text-sm'>{isPrivate ? 'Riêng tư' : 'Công khai'}</span>
        </div>
      )
    }
  },
  {
    accessorKey: 'members',
    header: 'Số thành viên',
    cell: ({ row }) => {
      const members = row.original.members
      const count = members?.length ?? 0
      return (
        <div className='flex items-center justify-center gap-1 text-gray-600 font-medium'>
          <Users className='h-3.5 w-3.5' />
          {count}
        </div>
      )
    }
  },
  {
    accessorKey: 'pendingRequestsCount',
    header: 'Yêu cầu chờ',
    cell: ({ row }) => {
      const count = row.original.pendingRequestsCount ?? 0
      return (
        <div className='flex items-center justify-center'>
          <Badge
            variant={count > 0 ? 'destructive' : 'secondary'}
            className={cn('min-w-[2rem] justify-center font-bold', count === 0 && 'bg-gray-100 text-gray-400')}
          >
            {count}
          </Badge>
        </div>
      )
    }
  },
  {
    accessorKey: 'createdAt',
    header: 'Ngày tạo',
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as string
      return <div className='text-sm text-gray-600'>{formatDateTime(date)}</div>
    }
  },
  {
    accessorKey: 'modifiedAt',
    header: 'Sửa lần cuối',
    cell: ({ row }) => {
      const date = row.getValue('modifiedAt') as string
      return <div className='text-sm text-gray-600 font-medium'>{formatDateTime(date)}</div>
    }
  },
  {
    accessorKey: 'active',
    header: 'Trạng thái',
    cell: ({ row }) => (
      <ActiveToggleCell groupId={row.original.researchGroupId} initialActive={row.getValue('active')} />
    )
  },
  {
    id: 'actions',
    header: '',
    enableHiding: false,
    cell: ({ row }) => {
      const group = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0 hover:bg-gray-100'>
              <span className='sr-only'>Mở menu</span>
              <MoreVertical className='h-4 w-4 text-gray-500' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-48'>
            <DropdownMenuItem asChild className='cursor-pointer'>
              <Link to={PATHS.LECTURER.RESEARCH_GROUP_DETAIL.replace(':id', String(group.researchGroupId))}>
                <Eye className='mr-2 h-4 w-4' /> Xem chi tiết
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className='cursor-pointer'>
              <Link to={PATHS.LECTURER.EDIT_RESEARCH_GROUP.replace(':id', String(group.researchGroupId))}>
                <Pencil className='mr-2 h-4 w-4' /> Chỉnh sửa
              </Link>
            </DropdownMenuItem>
            <DialogAddMember groupId={group.researchGroupId} currentMembers={group.members || []}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className='cursor-pointer'>
                <UserPlus className='mr-2 h-4 w-4' /> Thêm thành viên
              </DropdownMenuItem>
            </DialogAddMember>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]

const LecturerResearchGroupPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const page = Number(searchParams.get('page')) || 1
  const keyword = searchParams.get('keyword') || ''
  const groupType = searchParams.get('groupType') || 'all'
  const active = searchParams.get('active') || 'all'

  const [searchInput, setSearchInput] = useState(keyword)
  const [localGroupType, setLocalGroupType] = useState(groupType)
  const [localActive, setLocalActive] = useState(active)

  useEffect(() => {
    setSearchInput(keyword)
    setLocalGroupType(groupType)
    setLocalActive(active)
  }, [keyword, groupType, active])

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const queryParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      keyword: keyword || undefined,
      groupType: groupType === '' || groupType === 'all' ? undefined : groupType,
      active: active === '' || active === 'all' ? undefined : active === 'true'
    }),
    [page, keyword, groupType, active]
  )

  const { data: queryResult, isLoading } = useManagedResearchGroupsQuery(queryParams)

  const data = queryResult?.data?.data ?? []
  const totalPages = queryResult?.data?.totalPages ?? 1
  const totalItems = queryResult?.data?.totalItems ?? 0

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,

    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: page - 1,
        pageSize: PAGE_SIZE
      }
    },

    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,

    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,

    pageCount: totalPages,

    getCoreRowModel: getCoreRowModel()
  })

  const selectedCount = Object.keys(rowSelection).length

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams)

    if (searchInput) params.set('keyword', searchInput)
    else params.delete('keyword')

    if (localGroupType && localGroupType !== 'all') params.set('groupType', localGroupType)
    else params.delete('groupType')

    if (localActive && localActive !== 'all') params.set('active', localActive)
    else params.delete('active')

    params.set('page', '1')
    setSearchParams(params)
  }

  const setPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', newPage.toString())
    setSearchParams(params)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleClearFilters = () => {
    setSearchInput('')
    setLocalGroupType('all')
    setLocalActive('all')
    setSearchParams({})
  }

  const hasFilter =
    searchInput !== '' ||
    (localGroupType !== '' && localGroupType !== 'all') ||
    (localActive !== '' && localActive !== 'all') ||
    keyword !== '' ||
    (groupType !== '' && groupType !== 'all') ||
    (active !== '' && active !== 'all')

  return (
    <div className='space-y-6'>
      <div className='mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6'>
        <div className='flex flex-col gap-2'>
          <h1 className='text-3xl font-black tracking-tight text-primary uppercase'>Quản lý Nhóm nghiên cứu</h1>
          <p className='text-gray-500 font-medium'>Danh sách các nhóm nghiên cứu bạn đang hướng dẫn và quản lý.</p>
        </div>
        <Button variant='primary' className='h-12 px-8' asChild>
          <Link to={PATHS.LECTURER.ADD_RESEARCH_GROUP}>
            <Plus className='h-5 w-5' />
            Thêm nhóm mới
          </Link>
        </Button>
      </div>

      <div className='bg-white rounded-lg border border-gray-200 p-4 mb-4'>
        <div className='flex items-center gap-4'>
          <div className='relative flex-1 max-w-md'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
            <Input
              placeholder='Tìm kiếm theo tên nhóm...'
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className='pl-10 h-10 border-gray-200'
            />
          </div>

          <Select value={localActive} onValueChange={setLocalActive}>
            <SelectTrigger className='w-[180px] h-10 border-gray-200'>
              <SelectValue placeholder='Tất cả trạng thái' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Tất cả trạng thái</SelectItem>
              <SelectItem value='true'>Hoạt động</SelectItem>
              <SelectItem value='false'>Không hoạt động</SelectItem>
            </SelectContent>
          </Select>

          <Select value={localGroupType} onValueChange={setLocalGroupType}>
            <SelectTrigger className='w-[180px] h-10 border-gray-200'>
              <SelectValue placeholder='Tất cả loại nhóm' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Tất cả loại nhóm</SelectItem>
              {Object.entries(GroupType).map(([key, value]) => (
                <SelectItem key={key} value={value}>
                  {GroupTypeLabel[value as keyof typeof GroupTypeLabel]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleSearch} variant='primary' className='h-10 px-6'>
            Lọc
          </Button>

          {hasFilter && (
            <Button variant='outline-primary' onClick={handleClearFilters} className='h-10 gap-2'>
              <X className='h-4 w-4' />
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </div>

      {selectedCount > 0 && (
        <div className='bg-white rounded-lg border border-gray-200 p-4 mb-4 flex items-center justify-between'>
          <span className='text-sm text-gray-600 font-medium'>{selectedCount} nhóm đã chọn</span>
          <div className='flex gap-2'>
            <Button size='sm' variant='approve'>
              Mở khóa
            </Button>
            <Button size='sm' variant='reject'>
              Khóa
            </Button>
          </div>
        </div>
      )}

      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='bg-gray-50 border-b border-gray-200'>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className='text-gray-700 font-semibold text-sm py-4'>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton columnCount={columns.length} />
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={cn('border-b border-gray-100 hover:bg-gray-50/50', row.getIsSelected() && 'bg-blue-50/50')}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className='py-4'>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-32 text-center'>
                  <div className='flex flex-col items-center gap-2'>
                    <Users className='h-10 w-10 text-gray-300' />
                    <p className='text-gray-500'>Không tìm thấy nhóm nghiên cứu nào</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className='mt-4'>
        <PaginationCustom
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          limit={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>
    </div>
  )
}

export default LecturerResearchGroupPage
