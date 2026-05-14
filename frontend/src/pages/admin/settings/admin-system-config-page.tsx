import { useState } from 'react'
import { Pencil, Clock, ShieldCheck, Globe, type LucideIcon, History as HistoryIcon } from 'lucide-react'
import { useSearchParams } from 'react-router'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { DialogUpdateSystemConfig } from '@/components/admin/settings/dialog-update-system-config'

import {
  useAttendanceConfigQuery,
  useBookingConfigQuery,
  useAllConfigHistoryQuery
} from '@/queries/system-config.queries'

import { formatDateTime } from '@/utils/format'
import TableSkeleton from '@/components/common/table-skeleton'

const getConfigUnit = (key: string) => {
  const uKey = (key || '').toUpperCase()
  if (uKey.includes('MINUTE')) return 'phút'
  if (uKey.includes('METER')) return 'mét'
  if (uKey.includes('DAY')) return 'ngày'
  return ''
}

function ConfigSkeleton() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
      {[1, 2, 3].map((i) => (
        <div key={i} className='space-y-3 p-4 border border-slate-100 rounded-xl'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-8 w-full' />
        </div>
      ))}
    </div>
  )
}

function HistorySkeleton() {
  return <TableSkeleton columnCount={8} />
}

interface DisplayFieldProps {
  label: string
  unit: string
  value: number | string | undefined
  icon?: LucideIcon
  onEdit: () => void
}

function DisplayField({ label, unit, value, icon: Icon, onEdit }: DisplayFieldProps) {
  return (
    <div className='space-y-3 group'>
      <div className='flex items-center gap-2'>
        {Icon && <Icon className='h-3.5 w-3.5 text-primary' />}
        <Label className='text-[12px] font-black text-slate-500 uppercase tracking-tight'>
          {label} <span className='text-slate-400 font-medium normal-case pl-1'>({unit})</span>
        </Label>
      </div>
      <div
        onClick={onEdit}
        className='relative h-12 w-full bg-white border border-slate-200 rounded-xl flex items-center px-4 cursor-pointer outline-none transition-all group-hover:border-primary/50 group-hover:shadow-sm'
      >
        <span className='text-base font-black text-slate-900'>{value ?? '—'}</span>
        <div className='absolute right-4 opacity-0 group-hover:opacity-100 transition-all text-primary'>
          <Pencil className='h-4 w-4' />
        </div>
      </div>
    </div>
  )
}

export default function AdminSystemConfigPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'attendance'

  const [editDialog, setEditDialog] = useState<{
    open: boolean
    type: 'attendance' | 'booking'
    field?: string
    fieldLabel?: string
  }>({
    open: false,
    type: 'attendance'
  })

  const { data: attendanceConfig, isLoading: isLoadingAttendance } = useAttendanceConfigQuery({
    enabled: activeTab === 'attendance'
  })
  const { data: bookingConfig, isLoading: isLoadingBooking } = useBookingConfigQuery({
    enabled: activeTab === 'booking'
  })
  const { data: history, isLoading: isLoadingHistory } = useAllConfigHistoryQuery({
    enabled: activeTab === 'history'
  })

  const setActiveTab = (tab: string) => {
    setSearchParams({ tab }, { replace: true })
  }

  const handleOpenEdit = (type: 'attendance' | 'booking', field?: string, fieldLabel?: string) => {
    setEditDialog({ open: true, type, field, fieldLabel })
  }

  const getCategoryBadge = (category: string | null) => {
    switch (category?.toLowerCase()) {
      case 'attendance':
        return (
          <Badge className='bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200 rounded-lg font-bold uppercase text-[11px]'>
            Điểm danh
          </Badge>
        )
      case 'booking':
        return (
          <Badge className='bg-green-100 text-green-700 hover:bg-green-100 border-green-200 rounded-lg font-bold uppercase text-[11px]'>
            Đặt phòng
          </Badge>
        )
      default:
        return (
          <Badge className='bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200 rounded-lg font-bold uppercase text-[11px]'>
            Khác
          </Badge>
        )
    }
  }

  return (
    <div className='space-y-6 pb-10'>
      <div className='flex flex-col md:flex-row md:items-end justify-between gap-6'>
        <div className='flex flex-col gap-2'>
          <h1 className='text-3xl font-black tracking-tight text-primary uppercase'>Cấu hình hệ thống</h1>
          <p className='text-gray-500 font-medium'>Quản lý các thiết lập vận hành của hệ thống Lab-Room.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-6'>
        <div className='flex'>
          <div className='bg-white p-1 rounded-lg border border-gray-200 shadow-sm'>
            <TabsList className='bg-transparent p-0 h-auto gap-1'>
              <TabsTrigger
                value='attendance'
                className='h-10 px-6 rounded-md font-bold transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-500 hover:text-gray-700'
              >
                Điểm danh
              </TabsTrigger>
              <TabsTrigger
                value='booking'
                className='h-10 px-6 rounded-md font-bold transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-500 hover:text-gray-700'
              >
                Đặt phòng
              </TabsTrigger>
              <TabsTrigger
                value='history'
                className='h-10 px-6 rounded-md font-bold transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-500 hover:text-gray-700'
              >
                Lịch sử
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Attendance Config Tab */}
        <TabsContent value='attendance' className='space-y-6'>
          <div className='bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden'>
            <div className='px-10 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6'>
              <div className='space-y-1'>
                <h3 className='text-xl font-black text-primary uppercase tracking-tight'>Cấu hình điểm danh</h3>
                <p className='text-sm text-slate-400 font-medium'>
                  Điều chỉnh thời gian và phạm vi check-in của sinh viên.
                </p>
              </div>
              <Button
                variant='default'
                size='sm'
                onClick={() => handleOpenEdit('attendance')}
                className='h-11 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-wider gap-2 text-[12px] shadow-md shadow-primary/20 transition-all'
              >
                <Pencil className='h-4 w-4' /> Chỉnh sửa nhanh
              </Button>
            </div>

            {isLoadingAttendance ? (
              <div className='p-10 pt-0'>
                <ConfigSkeleton />
              </div>
            ) : (
              <div className='px-10 pb-12 overflow-hidden'>
                <div className='grid gap-x-12 gap-y-10 md:grid-cols-3'>
                  <DisplayField
                    label='Thời gian cho phép check-in sớm'
                    unit='phút'
                    icon={Clock}
                    value={attendanceConfig?.earlyCheckinMinutes}
                    onEdit={() =>
                      handleOpenEdit('attendance', 'earlyCheckinMinutes', 'Thời gian cho phép check-in sớm')
                    }
                  />
                  <DisplayField
                    label='Thời gian tối đa cho phép check-in muộn'
                    unit='phút'
                    icon={Clock}
                    value={attendanceConfig?.lateCheckinMinutes}
                    onEdit={() =>
                      handleOpenEdit('attendance', 'lateCheckinMinutes', 'Thời gian tối đa cho phép check-in muộn')
                    }
                  />
                  <DisplayField
                    label='Thời gian tối thiểu để checkout sớm'
                    unit='phút'
                    icon={Clock}
                    value={attendanceConfig?.earlyCheckoutMinutes}
                    onEdit={() =>
                      handleOpenEdit('attendance', 'earlyCheckoutMinutes', 'Thời gian tối thiểu để checkout sớm')
                    }
                  />
                  <DisplayField
                    label='Thời gian tối đa để checkout muộn'
                    unit='phút'
                    icon={Clock}
                    value={attendanceConfig?.lateCheckoutMinutes}
                    onEdit={() =>
                      handleOpenEdit('attendance', 'lateCheckoutMinutes', 'Thời gian tối đa để checkout muộn')
                    }
                  />
                  <DisplayField
                    label='Bán kính check-in cho phép'
                    unit='mét'
                    icon={Globe}
                    value={attendanceConfig?.labRadiusMeters}
                    onEdit={() => handleOpenEdit('attendance', 'labRadiusMeters', 'Bán kính check-in cho phép')}
                  />
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Booking Config Tab */}
        <TabsContent value='booking' className='space-y-6'>
          <div className='bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden'>
            <div className='px-10 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6'>
              <div className='space-y-1'>
                <h3 className='text-xl font-black text-primary uppercase tracking-tight'>Cấu hình đặt phòng</h3>
                <p className='text-sm text-slate-400 font-medium'>
                  Quy định thời hạn đặt phòng lab trước cho từng đối tượng.
                </p>
              </div>
              <Button
                variant='default'
                size='sm'
                onClick={() => handleOpenEdit('booking')}
                className='h-11 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-wider gap-2 text-[12px] shadow-md shadow-primary/20 transition-all'
              >
                <Pencil className='h-4 w-4' /> Chỉnh sửa nhanh
              </Button>
            </div>

            {isLoadingBooking ? (
              <div className='p-10 pt-0'>
                <ConfigSkeleton />
              </div>
            ) : (
              <div className='px-10 pb-12 overflow-hidden'>
                <div className='grid gap-x-12 gap-y-10 md:grid-cols-3'>
                  <DisplayField
                    label='Số ngày được đặt trước (Sinh viên)'
                    unit='ngày'
                    icon={ShieldCheck}
                    value={bookingConfig?.studentAdvanceDays}
                    onEdit={() => handleOpenEdit('booking', 'studentAdvanceDays', 'Số ngày được đặt trước (Sinh viên)')}
                  />
                  <DisplayField
                    label='Số ngày được đặt trước (Giảng viên)'
                    unit='ngày'
                    icon={ShieldCheck}
                    value={bookingConfig?.lecturerAdvanceDays}
                    onEdit={() =>
                      handleOpenEdit('booking', 'lecturerAdvanceDays', 'Số ngày được đặt trước (Giảng viên)')
                    }
                  />
                  <DisplayField
                    label='Số ngày được đặt trước (Quản trị viên)'
                    unit='ngày'
                    icon={ShieldCheck}
                    value={bookingConfig?.adminAdvanceDays}
                    onEdit={() => handleOpenEdit('booking', 'adminAdvanceDays', 'Số ngày được đặt trước (Admin)')}
                  />
                </div>

                <div className='grid gap-x-12 gap-y-10 md:grid-cols-3 mt-10'>
                  <DisplayField
                    label='Hạn chót cho phép sinh viên hủy đơn'
                    unit='phút'
                    icon={ShieldCheck}
                    value={
                      bookingConfig?.minMinutesBeforeStartToCancel !== undefined
                        ? `Trước bắt đầu ${bookingConfig.minMinutesBeforeStartToCancel}`
                        : undefined
                    }
                    onEdit={() =>
                      handleOpenEdit('booking', 'minMinutesBeforeStartToCancel', 'Hạn chót cho phép sinh viên hủy đơn')
                    }
                  />
                  <DisplayField
                    label='Hạn chót phê duyệt đơn đặt phòng'
                    unit='phút'
                    icon={ShieldCheck}
                    value={
                      bookingConfig?.minMinutesBeforeStartToApprove !== undefined
                        ? bookingConfig.minMinutesBeforeStartToApprove >= 0
                          ? `Trước bắt đầu ${bookingConfig.minMinutesBeforeStartToApprove}`
                          : `Sau bắt đầu ${Math.abs(bookingConfig.minMinutesBeforeStartToApprove)}`
                        : undefined
                    }
                    onEdit={() =>
                      handleOpenEdit('booking', 'minMinutesBeforeStartToApprove', 'Hạn chót phê duyệt đơn đặt phòng')
                    }
                  />
                  <DisplayField
                    label='Hạn chót để sinh viên tạo đơn đặt'
                    unit='phút'
                    icon={ShieldCheck}
                    value={
                      bookingConfig?.studentMinMinutesToBook !== undefined
                        ? bookingConfig.studentMinMinutesToBook >= 0
                          ? `Trước bắt đầu ${bookingConfig.studentMinMinutesToBook}`
                          : `Sau bắt đầu ${Math.abs(bookingConfig.studentMinMinutesToBook)}`
                        : undefined
                    }
                    onEdit={() =>
                      handleOpenEdit('booking', 'studentMinMinutesToBook', 'Hạn chót để sinh viên tạo đơn đặt')
                    }
                  />
                  <DisplayField
                    label='Hạn chót để giảng viên tạo đơn đặt'
                    unit='phút'
                    icon={ShieldCheck}
                    value={
                      bookingConfig?.lecturerMinMinutesToBook !== undefined
                        ? bookingConfig.lecturerMinMinutesToBook >= 0
                          ? `Trước bắt đầu ${bookingConfig.lecturerMinMinutesToBook}`
                          : `Sau bắt đầu ${Math.abs(bookingConfig.lecturerMinMinutesToBook)}`
                        : undefined
                    }
                    onEdit={() =>
                      handleOpenEdit('booking', 'lecturerMinMinutesToBook', 'Hạn chót để giảng viên tạo đơn đặt')
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value='history' className='space-y-4'>
          <div className='bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm'>
            <Table>
              <TableHeader>
                <TableRow className='bg-gray-50/50 hover:bg-gray-50/50 border-b border-gray-100'>
                  <TableHead className='font-bold text-gray-700 py-4 px-6 text-[13px] uppercase tracking-wider w-20'>
                    STT
                  </TableHead>
                  <TableHead className='font-bold text-gray-700 py-4 px-6 text-[13px] uppercase tracking-wider'>
                    Loại
                  </TableHead>
                  <TableHead className='font-bold text-gray-700 py-4 px-6 text-[13px] uppercase tracking-wider'>
                    Tên cấu hình
                  </TableHead>
                  <TableHead className='font-bold text-gray-700 py-4 px-6 text-[13px] uppercase tracking-wider'>
                    Giá trị cũ
                  </TableHead>
                  <TableHead className='font-bold text-gray-700 py-4 px-6 text-[13px] uppercase tracking-wider'>
                    Giá trị mới
                  </TableHead>
                  <TableHead className='font-bold text-gray-700 py-4 px-6 text-[13px] uppercase tracking-wider'>
                    Người thay đổi
                  </TableHead>
                  <TableHead className='font-bold text-gray-700 py-4 px-6 text-[13px] uppercase tracking-wider'>
                    Thời gian
                  </TableHead>
                  <TableHead className='font-bold text-gray-700 py-4 px-6 text-[13px] uppercase tracking-wider'>
                    Lý do
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingHistory ? (
                  <HistorySkeleton />
                ) : history && history.length > 0 ? (
                  history.map((item, index) => (
                    <TableRow
                      key={item.systemConfigHistoryId}
                      className='border-b border-gray-100 hover:bg-blue-50/30 transition-colors h-16'
                    >
                      <TableCell className='px-6 font-medium text-gray-600'>{index + 1}</TableCell>
                      <TableCell className='px-6'>{getCategoryBadge(item.category)}</TableCell>
                      <TableCell className='px-6 font-bold text-slate-900'>
                        {item.configName || item.configKey}
                      </TableCell>
                      <TableCell className='px-6'>
                        <span className='inline-flex items-center gap-1.5 font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg border border-red-100'>
                          {item.oldValue || '—'}
                          {item.oldValue && (
                            <span className='text-[10px] text-red-400 uppercase font-medium'>
                              {getConfigUnit(item.configKey)}
                            </span>
                          )}
                        </span>
                      </TableCell>
                      <TableCell className='px-6'>
                        <span className='inline-flex items-center gap-1.5 font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-lg border border-green-100'>
                          {item.newValue || '—'}
                          {item.newValue && (
                            <span className='text-[10px] text-green-400 uppercase font-medium'>
                              {getConfigUnit(item.configKey)}
                            </span>
                          )}
                        </span>
                      </TableCell>
                      <TableCell className='px-6'>
                        <div className='flex items-center gap-2'>
                          <span className='font-bold text-slate-700 text-sm'>{item.changedBy || '—'}</span>
                        </div>
                      </TableCell>
                      <TableCell className='px-6 text-slate-500 text-sm font-medium'>
                        {item.changedAt ? formatDateTime(item.changedAt) : '—'}
                      </TableCell>
                      <TableCell className='px-6'>
                        <p
                          className='text-slate-500 max-w-[200px] truncate italic font-medium text-sm'
                          title={item.reason || ''}
                        >
                          {item.reason || '—'}
                        </p>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className='h-48 text-center'>
                      <div className='flex flex-col items-center justify-center gap-3'>
                        <div className='p-4 bg-gray-50 rounded-full'>
                          <HistoryIcon className='h-8 w-8 text-gray-200' />
                        </div>
                        <p className='text-muted-foreground font-bold uppercase tracking-widest text-xs'>
                          Chưa có lịch sử thay đổi
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <DialogUpdateSystemConfig
        open={editDialog.open}
        onOpenChange={(open) => setEditDialog((prev) => ({ ...prev, open }))}
        type={editDialog.type}
        initialData={editDialog.type === 'attendance' ? attendanceConfig : bookingConfig}
        field={editDialog.field}
        fieldLabel={editDialog.fieldLabel}
      />
    </div>
  )
}
