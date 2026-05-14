import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router'
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
import { Eye, Search, X, History } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  useAdminFilterBookingsQuery,
  useBulkApproveBookingsMutation,
  useBulkRejectBookingsMutation,
  useBulkSystemCancelBookingsMutation
} from '@/queries/booking.queries'
import { useLabRoomsQuery } from '@/queries/lab-room.queries'
import PaginationCustom from '@/components/common/pagination-custom'
import type { SecureBookingResponse } from '@/schemas/booking.schema'
import {
  BookingStatusOptions,
  RequestStatusLabels,
  BookingTypeLabels,
  RequestStatus,
  type RequestStatusType
} from '@/constants/types'
import { formatDate } from '@/utils/format'
import { PATHS } from '@/constants/paths'
import { cn } from '@/lib/utils'
import { TableSkeleton } from '@/components/common/table-skeleton'
import BulkActionBar from '@/components/common/bulk-action-bar'
import { DialogApprove } from '@/components/common/dialog-approve'
import { DialogReject } from '@/components/common/dialog-reject'
import { BOOKING_REJECTION_REASONS } from '@/constants/rejection-reasons'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DialogStatusHistory } from '@/components/common/dialog-status-history'
import { DialogTableAction } from '@/components/common/dialog-table-action'
import { handleErrorApi } from '@/utils/error-handler'

const PAGE_SIZE = 10

interface FilterState {
  keyword: string
  status: string
  type: string
  roomId: string
}

const getFiltersFromParams = (searchParams: URLSearchParams): FilterState => ({
  keyword: searchParams.get('keyword') || '',
  status: searchParams.get('status') || '',
  type: searchParams.get('type') || '',
  roomId: searchParams.get('roomId') || ''
})

const AdminApprovalLabBookingsPage = () => {
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
  const [systemCancelOpen, setSystemCancelOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [selectedBookingForHistory, setSelectedBookingForHistory] = useState<SecureBookingResponse | null>(null)

  const queryParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      status: searchParams.get('status') || undefined,
      keyword: searchParams.get('keyword') || undefined,
      type: searchParams.get('type') || undefined,
      roomId: searchParams.get('roomId') ? Number(searchParams.get('roomId')) : undefined
    }),
    [page, searchParams]
  )

  const { data: roomsData } = useLabRoomsQuery()
  const { data: bookingsData, isLoading, refetch: refetchBookings } = useAdminFilterBookingsQuery(queryParams)

  // Force refetch when returning to the page to ensure fresh data
  useEffect(() => {
    refetchBookings()
  }, [refetchBookings])

  const bulkApproveMutation = useBulkApproveBookingsMutation()
  const bulkRejectMutation = useBulkRejectBookingsMutation()
  const bulkSystemCancelMutation = useBulkSystemCancelBookingsMutation()

  const rooms = roomsData?.data?.data || []
  const bookings = useMemo(() => bookingsData?.data || [], [bookingsData])
  const totalItems = bookingsData?.totalItems || 0
  const totalPages = bookingsData?.totalPages || 1

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleApplyFilters = () => {
    const nextParams = new URLSearchParams(searchParams)
    Object.entries(filters).forEach(([key, value]) => {
      if (!value || value === ' ') {
        nextParams.delete(key)
      } else {
        nextParams.set(key, value)
      }
    })
    nextParams.set('page', '1')
    setRowSelection({})
    setSearchParams(nextParams)
  }

  const handleClearFilters = () => {
    setFilters({ keyword: '', status: '', type: '', roomId: '' })
    setRowSelection({})
    setSearchParams(new URLSearchParams())
  }

  const hasFilter =
    filters.keyword ||
    (filters.status && filters.status !== ' ') ||
    (filters.type && filters.type !== ' ') ||
    (filters.roomId && filters.roomId !== ' ')

  const columns = useMemo<ColumnDef<SecureBookingResponse>[]>(
    () => [
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
        header: () => <div className='font-bold text-gray-700 text-[13px] uppercase'>STT</div>,
        cell: ({ row }) => <div className='text-gray-600 font-medium'>{(page - 1) * PAGE_SIZE + row.index + 1}</div>
      },
      {
        accessorKey: 'requesterName',
        header: () => <div className='font-bold text-gray-700 text-[13px] uppercase'>Người đăng ký</div>,
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <div className='flex flex-col'>
              <span className='font-semibold text-gray-900'>{row.original.requesterName}</span>
              <span className='text-xs text-gray-500 font-mono'>{row.original.requesterUsername}</span>
            </div>
          </div>
        )
      },
      {
        accessorKey: 'labRoom',
        header: () => <div className='font-bold text-gray-700 text-[13px] uppercase'>Phòng Lab</div>,
        cell: ({ row }) => (
          <div className='flex flex-col'>
            <span className='font-medium text-gray-900 text-sm'>{row.original.roomName}</span>
            <span className='text-xs text-gray-400 font-medium uppercase'>Toà {row.original.building}</span>
          </div>
        )
      },
      {
        id: 'dateShift',
        header: () => (
          <div className='text-left font-bold text-gray-700 text-[13px] uppercase whitespace-nowrap'>NGÀY & CA</div>
        ),
        cell: ({ row }) => (
          <div className='flex flex-col items-start gap-1.5'>
            <span className='font-bold text-gray-700 text-sm'>{formatDate(row.original.bookingDate)}</span>
            <div className='flex flex-wrap gap-1'>
              {row.original.slots.map((s) => (
                <Tooltip key={s.slotId}>
                  <TooltipTrigger asChild>
                    <div className='w-fit'>
                      <Badge
                        variant='outline'
                        className='text-[10px] px-1.5 py-0 h-5 border-blue-200 bg-blue-50 text-blue-700 font-bold uppercase cursor-help'
                      >
                        {s.slotName}
                      </Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side='bottom' className='font-bold text-xs bg-gray-900 border-gray-800'>
                    <p>
                      {s.startTime.substring(0, 5)} - {s.endTime.substring(0, 5)}
                    </p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        )
      },
      {
        accessorKey: 'bookingType',
        header: () => (
          <div className='text-center font-bold text-gray-700 text-[13px] uppercase whitespace-nowrap'>Loại đơn</div>
        ),
        cell: ({ row }) => (
          <div className='text-center'>
            <Badge
              variant='secondary'
              className={cn(
                'text-[10px] font-bold uppercase',
                row.original.bookingType === 'THESIS' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'
              )}
            >
              {BookingTypeLabels[row.original.bookingType as keyof typeof BookingTypeLabels]}
            </Badge>
          </div>
        )
      },
      {
        accessorKey: 'createdAt',
        header: () => <div className='font-bold text-gray-700 text-[13px] uppercase whitespace-nowrap'>Ngày tạo</div>,
        cell: ({ row }) => {
          const date = row.original.createdAt
          return (
            <div className='flex flex-col text-sm text-gray-600'>
              <span className='font-medium text-gray-900'>{date.split('T')[1].substring(0, 8)}</span>
              <span className='text-xs text-gray-400 font-medium'>{formatDate(date)}</span>
            </div>
          )
        }
      },
      {
        accessorKey: 'responseDate',
        header: () => (
          <div className='text-center font-bold text-gray-700 text-[13px] uppercase whitespace-nowrap'>Ngày xử lý</div>
        ),
        cell: ({ row }) => {
          const date = row.original.responseDate
          if (!date)
            return (
              <div className='text-center text-sm text-gray-400 font-medium italic underline underline-offset-4 decoration-gray-200 decoration-dashed'>
                Chưa xử lý
              </div>
            )
          return (
            <div className='text-center flex flex-col text-sm text-gray-600'>
              <span className='font-medium text-gray-900'>{date.split('T')[1].substring(0, 8)}</span>
              <span className='text-xs text-gray-400 font-medium'>{formatDate(date)}</span>
            </div>
          )
        }
      },
      {
        accessorKey: 'responseBy',
        header: () => <div className='text-center font-bold text-gray-700 text-[13px] uppercase'>Người xử lý</div>,
        cell: ({ row }) => {
          const name =
            row.original.responseBy?.fullName || (row.original.status === 'SYSTEM_CANCELED' ? 'Hệ thống' : null)
          if (!name) return <div className='text-center text-sm text-gray-400 font-medium italic'>Chưa có</div>
          return <div className='text-center text-sm text-gray-900 font-bold'>{name}</div>
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
          else if (status === RequestStatus.CANCELED || status === RequestStatus.SYSTEM_CANCELED) variant = 'canceled'

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
        cell: ({ row }) => (
          <div className='flex justify-center items-center gap-1.5'>
            <DialogTableAction
              actions={[
                {
                  label: 'Xem chi tiết',
                  icon: Eye,
                  onClick: () =>
                    navigate(PATHS.ADMIN.APPROVALS.BOOKING_DETAIL.replace(':id', String(row.original.bookingRequestId)))
                },
                {
                  label: 'Lịch sử quy trình',
                  icon: History,
                  onClick: () => {
                    setSelectedBookingForHistory(row.original)
                    setHistoryOpen(true)
                  }
                }
              ]}
            />
          </div>
        )
      }
    ],
    [page, navigate]
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: bookings,
    columns,
    getRowId: (row) => String(row.bookingRequestId),
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection
    }
  })

  const selectedRows = useMemo(() => {
    return bookings.filter((b) => rowSelection[String(b.bookingRequestId)])
  }, [rowSelection, bookings])

  const selectedPendingRows = useMemo(() => {
    return selectedRows.filter((b) => b.status === RequestStatus.PENDING)
  }, [selectedRows])

  const selectedCanCancelRows = useMemo(() => {
    return selectedRows.filter((b) => b.status === RequestStatus.PENDING || b.status === RequestStatus.APPROVED)
  }, [selectedRows])

  const handleBulkApprove = async (note: string) => {
    if (selectedPendingRows.length === 0) return
    const ids = selectedPendingRows.map((b) => b.bookingRequestId)
    try {
      await bulkApproveMutation.mutateAsync({ requestIds: ids, data: { responseNote: note || undefined } })
      toast.success(`Đã chấp nhận ${ids.length} đơn đăng ký thành công`)
      setRowSelection({})
      setApproveOpen(false)
    } catch (error: unknown) {
      handleErrorApi({ error })
    }
  }

  const handleBulkReject = async (reason: string) => {
    if (selectedPendingRows.length === 0) return
    const ids = selectedPendingRows.map((b) => b.bookingRequestId)
    try {
      await bulkRejectMutation.mutateAsync({ requestIds: ids, data: { responseNote: reason } })
      toast.success(`Đã từ chối ${ids.length} đơn đăng ký thành công`)
      setRowSelection({})
      setRejectOpen(false)
    } catch (error: unknown) {
      handleErrorApi({ error })
    }
  }

  const handleBulkSystemCancel = async (reason: string) => {
    if (selectedCanCancelRows.length === 0) return
    const ids = selectedCanCancelRows.map((b) => b.bookingRequestId)
    try {
      await bulkSystemCancelMutation.mutateAsync({ requestIds: ids, data: { responseNote: reason } })
      toast.success(`Đã hủy hệ thống ${ids.length} đơn đăng ký thành công`)
      setRowSelection({})
      setSystemCancelOpen(false)
    } catch (error: unknown) {
      handleErrorApi({ error })
    }
  }

  const handleConfirmAction = async (reason: string) => {
    if (rejectOpen) await handleBulkReject(reason)
    else if (systemCancelOpen) await handleBulkSystemCancel(reason)
  }

  return (
    <TooltipProvider delayDuration={100}>
      <div className='space-y-6'>
        <div className='flex flex-col md:flex-row md:items-end justify-between gap-6'>
          <div className='flex flex-col gap-2'>
            <h1 className='text-3xl font-black tracking-tight text-primary uppercase'>
              Phê duyệt đơn đăng ký sử dụng phòng
            </h1>
            <p className='text-gray-500 font-medium '>
              Xem và xử lý các đơn đăng ký sử dụng phòng thực hành từ sinh viên và giảng viên.
            </p>
          </div>
        </div>

        <div className='bg-white rounded-md border border-gray-200 p-4'>
          <div className='flex flex-wrap items-center gap-4'>
            <div className='relative flex-1 min-w-[300px]'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
              <Input
                placeholder='Tìm kiếm người đăng ký, mã số...'
                value={filters.keyword}
                onChange={(e) => updateFilter('keyword', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                className='pl-10 h-10 border-gray-200 focus:ring-primary/20'
              />
            </div>

            <Select
              value={filters.status || 'all'}
              onValueChange={(val) => updateFilter('status', val === 'all' ? ' ' : val)}
            >
              <SelectTrigger className='w-[200px] h-10 border-gray-200 shrink-0'>
                <SelectValue placeholder='Trạng thái' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Tất cả trạng thái</SelectItem>
                {BookingStatusOptions.filter((opt) => opt.value !== '').map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.type || 'all'}
              onValueChange={(val) => updateFilter('type', val === 'all' ? ' ' : val)}
            >
              <SelectTrigger className='w-[180px] h-10 border-gray-200 shrink-0'>
                <SelectValue placeholder='Loại đơn' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Tất cả loại đơn</SelectItem>
                {Object.entries(BookingTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.roomId || 'all'}
              onValueChange={(val) => updateFilter('roomId', val === 'all' ? ' ' : val)}
            >
              <SelectTrigger className='w-[180px] h-10 border-gray-200 shrink-0'>
                <SelectValue placeholder='Phòng Lab' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Tất cả phòng</SelectItem>
                {rooms.map((room) => (
                  <SelectItem key={room.labRoomId} value={String(room.labRoomId)}>
                    {room.roomName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={handleApplyFilters} variant='primary' className='h-10 px-6 font-bold'>
              Lọc
            </Button>

            {hasFilter && (
              <Button variant='outline-primary' onClick={handleClearFilters} className='h-10 gap-2 font-bold'>
                <X className='h-4 w-4' />
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </div>

        <div className='space-y-4'>
          {selectedRows.length > 0 && (
            <BulkActionBar
              selectedCount={selectedRows.length}
              selectedText={`đơn đã chọn (${selectedPendingRows.length} đơn đang chờ duyệt)`}
              onPrimaryAction={() => setApproveOpen(true)}
              onSecondaryAction={() => setRejectOpen(true)}
              onTertiaryAction={() => setSystemCancelOpen(true)}
              isLoading={
                bulkApproveMutation.isPending || bulkRejectMutation.isPending || bulkSystemCancelMutation.isPending
              }
              primaryActionLabel='Chấp nhận'
              secondaryActionLabel='Từ chối'
              tertiaryActionLabel='Hủy hệ thống'
            />
          )}

          <div className='bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm'>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className='bg-gray-50/50 hover:bg-gray-50/50 border-b border-gray-200'>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className='h-12 px-4'>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableSkeleton columnCount={columns.length} rowCount={PAGE_SIZE} />
                ) : bookings.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                      className={cn(
                        'border-b border-gray-100/80 hover:bg-gray-50/40 transition-colors',
                        row.getIsSelected() && 'bg-blue-50/30'
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className='py-4 px-4'>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className='h-72 text-center'>
                      <div className='flex flex-col items-center justify-center gap-3'>
                        <div className='p-4 bg-gray-50 rounded-full text-gray-300'>
                          <Search className='h-10 w-10' />
                        </div>
                        <p className='text-gray-400 font-medium italic'>Không tìm thấy đơn đăng ký nào.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {bookingsData && totalPages > 1 && (
            <div className='flex items-center justify-between pt-2'>
              <div className='text-[11px] font-bold text-gray-400 uppercase tracking-widest'>
                Hiển thị {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, totalItems)} / {totalItems} đơn
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
          )}
        </div>

        <DialogApprove
          open={approveOpen}
          onOpenChange={setApproveOpen}
          onConfirm={handleBulkApprove}
          title={`Chấp nhận ${selectedPendingRows.length} đơn đăng ký đã chọn`}
          description='Bạn có chắc chắn muốn chấp nhận tất cả các đơn đăng ký đang chờ đã chọn không? Hành động này không thể hoàn tác.'
          isLoading={bulkApproveMutation.isPending}
        />

        <DialogReject
          open={rejectOpen}
          onOpenChange={setRejectOpen}
          onConfirm={handleConfirmAction}
          title={`Từ chối ${selectedPendingRows.length} đơn đăng ký đã chọn`}
          reasons={BOOKING_REJECTION_REASONS}
          isLoading={bulkRejectMutation.isPending}
        />

        <DialogReject
          open={systemCancelOpen}
          onOpenChange={setSystemCancelOpen}
          onConfirm={handleConfirmAction}
          title={`Hủy hệ thống ${selectedCanCancelRows.length} đơn đăng ký đã chọn`}
          confirmLabel='Xác nhận hủy hệ thống'
          confirmVariant='warning'
          reasons={[
            'Hủy theo yêu cầu của phòng quản trị',
            'Sự cố phòng Lab ngoài ý muốn',
            'Trùng lịch ưu tiên đột xuất',
            'Hủy do vi phạm quy định sử dụng',
            'Khác'
          ]}
          description='Việc hủy bởi hệ thống sẽ thông báo đến người sử dụng và giải phóng phòng ngay lập tức.'
          isLoading={bulkSystemCancelMutation.isPending}
        />

        <DialogStatusHistory
          open={historyOpen}
          onOpenChange={setHistoryOpen}
          bookingId={selectedBookingForHistory?.bookingRequestId || 0}
          currentStatus={selectedBookingForHistory?.status as RequestStatusType}
        />
      </div>
    </TooltipProvider>
  )
}

export default AdminApprovalLabBookingsPage
