import React, { useMemo, useState } from 'react'
import { Eye, Search } from 'lucide-react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState
} from '@tanstack/react-table'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { TableSkeleton } from '@/components/common/table-skeleton'
import { formatDate } from '@/utils/format'
import { cn } from '@/lib/utils'
import BulkActionBar from '@/components/common/bulk-action-bar'
import { DialogApprove } from '@/components/common/dialog-approve'
import { DialogReject } from '@/components/common/dialog-reject'
import { BOOKING_REJECTION_REASONS } from '@/constants/rejection-reasons'
import { BookingTypeLabels, RequestStatusLabels } from '@/constants/types'
import { useBulkApproveBookingsMutation, useBulkRejectBookingsMutation } from '@/queries/booking.queries'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { handleErrorApi } from '@/utils/error-handler'

export interface PendingRequest {
  id: number
  room: string
  shift: string
  shiftTime?: string
  bookingDate: string
  createdAt: string
  type: string
  groupName?: string | null
  status: string
  user: {
    name: string
    code: string
    avatar?: string
  }
}

export interface RecentPendingRequestsProps {
  requests: PendingRequest[]
  isLoading?: boolean
  onViewDetail?: (id: number) => void
  onViewAll?: () => void
}

const RecentPendingRequests: React.FC<RecentPendingRequestsProps> = ({
  requests,
  isLoading,
  onViewDetail,
  onViewAll
}) => {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)

  const bulkApproveMutation = useBulkApproveBookingsMutation()
  const bulkRejectMutation = useBulkRejectBookingsMutation()

  const selectedPendingRequests = useMemo(() => {
    return requests.filter((req) => rowSelection[req.id.toString()])
  }, [rowSelection, requests])

  const handleBulkApprove = async (note: string) => {
    if (selectedPendingRequests.length === 0) return
    const ids = selectedPendingRequests.map((r) => r.id)
    try {
      await bulkApproveMutation.mutateAsync({ requestIds: ids, data: { responseNote: note || undefined } })
      toast.success(`Đã duyệt ${ids.length} yêu cầu thành công`)
      setApproveOpen(false)
      setRowSelection({})
    } catch (error: unknown) {
      handleErrorApi({ error })
    }
  }

  const handleBulkReject = async (reason: string) => {
    if (selectedPendingRequests.length === 0) return
    const ids = selectedPendingRequests.map((r) => r.id)
    try {
      await bulkRejectMutation.mutateAsync({ requestIds: ids, data: { responseNote: reason } })
      toast.success(`Đã từ chối ${ids.length} yêu cầu thành công`)
      setRejectOpen(false)
      setRowSelection({})
    } catch (error: unknown) {
      handleErrorApi({ error })
    }
  }

  const columns = useMemo<ColumnDef<PendingRequest>[]>(
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
        cell: ({ row }) => <div className='text-gray-500 font-bold px-2 text-sm'>{row.index + 1}</div>
      },
      {
        accessorKey: 'user',
        header: () => <div className='font-bold text-gray-700 text-[13px] uppercase'>Người đăng ký</div>,
        cell: ({ row }) => (
          <div className='flex flex-col text-left'>
            <span className='font-bold text-gray-900 leading-none text-[15px]'>{row.original.user.name}</span>
            <span className='text-[12px] text-gray-400 font-mono mt-1'>MSSV: {row.original.user.code}</span>
          </div>
        )
      },
      {
        id: 'labRoom',
        header: () => <div className='font-bold text-gray-700 text-[13px] uppercase'>Phòng Lab</div>,
        cell: ({ row }) => (
          <div className='flex flex-col'>
            <span className='font-bold text-[#153898] text-[15px]'>{row.original.groupName || row.original.room}</span>
          </div>
        )
      },
      {
        id: 'dateShift',
        header: () => <div className='text-left font-bold text-gray-700 text-[13px] uppercase'>NGÀY & CA</div>,
        cell: ({ row }) => (
          <div className='flex flex-col items-start gap-1'>
            <span className='font-bold text-gray-700 text-[14px]'>{formatDate(row.original.bookingDate)}</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className='w-fit'>
                  <Badge
                    variant='outline'
                    className='text-[10px] px-1.5 py-0 h-4.5 border-slate-200 bg-slate-50 cursor-help uppercase font-bold'
                  >
                    {row.original.shift}
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent side='bottom' className='font-bold text-xs bg-gray-900 border-gray-800'>
                <p>{row.original.shiftTime}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )
      },
      {
        accessorKey: 'type',
        header: () => <div className='text-center font-bold text-gray-700 text-[13px] uppercase'>Loại đơn</div>,
        cell: ({ row }) => (
          <div className='text-center'>
            <Badge
              variant='secondary'
              className='text-[12px] font-bold uppercase bg-slate-100 text-slate-700 border-none px-2'
            >
              {BookingTypeLabels[row.original.type as keyof typeof BookingTypeLabels] || row.original.type}
            </Badge>
          </div>
        )
      },
      {
        accessorKey: 'status',
        header: () => <div className='text-center font-bold text-gray-700 text-[13px] uppercase'>Trạng thái</div>,
        cell: ({ row }) => (
          <div className='text-center'>
            <Badge variant='pending' className='font-bold text-[12px] uppercase px-2'>
              {RequestStatusLabels[row.original.status as keyof typeof RequestStatusLabels] || row.original.status}
            </Badge>
          </div>
        )
      },
      {
        id: 'actions',
        header: () => <div className='text-center font-bold text-gray-700 text-[13px] uppercase'>Thao tác</div>,
        cell: ({ row }) => (
          <div className='text-center'>
            <Button
              size='sm'
              variant='outline'
              onClick={() => onViewDetail?.(row.original.id)}
              className='h-9 px-4 text-[#153898] hover:bg-blue-50 border-blue-100 font-bold gap-1.5 border-primary text-sm cursor-pointer'
            >
              <Eye className='h-4 w-4' /> Xem
            </Button>
          </div>
        )
      }
    ],
    [onViewDetail]
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: requests,
    columns,
    state: {
      rowSelection
    },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id.toString()
  })

  return (
    <TooltipProvider delayDuration={100}>
      <div className='space-y-4 animate-in fade-in duration-500'>
        <BulkActionBar
          selectedCount={selectedPendingRequests.length}
          selectedText='đơn đang chờ duyệt'
          primaryActionLabel='Duyệt'
          secondaryActionLabel='Từ chối'
          onPrimaryAction={() => setApproveOpen(true)}
          onSecondaryAction={() => setRejectOpen(true)}
          isLoading={bulkApproveMutation.isPending || bulkRejectMutation.isPending}
          className='bg-white border-gray-200'
        />

        <div className='bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm'>
          <div className='px-6 py-5 border-b border-gray-100 flex items-center justify-between'>
            <h3 className='text-base font-black text-primary uppercase tracking-wider'>Yêu cầu chờ duyệt gần đây</h3>
            <Button
              variant='link'
              onClick={onViewAll}
              className='h-auto p-0 text-[13px] font-bold uppercase text-primary hover:no-underline cursor-pointer hover:underline'
            >
              Xem tất cả
            </Button>
          </div>

          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className='bg-gray-50/50 border-b border-gray-100 h-14'>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className='text-[13px] font-bold text-gray-700 uppercase tracking-tight px-4'
                      >
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableSkeleton columnCount={columns.length} rowCount={5} />
                ) : requests.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                      className={cn(
                        'border-b border-gray-100 hover:bg-gray-50/50 transition-colors h-20',
                        row.getIsSelected() && 'bg-blue-50/50'
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className='px-4 py-4'>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className='h-48 text-center'>
                      <div className='flex flex-col items-center justify-center gap-3'>
                        <div className='p-4 bg-gray-50 rounded-full'>
                          <Search className='h-8 w-8 text-gray-300' />
                        </div>
                        <p className='text-muted-foreground font-medium'>Không có yêu cầu nào đang chờ xử lý</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
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
          reasons={BOOKING_REJECTION_REASONS}
          isLoading={bulkRejectMutation.isPending}
        />
      </div>
    </TooltipProvider>
  )
}

export default RecentPendingRequests
