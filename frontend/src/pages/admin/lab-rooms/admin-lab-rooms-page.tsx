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
import { Search, Plus, X, Eye, Pencil, MapPin, Users } from 'lucide-react'
import { formatDateTime } from '@/utils/format'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import BulkActionBar from '@/components/common/bulk-action-bar'
import { StatusToggle } from '@/components/common/status-toggle'
import PaginationCustom from '@/components/common/pagination-custom'
import TableSkeleton from '@/components/common/table-skeleton'
import {
  useFilterLabRoomsQuery,
  useToggleLabRoomActiveMutation,
  useUpdateBulkLabRoomStatusMutation
} from '@/queries/lab-room.queries'
import { SelectActive } from '@/components/common/select-active'
import type { SecureLabRoomResponse } from '@/schemas/lab-room.schema'
import { DialogTableAction } from '@/components/common/dialog-table-action'
import { toast } from 'sonner'
import { useNavigate } from 'react-router'
import { PATHS } from '@/constants/paths'
import { handleErrorApi } from '@/utils/error-handler'
import { DialogLabRoomDetail } from '@/components/admin/lab-rooms/dialog-lab-room-detail'

const PAGE_SIZE = 10

export default function AdminLabRoomsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page')) || 1
  const keyword = searchParams.get('keyword') || ''
  const active = searchParams.get('active') || 'all'

  const [searchInput, setSearchInput] = useState(keyword)
  const [activeFilter, setActiveFilter] = useState<string>(active || 'all')
  const [openDetailDialog, setOpenDetailDialog] = useState(false)
  const [selectedLabRoom, setSelectedLabRoom] = useState<SecureLabRoomResponse | null>(null)
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false)

  const toggleActiveMutation = useToggleLabRoomActiveMutation()
  const updateBulkStatusMutation = useUpdateBulkLabRoomStatusMutation()

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  useEffect(() => {
    setSearchInput(keyword)
    setActiveFilter(active)
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

  const { data: queryResult, isLoading } = useFilterLabRoomsQuery(queryParams)
  const data = (queryResult?.data?.data ?? []) as SecureLabRoomResponse[]
  const totalPages = queryResult?.data?.totalPages ?? 1
  const totalItems = queryResult?.data?.totalItems ?? 0

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams)

    if (searchInput) params.set('keyword', searchInput)
    else params.delete('keyword')

    if (activeFilter && activeFilter !== 'all') {
      params.set('active', activeFilter)
    } else {
      params.delete('active')
    }
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

  const handleViewDetail = (labRoom: SecureLabRoomResponse) => {
    setSelectedLabRoom(labRoom)
    setOpenDetailDialog(true)
  }

  const handleClearFilters = () => {
    setSearchInput('')
    setActiveFilter('all')
    setSearchParams({})
  }

  const hasFilter = (active !== '' && active !== 'all') || keyword !== ''

  const handleToggleActive = async (labRoom: SecureLabRoomResponse) => {
    try {
      await toggleActiveMutation.mutateAsync(labRoom.labRoomId)
      toast.success(`Đã ${labRoom.active ? 'ngừng hoạt động' : 'kích hoạt'} phòng ${labRoom.roomName}`)
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  const handleBulkActivate = async () => {
    const selectedRows = table.getSelectedRowModel().rows
    const inactiveLabRooms = selectedRows.filter((row) => !row.original.active)

    if (inactiveLabRooms.length === 0) {
      setRowSelection({})
      return
    }

    setIsBulkSubmitting(true)
    try {
      await updateBulkStatusMutation.mutateAsync({
        ids: inactiveLabRooms.map((d) => d.original.labRoomId),
        active: true
      })
      toast.success(`Đã kích hoạt ${inactiveLabRooms.length} phòng`)
      setRowSelection({})
    } catch (error) {
      handleErrorApi({ error })
    } finally {
      setIsBulkSubmitting(false)
    }
  }

  const handleBulkDeactivate = async () => {
    const selectedRows = table.getSelectedRowModel().rows
    const activeLabRooms = selectedRows.filter((row) => row.original.active)

    if (activeLabRooms.length === 0) {
      setRowSelection({})
      return
    }

    setIsBulkSubmitting(true)
    try {
      await updateBulkStatusMutation.mutateAsync({
        ids: activeLabRooms.map((d) => d.original.labRoomId),
        active: false
      })
      toast.success(`Đã ngừng hoạt động ${activeLabRooms.length} phòng`)
      setRowSelection({})
    } catch (error) {
      handleErrorApi({ error })
    } finally {
      setIsBulkSubmitting(false)
    }
  }

  const columns: ColumnDef<SecureLabRoomResponse>[] = [
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
      header: 'STT',
      cell: ({ row }) => {
        return <div className='font-medium text-gray-500'>{(page - 1) * PAGE_SIZE + row.index + 1}</div>
      },
      size: 60
    },
    {
      accessorKey: 'roomName',
      header: 'Tên phòng',
      cell: ({ row }) => {
        return (
          <div>
            <div className='font-semibold text-gray-900'>{row.getValue('roomName')}</div>
            <div className='flex items-center gap-1 text-xs text-gray-500 mt-0.5'>
              <MapPin className='h-3 w-3' />
              <span>{row.original.building || '—'}</span>
            </div>
          </div>
        )
      }
    },
    {
      accessorKey: 'capacity',
      header: 'Sức chứa',
      cell: ({ row }) => (
        <div className='flex items-center gap-1.5 text-gray-600 font-medium'>
          <Users className='h-4 w-4 text-gray-400' />
          <span>{row.getValue('capacity')}</span>
        </div>
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
            value={row.original.active}
            onToggle={() => handleToggleActive(row.original)}
            loading={toggleActiveMutation.isPending && toggleActiveMutation.variables === row.original.labRoomId}
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
                onClick: () => navigate(PATHS.ADMIN.EDIT_LAB_ROOM.replace(':id', row.original.labRoomId.toString()))
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
          <h1 className='text-3xl font-black tracking-tight text-primary uppercase'>Quản lý Phòng thực hành</h1>
          <p className='text-gray-500 font-medium'>Danh sách các phòng thực hành trong hệ thống.</p>
        </div>
        <Button onClick={() => navigate(PATHS.ADMIN.ADD_LAB_ROOM)} variant='primary' className='h-12 px-8'>
          <Plus className='mr-2 h-5 w-5' /> Thêm phòng mới
        </Button>
      </div>

      <div className='bg-white rounded-lg border border-gray-200 p-4 mb-4'>
        <div className='flex items-center gap-4'>
          <div className='relative flex-1 max-w-md'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
            <Input
              placeholder='Tìm kiếm phòng...'
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className='pl-10 h-10 border-gray-200'
            />
          </div>

          <SelectActive value={activeFilter} onValueChange={setActiveFilter} />

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

      <DialogLabRoomDetail open={openDetailDialog} onOpenChange={setOpenDetailDialog} labRoom={selectedLabRoom} />
    </div>
  )
}
