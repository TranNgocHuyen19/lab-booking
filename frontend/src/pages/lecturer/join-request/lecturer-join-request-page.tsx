import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router'
import { Eye, Search, X } from 'lucide-react'
import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
  flexRender,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type RowSelectionState
} from '@tanstack/react-table'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { DatePicker } from '@/components/ui/date-picker'
import {
  useMyGroupsJoinRequestsQuery,
  useBulkApproveJoinRequestsMutation,
  useBulkRejectJoinRequestsMutation
} from '@/queries/group-join-request.queries'
import { useManagedResearchGroupsInfiniteQuery } from '@/queries/research-group.queries'
import { InfiniteScrollSelect } from '@/components/common/infinite-scroll-select'
import PaginationCustom from '@/components/common/pagination-custom'
import BulkActionBar from '@/components/common/bulk-action-bar'
import type { SecureGroupJoinRequestResponse } from '@/schemas/group-join-request.schema'
import { DialogReject } from '@/components/common/dialog-reject'
import { DialogApprove } from '@/components/common/dialog-approve'
import { GROUP_REJECTION_REASONS } from '@/constants/rejection-reasons'
import { RequestStatus, RequestStatusLabels } from '@/constants/types'
import { formatDateTime } from '@/utils/format'
import { PATHS } from '@/constants/paths'
import { cn } from '@/lib/utils'
import { TableSkeleton } from '@/components/common/table-skeleton'

const PAGE_SIZE = 10

interface FilterState {
  keyword: string
  status: string
  researchGroupId: string
  fromDate: string
  toDate: string
}

const getFiltersFromParams = (searchParams: URLSearchParams): FilterState => ({
  keyword: searchParams.get('keyword') || '',
  status: searchParams.get('status') || '',
  researchGroupId: searchParams.get('researchGroupId') || '',
  fromDate: searchParams.get('fromDate') || '',
  toDate: searchParams.get('toDate') || ''
})

const LecturerJoinRequestPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const page = Number(searchParams.get('page')) || 1

  const [filters, setFilters] = useState<FilterState>(() => getFiltersFromParams(searchParams))

  useEffect(() => {
    setFilters(getFiltersFromParams(searchParams))
  }, [searchParams])

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)

  const queryParams = useMemo(
    () => ({
      page,
      size: PAGE_SIZE,
      status: searchParams.get('status') || undefined,
      keyword: searchParams.get('keyword') || undefined,
      researchGroupId: searchParams.get('researchGroupId') ? Number(searchParams.get('researchGroupId')) : undefined,
      fromDate: searchParams.get('fromDate') || undefined,
      toDate: searchParams.get('toDate') || undefined
    }),
    [page, searchParams]
  )

  const {
    data: researchGroupsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingGroups
  } = useManagedResearchGroupsInfiniteQuery({
    limit: 20
  })

  const flatResearchGroups = useMemo(() => {
    return researchGroupsData?.pages.flatMap((page) => page?.data?.data || []) || []
  }, [researchGroupsData])

  const { data: queryResult, isLoading } = useMyGroupsJoinRequestsQuery(queryParams)

  const bulkApproveMutation = useBulkApproveJoinRequestsMutation()
  const bulkRejectMutation = useBulkRejectJoinRequestsMutation()

  const data = useMemo(() => queryResult?.data?.data ?? [], [queryResult])
  const totalPages = queryResult?.data?.totalPages ?? 1
  const totalItems = queryResult?.data?.totalItems ?? 0

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleApplyFilters = () => {
    const params = new URLSearchParams()
    if (filters.keyword) params.set('keyword', filters.keyword)
    if (filters.status) params.set('status', filters.status)
    if (filters.researchGroupId) params.set('researchGroupId', filters.researchGroupId)
    if (filters.fromDate) params.set('fromDate', filters.fromDate)
    if (filters.toDate) params.set('toDate', filters.toDate)
    params.set('page', '1')
    setSearchParams(params)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleApplyFilters()
    }
  }

  const setPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', newPage.toString())
    setSearchParams(params)
  }

  const handleClearFilters = () => {
    setFilters({ keyword: '', status: '', researchGroupId: '', fromDate: '', toDate: '' })
    setSearchParams(new URLSearchParams())
  }

  const hasFilter = filters.keyword || filters.status || filters.researchGroupId || filters.fromDate || filters.toDate

  const columns: ColumnDef<SecureGroupJoinRequestResponse>[] = [
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
      cell: ({ row }) => <div className='text-gray-600 font-medium'>{(page - 1) * PAGE_SIZE + row.index + 1}</div>
    },
    {
      accessorKey: 'fullName',
      header: 'Người đăng ký',
      cell: ({ row }) => (
        <div className='flex items-center gap-3'>
          <div className='flex flex-col'>
            <span className='font-semibold text-gray-900'>{row.original.fullName}</span>
            <span className='text-xs text-gray-500'>{row.original.username}</span>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'groupName',
      header: 'Nhóm đăng ký',
      cell: ({ row }) => (
        <div className='flex flex-col'>
          <span className='font-medium text-gray-900'>{row.original.groupName}</span>
        </div>
      )
    },
    {
      accessorKey: 'leaderName',
      header: 'Giảng viên hướng dẫn',
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <span className='text-sm text-gray-700 font-medium'>{row.original.leaderName}</span>
        </div>
      )
    },
    {
      accessorKey: 'createdAt',
      header: 'Ngày tạo',
      cell: ({ row }) => (
        <div className='flex flex-col text-sm text-gray-600'>
          <span>{formatDateTime(row.original.createdAt).split(' ')[0]}</span>
          <span>{formatDateTime(row.original.createdAt).split(' ')[1]}</span>
        </div>
      )
    },
    {
      accessorKey: 'responseDate',
      header: () => <div className='font-bold text-gray-700 text-[13px] uppercase'>Ngày xử lý</div>,
      cell: ({ row }) => {
        const date = row.original.responseDate
        if (!date) return <div className='text-sm text-gray-400 font-medium italic'>Chưa xử lý</div>
        return (
          <div className='flex flex-col text-sm text-gray-600 font-medium'>
            <span className='text-sm text-gray-600 font-medium'>{formatDateTime(date).split(' ')[0]}</span>
            <span className='text-xs text-gray-400'>{formatDateTime(date).split(' ')[1]}</span>
          </div>
        )
      }
    },
    {
      accessorKey: 'responseByName',
      header: () => <div className='font-bold text-gray-700 text-[13px] uppercase'>Người xử lý</div>,
      cell: ({ row }) => {
        const name = row.original.responseByName
        if (!name) return <div className='text-sm text-gray-400 font-medium italic'>Chưa có</div>
        return <div className='text-sm text-gray-900 font-bold'>{name}</div>
      }
    },
    {
      accessorKey: 'status',
      header: () => <div className='text-center font-bold text-gray-700 text-[13px] uppercase'>Trạng thái</div>,
      cell: ({ row }) => {
        const status = row.original.status
        let variant: 'pending' | 'approved' | 'rejected' | 'canceled' | 'secondary' = 'secondary'

        if (status === RequestStatus.PENDING) variant = 'pending'
        else if (status === RequestStatus.APPROVED) variant = 'approved'
        else if (status === RequestStatus.REJECTED) variant = 'rejected'
        else if (status === RequestStatus.CANCELED) variant = 'canceled'

        return (
          <div className='text-center'>
            <Badge variant={variant}>{RequestStatusLabels[status as keyof typeof RequestStatusLabels]}</Badge>
          </div>
        )
      }
    },
    {
      id: 'actions',
      header: () => <div className='text-center font-bold text-gray-700 text-[13px] uppercase'>Hành động</div>,
      cell: ({ row }) => {
        const request = row.original
        return (
          <div className='flex items-center gap-2'>
            <Button
              size='sm'
              variant='outline'
              onClick={() => navigate(PATHS.LECTURER.JOIN_REQUEST_DETAIL.replace(':id', request.requestId.toString()))}
              className='h-8 px-3 text-xs font-bold gap-1'
            >
              <Eye className='h-3.5 w-3.5' /> Xem
            </Button>
          </div>
        )
      }
    }
  ]

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.requestId.toString(),
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
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages
  })

  const selectedPendingRequests = useMemo(() => {
    return data.filter((req) => rowSelection[req.requestId.toString()] && req.status === RequestStatus.PENDING)
  }, [rowSelection, data])

  const isBulkLoading = bulkApproveMutation.isPending || bulkRejectMutation.isPending

  const handleBulkApprove = async (note: string) => {
    if (selectedPendingRequests.length === 0) return

    const requestIds = selectedPendingRequests.map((req) => req.requestId)

    try {
      await bulkApproveMutation.mutateAsync({ requestIds, responseNote: note })
      toast.success(`Đã duyệt ${requestIds.length} đơn thành công`)
      setApproveOpen(false)
      setRowSelection({})
    } catch {
      toast.error('Có lỗi xảy ra khi duyệt đơn')
    }
  }

  const handleBulkReject = async (reason: string) => {
    if (selectedPendingRequests.length === 0) return

    const requestIds = selectedPendingRequests.map((req) => req.requestId)

    try {
      await bulkRejectMutation.mutateAsync({ requestIds, responseNote: reason })
      toast.success(`Đã từ chối ${requestIds.length} đơn thành công`)
      setRejectOpen(false)
      setRowSelection({})
    } catch {
      toast.error('Có lỗi xảy ra khi từ chối đơn')
    }
  }

  return (
    <div>
      <div className='mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6'>
        <div className='flex flex-col gap-2'>
          <h1 className='text-3xl font-black tracking-tight text-primary uppercase'>Quản lý Đơn tham gia nhóm</h1>
          <p className='text-gray-500 font-medium'>Duyệt hoặc từ chối các yêu cầu gia nhập nhóm nghiên cứu của bạn.</p>
        </div>
      </div>
      <div className='bg-white rounded-lg border border-gray-200 p-4 mb-4'>
        <div className='flex flex-wrap items-center gap-4'>
          <div className='relative flex-1 min-w-[200px] max-w-md'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
            <Input
              placeholder='Tìm kiếm theo tên SV, mã SV...'
              value={filters.keyword}
              onChange={(e) => updateFilter('keyword', e.target.value)}
              onKeyDown={handleKeyDown}
              className='pl-10 h-10 border-gray-200 focus:ring-primary/20'
            />
          </div>

          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => updateFilter('status', value === 'all' ? '' : value)}
          >
            <SelectTrigger className='w-[180px] h-10 border-gray-200'>
              <SelectValue placeholder='Tất cả trạng thái' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Tất cả trạng thái</SelectItem>
              <SelectItem value={RequestStatus.PENDING} className='text-amber-600 font-medium'>
                Đang chờ
              </SelectItem>
              <SelectItem value={RequestStatus.APPROVED} className='text-emerald-600 font-medium'>
                Đã duyệt
              </SelectItem>
              <SelectItem value={RequestStatus.REJECTED} className='text-red-600 font-medium'>
                Đã từ chối
              </SelectItem>
            </SelectContent>
          </Select>

          <div className='w-[240px]'>
            <InfiniteScrollSelect
              items={flatResearchGroups}
              value={filters.researchGroupId || ''}
              onValueChange={(value) => updateFilter('researchGroupId', value)}
              placeholder='Tất cả nhóm'
              emptyText='Không tìm thấy nhóm'
              getItemValue={(item) => item.researchGroupId.toString()}
              getItemLabel={(item) => item.groupName}
              hasMore={hasNextPage}
              isLoading={isFetchingNextPage || isLoadingGroups}
              onLoadMore={fetchNextPage}
              className='h-10 border-gray-200 w-full'
            />
          </div>

          <DatePicker
            value={filters.fromDate}
            onChange={(value) => updateFilter('fromDate', value)}
            placeholder='Từ ngày'
          />

          <DatePicker
            value={filters.toDate}
            onChange={(value) => updateFilter('toDate', value)}
            placeholder='Đến ngày'
          />

          <Button onClick={handleApplyFilters} variant='primary' className='h-10 px-6'>
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
      <BulkActionBar
        selectedCount={selectedPendingRequests.length}
        selectedText='đơn đang chờ duyệt'
        onPrimaryAction={() => setApproveOpen(true)}
        onSecondaryAction={() => setRejectOpen(true)}
        isLoading={isBulkLoading}
      />
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
            ) : data.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={cn(
                    'border-b border-gray-100 hover:bg-gray-50/50 transition-colors',
                    row.getIsSelected() && 'bg-blue-50/50'
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
                <TableCell colSpan={columns.length} className='h-72 text-center'>
                  <div className='flex flex-col items-center justify-center gap-3'>
                    <div className='p-4 bg-gray-50 rounded-full'>
                      <Search className='h-10 w-10 text-gray-300' />
                    </div>
                    <p className='text-gray-400 font-medium'>Không tìm thấy đơn đăng ký nào</p>
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

      <DialogApprove
        open={approveOpen}
        onOpenChange={setApproveOpen}
        onConfirm={handleBulkApprove}
        title={`Duyệt ${selectedPendingRequests.length} đơn đã chọn`}
        isLoading={bulkApproveMutation.isPending}
      />

      <DialogReject
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        onConfirm={handleBulkReject}
        title={`Từ chối ${selectedPendingRequests.length} đơn đã chọn`}
        reasons={GROUP_REJECTION_REASONS}
        isLoading={bulkRejectMutation.isPending}
      />
    </div>
  )
}

export default LecturerJoinRequestPage
