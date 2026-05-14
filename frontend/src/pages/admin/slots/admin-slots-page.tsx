import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router'
import {
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type RowSelectionState,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import { Search, Plus, Pencil, Clock, X, Eye } from 'lucide-react'
import { formatDateTime } from '@/utils/format'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { SelectActive } from '@/components/common/select-active'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import BulkActionBar from '@/components/common/bulk-action-bar'
import { StatusToggle } from '@/components/common/status-toggle'
import PaginationCustom from '@/components/common/pagination-custom'
import TableSkeleton from '@/components/common/table-skeleton'
import {
  useFilterSlotsQuery,
  useToggleSlotActiveMutation,
  useUpdateBulkSlotStatusMutation
} from '@/queries/slot.queries'
import { type SecureSlotResponse } from '@/schemas/slot.schema'
import { DialogTableAction } from '@/components/common/dialog-table-action'
import { DialogCreateUpdateSlot } from '@/components/admin/slots/dialog-create-update-slot'
import { DialogSlotDetail } from '@/components/admin/slots/dialog-slot-detail'
import { handleErrorApi } from '@/utils/error-handler'
import { toast } from 'sonner'

const PAGE_SIZE = 10

export default function AdminLabSlotsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page')) || 1
  const keyword = searchParams.get('keyword') || ''
  const active = searchParams.get('active') || 'all'

  const [searchInput, setSearchInput] = useState(keyword)
  const [localActive, setLocalActive] = useState(active)
  const [openDialog, setOpenDialog] = useState(false)
  const [openDetailDialog, setOpenDetailDialog] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<SecureSlotResponse | null>(null)
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false)

  const toggleActiveMutation = useToggleSlotActiveMutation()
  const updateBulkStatusMutation = useUpdateBulkSlotStatusMutation()

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  useEffect(() => {
    setSearchInput(keyword)
    setLocalActive(active)
  }, [keyword, active])

  const queryParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      keyword: keyword || undefined,
      active: active === '' || active === 'all' ? undefined : active === 'true'
    }),
    [page, keyword, active]
  )

  const { data: queryResult, isLoading } = useFilterSlotsQuery(queryParams)
  const data = (queryResult?.data?.data?.data ?? []) as SecureSlotResponse[]
  const totalPages = queryResult?.data?.data?.totalPages ?? 1
  const totalItems = queryResult?.data?.data?.totalItems ?? 0

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams)

    if (searchInput) params.set('keyword', searchInput)
    else params.delete('keyword')

    if (localActive && localActive !== 'all') params.set('active', localActive)
    else params.delete('active')

    params.set('page', '1')
    setSearchParams(params)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const setPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', newPage.toString())
    setSearchParams(params)
  }

  const handleCreate = () => {
    setSelectedSlot(null)
    setOpenDialog(true)
  }

  const handleEdit = (slot: SecureSlotResponse) => {
    setSelectedSlot(slot)
    setOpenDialog(true)
  }

  const handleViewDetail = (slot: SecureSlotResponse) => {
    setSelectedSlot(slot)
    setOpenDetailDialog(true)
  }

  const handleClearFilters = () => {
    setSearchInput('')
    setLocalActive('all')
    setSearchParams({})
  }

  const hasFilter = (active !== '' && active !== 'all') || keyword !== ''

  const handleToggleActive = async (slot: SecureSlotResponse) => {
    try {
      await toggleActiveMutation.mutateAsync(slot.slotId)
      toast.success(`Đã ${slot.active ? 'ngừng hoạt động' : 'kích hoạt'} ca ${slot.slotName}`)
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  const handleBulkActivate = async () => {
    const selectedRows = table.getSelectedRowModel().rows
    const inactiveSlots = selectedRows.filter((row) => !row.original.active)

    if (inactiveSlots.length === 0) {
      setRowSelection({})
      return
    }

    setIsBulkSubmitting(true)
    try {
      await updateBulkStatusMutation.mutateAsync({
        ids: inactiveSlots.map((d) => d.original.slotId),
        active: true
      })
      toast.success(`Đã kích hoạt ${inactiveSlots.length} ca sử dụng`)
      setRowSelection({})
    } catch (error) {
      handleErrorApi({ error })
    } finally {
      setIsBulkSubmitting(false)
    }
  }

  const handleBulkDeactivate = async () => {
    const selectedRows = table.getSelectedRowModel().rows
    const activeSlots = selectedRows.filter((row) => row.original.active)

    if (activeSlots.length === 0) {
      setRowSelection({})
      return
    }

    setIsBulkSubmitting(true)
    try {
      await updateBulkStatusMutation.mutateAsync({
        ids: activeSlots.map((d) => d.original.slotId),
        active: false
      })
      toast.success(`Đã ngừng hoạt động ${activeSlots.length} ca sử dụng`)
      setRowSelection({})
    } catch (error) {
      handleErrorApi({ error })
    } finally {
      setIsBulkSubmitting(false)
    }
  }

  const columns: ColumnDef<SecureSlotResponse>[] = [
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
      cell: ({ row }) => <div className='font-medium text-gray-600'>{row.index + 1 + (page - 1) * PAGE_SIZE}</div>
    },
    {
      accessorKey: 'slotName',
      header: 'Tên ca',
      cell: ({ row }) => <div className='font-semibold text-gray-900'>{row.getValue('slotName')}</div>
    },
    {
      accessorKey: 'startTime',
      header: 'Bắt đầu',
      cell: ({ row }) => (
        <div className='flex items-center gap-2 text-gray-600'>
          <Clock className='h-4 w-4' />
          <span>{row.getValue('startTime')}</span>
        </div>
      )
    },
    {
      accessorKey: 'endTime',
      header: 'Kết thúc',
      cell: ({ row }) => (
        <div className='flex items-center gap-2 text-gray-600'>
          <Clock className='h-4 w-4' />
          <span>{row.getValue('endTime')}</span>
        </div>
      )
    },
    {
      accessorKey: 'description',
      header: 'Mô tả',
      cell: ({ row }) => (
        <div className='text-gray-500 max-w-[300px] truncate'>{row.getValue('description') || '—'}</div>
      )
    },
    {
      accessorKey: 'createdBy',
      header: 'Tạo bởi',
      cell: ({ row }) => <div className='text-gray-600 text-sm'>{row.getValue('createdBy') || '—'}</div>
    },
    {
      accessorKey: 'createdAt',
      header: 'Ngày tạo',
      cell: ({ row }) => <div className='text-gray-600 text-sm'>{formatDateTime(row.getValue('createdAt'))}</div>
    },
    {
      accessorKey: 'modifiedBy',
      header: 'Sửa bởi',
      cell: ({ row }) => <div className='text-gray-600 text-sm'>{row.getValue('modifiedBy') || '—'}</div>
    },
    {
      accessorKey: 'modifiedAt',
      header: 'Sửa lần cuối',
      cell: ({ row }) => <div className='text-gray-600 text-sm'>{formatDateTime(row.getValue('modifiedAt'))}</div>
    },
    {
      accessorKey: 'active',
      header: 'Trạng thái',
      cell: ({ row }) => {
        return (
          <StatusToggle
            value={row.original.active ?? false}
            onToggle={() => handleToggleActive(row.original)}
            loading={toggleActiveMutation.isPending && toggleActiveMutation.variables === row.original.slotId}
          />
        )
      }
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        return (
          <DialogTableAction
            actions={[
              {
                label: 'Xem chi tiết',
                icon: Eye,
                onClick: () => handleViewDetail(row.original)
              },
              {
                label: 'Chỉnh sửa',
                icon: Pencil,
                onClick: () => handleEdit(row.original)
              }
            ]}
          />
        )
      }
    }
  ]

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
    pageCount: totalPages,
    getCoreRowModel: getCoreRowModel()
  })

  return (
    <div className='space-y-6'>
      <div className='mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6'>
        <div className='flex flex-col gap-2'>
          <h1 className='text-3xl font-black tracking-tight text-primary uppercase'>Quản lý Ca sử dụng</h1>
          <p className='text-gray-500 font-medium'>Danh sách các ca sử dụng phòng máy trong hệ thống.</p>
        </div>
        <Button onClick={handleCreate} variant='primary' className='h-12 px-8'>
          <Plus className='mr-2 h-5 w-5' /> Thêm ca mới
        </Button>
      </div>

      <div className='bg-white rounded-lg border border-gray-200 p-4 mb-4'>
        <div className='flex items-center gap-4'>
          <div className='relative flex-1 max-w-md'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
            <Input
              placeholder='Tìm kiếm ca...'
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className='pl-10 h-10 border-gray-200'
            />
          </div>

          <SelectActive value={localActive} onValueChange={setLocalActive} />

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

      <BulkActionBar
        selectedCount={Object.keys(rowSelection).length}
        primaryActionLabel='Kích hoạt'
        secondaryActionLabel='Ngừng hoạt động'
        onPrimaryAction={handleBulkActivate}
        onSecondaryAction={handleBulkDeactivate}
        isLoading={isBulkSubmitting}
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
              <TableSkeleton columnCount={columns.length} rowCount={PAGE_SIZE} />
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
                <TableCell colSpan={columns.length} className='h-24 text-center text-gray-500'>
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <PaginationCustom
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        limit={PAGE_SIZE}
        onPageChange={setPage}
      />

      <DialogCreateUpdateSlot open={openDialog} onOpenChange={setOpenDialog} slotToEdit={selectedSlot} />
      <DialogSlotDetail open={openDetailDialog} onOpenChange={setOpenDetailDialog} slot={selectedSlot} />
    </div>
  )
}
