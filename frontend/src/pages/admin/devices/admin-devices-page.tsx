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
import { Search, Plus, X, Tag, Eye, Pencil } from 'lucide-react'
import { formatDateTime } from '@/utils/format'
import { deviceIconMap, type DeviceIconName } from '@/utils/icon'

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
  useFilterDevicesQuery,
  useToggleDeviceActiveMutation,
  useUpdateBulkDeviceStatusMutation
} from '@/queries/device.queries'
import { SelectActive } from '@/components/common/select-active'
import { type SecuredDeviceResponse } from '@/schemas/device.schema'
import { DialogCreateUpdateDevice } from '@/components/admin/devices/dialog-create-update-device'
import { DialogDeviceDetail } from '@/components/admin/devices/dialog-device-detail'
import { DialogTableAction } from '@/components/common/dialog-table-action'
import { toast } from 'sonner'
import { handleErrorApi } from '@/utils/error-handler'

const PAGE_SIZE = 10

export default function AdminDevicesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page')) || 1
  const keyword = searchParams.get('keyword') || ''
  const active = searchParams.get('active') || 'all'

  const [searchInput, setSearchInput] = useState(keyword)
  const [activeFilter, setActiveFilter] = useState<string>(active || 'all')
  const [openDialog, setOpenDialog] = useState(false)
  const [openDetailDialog, setOpenDetailDialog] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<SecuredDeviceResponse | null>(null)
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false)

  const toggleActiveMutation = useToggleDeviceActiveMutation()
  const updateBulkStatusMutation = useUpdateBulkDeviceStatusMutation()

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

  const { data: queryResult, isLoading } = useFilterDevicesQuery(queryParams)
  const data = (queryResult?.data?.data ?? []) as SecuredDeviceResponse[]
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

  const handleCreate = () => {
    setSelectedDevice(null)
    setOpenDialog(true)
  }

  const handleEdit = (device: SecuredDeviceResponse) => {
    setSelectedDevice(device)
    setOpenDialog(true)
  }

  const handleViewDetail = (device: SecuredDeviceResponse) => {
    setSelectedDevice(device)
    setOpenDetailDialog(true)
  }

  const handleClearFilters = () => {
    setSearchInput('')
    setActiveFilter('all')
    setSearchParams({})
  }

  const hasFilter = (active !== '' && active !== 'all') || keyword !== ''

  const handleToggleActive = async (device: SecuredDeviceResponse) => {
    try {
      await toggleActiveMutation.mutateAsync(device.deviceId)
      toast.success(`Đã ${device.active ? 'ngừng hoạt động' : 'kích hoạt'} thiết bị ${device.deviceName}`)
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  const handleBulkActivate = async () => {
    const selectedRows = table.getSelectedRowModel().rows
    const inactiveDevices = selectedRows.filter((row) => !row.original.active)

    if (inactiveDevices.length === 0) {
      setRowSelection({})
      return
    }

    setIsBulkSubmitting(true)
    try {
      await updateBulkStatusMutation.mutateAsync({
        ids: inactiveDevices.map((d) => d.original.deviceId),
        active: true
      })
      toast.success(`Đã kích hoạt ${inactiveDevices.length} thiết bị`)
      setRowSelection({})
    } catch (error) {
      handleErrorApi({ error })
    } finally {
      setIsBulkSubmitting(false)
    }
  }

  const handleBulkDeactivate = async () => {
    const selectedRows = table.getSelectedRowModel().rows
    const activeDevices = selectedRows.filter((row) => row.original.active)

    if (activeDevices.length === 0) {
      setRowSelection({})
      return
    }

    setIsBulkSubmitting(true)
    try {
      await updateBulkStatusMutation.mutateAsync({
        ids: activeDevices.map((d) => d.original.deviceId),
        active: false
      })
      toast.success(`Đã ngừng hoạt động ${activeDevices.length} thiết bị`)
      setRowSelection({})
    } catch (error) {
      handleErrorApi({ error })
    } finally {
      setIsBulkSubmitting(false)
    }
  }

  const columns: ColumnDef<SecuredDeviceResponse>[] = [
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
        return <div className='font-medium text-gray-500'>{(page - 1) * 10 + row.index + 1}</div>
      },
      size: 60
    },
    {
      accessorKey: 'deviceName',
      header: 'Tên thiết bị',
      cell: ({ row }) => {
        const iconName = row.original.icon as DeviceIconName | null
        const IconComponent = iconName ? deviceIconMap[iconName] : null

        return (
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center h-10 w-10 rounded-xl bg-white text-primary border border-primary/50 shadow-sm'>
              {IconComponent ? <IconComponent className='h-5 w-5' /> : <Tag className='h-5 w-5' />}
            </div>
            <div>
              <div className='font-semibold text-gray-900'>{row.getValue('deviceName')}</div>
              <div className='text-xs text-gray-500 font-medium mt-0.5'>{row.original.deviceType}</div>
            </div>
          </div>
        )
      }
    },
    {
      header: 'Tổng số lượng',
      cell: ({ row }) => {
        return <div className='font-medium text-gray-500'>{row.original.totalQuantity}</div>
      },
      size: 60
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
            loading={toggleActiveMutation.isPending && toggleActiveMutation.variables === row.original.deviceId}
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
          <h1 className='text-3xl font-black tracking-tight text-primary uppercase'>Quản lý Thiết bị</h1>
          <p className='text-gray-500 font-medium'>Danh sách các thiết bị trong hệ thống.</p>
        </div>
        <Button onClick={handleCreate} variant='primary' className='h-12 px-8'>
          <Plus className='mr-2 h-5 w-5' /> Thêm thiết bị mới
        </Button>
      </div>

      <div className='bg-white rounded-md border border-gray-200 p-4 mb-4'>
        <div className='flex items-center gap-4'>
          <div className='relative flex-1 max-w-md'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
            <Input
              placeholder='Tìm kiếm thiết bị...'
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

      <DialogCreateUpdateDevice open={openDialog} onOpenChange={setOpenDialog} deviceToEdit={selectedDevice} />
      <DialogDeviceDetail open={openDetailDialog} onOpenChange={setOpenDetailDialog} device={selectedDevice} />
    </div>
  )
}
