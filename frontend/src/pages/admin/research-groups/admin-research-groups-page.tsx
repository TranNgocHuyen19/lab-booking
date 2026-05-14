import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router'
import { Users, MoreVertical, Search, Plus, X, Lock, Globe, Pencil, Eye, Briefcase, UserPlus } from 'lucide-react'
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
import { useAdminResearchGroupsQuery, useToggleResearchGroupStatus } from '@/queries/research-group.queries'
import { StatusToggle } from '@/components/common/status-toggle'
import PaginationCustom from '@/components/common/pagination-custom'
import BulkActionBar from '@/components/common/bulk-action-bar'
import type { SecureResearchGroupResponse } from '@/schemas/research-group.schema'
import { GroupType, GroupTypeLabel, ActiveLabel } from '@/constants/types'
import { formatDateTime } from '@/utils/format'
import { handleErrorApi } from '@/utils/error-handler'
import { TableSkeleton } from '@/components/common/table-skeleton'
import { PATHS } from '@/constants/paths'
import { DialogAddMember } from '@/components/lecturer/research-group/dialog-add-member'

const PAGE_SIZE = 10

const ActiveToggleCell = ({
  groupId,
  initialActive,
  refetch
}: {
  groupId: number
  initialActive: boolean
  refetch: () => void
}) => {
  const { mutate, isPending } = useToggleResearchGroupStatus()

  return (
    <StatusToggle
      value={initialActive}
      loading={isPending}
      onToggle={() => {
        mutate(groupId, {
          onSuccess: () => {
            toast.success('Cập nhật trạng thái thành công')
            refetch()
          },
          onError: (error) => handleErrorApi({ error })
        })
      }}
    />
  )
}

const AdminResearchGroupsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const page = Number(searchParams.get('page')) || 1
  const keyword = searchParams.get('keyword') || ''
  const groupType = searchParams.get('groupType') || 'all'
  const active = searchParams.get('active') || 'all'
  const isPrivate = searchParams.get('isPrivate') || 'all'

  const [searchInput, setSearchInput] = useState(keyword)
  const [localGroupType, setLocalGroupType] = useState(groupType)
  const [localActive, setLocalActive] = useState(active)
  const [localIsPrivate, setLocalIsPrivate] = useState(isPrivate)

  useEffect(() => {
    setSearchInput(keyword)
    setLocalGroupType(groupType)
    setLocalActive(active)
    setLocalIsPrivate(isPrivate)
  }, [keyword, groupType, active, isPrivate])

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const queryParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      keyword: keyword || undefined,
      type: groupType === '' || groupType === 'all' ? undefined : groupType,
      active: active === '' || active === 'all' ? undefined : active === 'true',
      isPrivate: isPrivate === '' || isPrivate === 'all' ? undefined : isPrivate === 'true'
    }),
    [page, keyword, groupType, active, isPrivate]
  )

  const { data: queryResult, isLoading, refetch } = useAdminResearchGroupsQuery(queryParams)

  const data = queryResult?.data?.data ?? []
  const totalPages = queryResult?.data?.totalPages ?? 1
  const totalItems = queryResult?.data?.totalItems ?? 0

  const columns: ColumnDef<SecureResearchGroupResponse>[] = [
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
      cell: ({ row }) => <div className='text-gray-600 font-medium'>{row.index + 1 + (page - 1) * PAGE_SIZE}</div>
    },
    {
      accessorKey: 'groupName',
      header: 'Tên nhóm / Đề tài',
      cell: ({ row }) => (
        <div className='flex flex-col max-w-[250px]'>
          <span className='font-bold text-gray-900 truncate'>{row.getValue('groupName')}</span>
          <div className='flex items-center gap-1.5 text-xs text-gray-500 mt-1'>
            <Briefcase className='h-3 w-3 shrink-0' />
            <span className='truncate italic'>{row.original.projectName || 'Chưa cập nhật đề tài'}</span>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'leaderName',
      header: 'Chủ nhiệm',
      cell: ({ row }) => (
        <div className='flex flex-col whitespace-nowrap'>
          <span className='font-bold text-gray-700'>{row.original.leaderName}</span>
        </div>
      )
    },
    {
      accessorKey: 'groupType',
      header: 'Loại nhóm',
      cell: ({ row }) => {
        const type = row.getValue('groupType') as string
        return (
          <Badge variant={type.toLowerCase() as VariantProps<typeof badgeVariants>['variant']}>
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
      header: 'Thành viên',
      cell: ({ row }) => {
        const count = row.original.members?.length ?? 0
        return (
          <div className='flex items-center justify-center gap-1.5 text-gray-600 font-bold'>
            <Users className='h-4 w-4' />
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
          <div className='flex items-center justify-center font-bold'>
            <Badge
              variant={count > 0 ? 'destructive' : 'secondary'}
              className={cn('min-w-[2rem] justify-center text-[10px]', count === 0 && 'bg-gray-100 text-gray-400')}
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
      cell: ({ row }) => (
        <div className='text-sm text-gray-600 font-medium whitespace-nowrap'>
          {formatDateTime(row.getValue('createdAt'))}
        </div>
      )
    },
    {
      accessorKey: 'active',
      header: 'Trạng thái',
      cell: ({ row }) => (
        <ActiveToggleCell
          groupId={row.original.researchGroupId}
          initialActive={row.getValue('active')}
          refetch={refetch}
        />
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
                <Link to={PATHS.ADMIN.RESEARCH_GROUP_DETAIL.replace(':id', String(group.researchGroupId))}>
                  <Eye className='mr-2 h-4 w-4' /> Xem chi tiết
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className='cursor-pointer'>
                <Link to={PATHS.ADMIN.EDIT_RESEARCH_GROUP.replace(':id', String(group.researchGroupId))}>
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

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: { pageIndex: page - 1, pageSize: PAGE_SIZE }
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
    if (localIsPrivate && localIsPrivate !== 'all') params.set('isPrivate', localIsPrivate)
    else params.delete('isPrivate')
    params.set('page', '1')
    setSearchParams(params)
  }

  const handleClearFilters = () => {
    setSearchInput('')
    setLocalGroupType('all')
    setLocalActive('all')
    setLocalIsPrivate('all')
    setSearchParams({})
  }

  const hasFilter = searchInput !== '' || localGroupType !== 'all' || localActive !== 'all' || localIsPrivate !== 'all'

  return (
    <div className='space-y-6 pb-10'>
      <div className='flex flex-col md:flex-row md:items-end justify-between gap-6'>
        <div className='flex flex-col gap-2'>
          <h1 className='text-3xl font-black tracking-tight text-primary uppercase'>Quản lý Nhóm nghiên cứu</h1>
          <p className='text-gray-500 font-medium'>Toàn quyền quản trị danh sách các nhóm nghiên cứu trong hệ thống.</p>
        </div>
        <Button variant='primary' className='h-12 px-8 font-bold' asChild>
          <Link to={PATHS.ADMIN.ADD_RESEARCH_GROUP}>
            <Plus className='h-5 w-5 mr-2' /> Thêm nhóm mới
          </Link>
        </Button>
      </div>

      <div className='bg-white rounded-md border border-gray-200 p-4 mb-4'>
        <div className='flex flex-wrap items-center gap-4'>
          <div className='relative flex-1 min-w-[300px]'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
            <Input
              placeholder='Tìm kiếm theo tên nhóm, đề tài...'
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className='pl-10 h-10 border-gray-200'
            />
          </div>

          <Select value={localActive} onValueChange={setLocalActive}>
            <SelectTrigger className='w-[180px] h-10 border-gray-200'>
              <SelectValue placeholder='Trạng thái' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Tất cả trạng thái</SelectItem>
              <SelectItem value='true'>{ActiveLabel.true}</SelectItem>
              <SelectItem value='false'>{ActiveLabel.false}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={localGroupType} onValueChange={setLocalGroupType}>
            <SelectTrigger className='w-[180px] h-10 border-gray-200'>
              <SelectValue placeholder='Loại nhóm' />
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

          <Select value={localIsPrivate} onValueChange={setLocalIsPrivate}>
            <SelectTrigger className='w-[180px] h-10 border-gray-200'>
              <SelectValue placeholder='Quyền riêng tư' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Tất cả bảo mật</SelectItem>
              <SelectItem value='true'>Riêng tư</SelectItem>
              <SelectItem value='false'>Công khai</SelectItem>
            </SelectContent>
          </Select>

          <div className='flex gap-2 ml-auto'>
            <Button onClick={handleSearch} variant='primary' className='h-10 px-6'>
              Lọc
            </Button>
            {hasFilter && (
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
        selectedText='nhóm đã chọn'
        primaryActionLabel='Mở khóa'
        secondaryActionLabel='Khóa'
        onPrimaryAction={() => {}} // TODO: Implement bulk unlock
        onSecondaryAction={() => {}} // TODO: Implement bulk lock
      />

      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm'>
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
                  className={cn(
                    'border-b border-gray-100 hover:bg-gray-50/50 transition-all',
                    row.getIsSelected() && 'bg-primary/5'
                  )}
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
                <TableCell colSpan={columns.length} className='h-32 text-center text-gray-500 font-medium'>
                  <div className='flex flex-col items-center gap-2 py-10'>
                    <Briefcase className='h-12 w-12 text-gray-200' />
                    <p className='text-gray-400 font-bold uppercase tracking-wider text-xs'>Không tìm thấy dữ liệu</p>
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

export default AdminResearchGroupsPage
