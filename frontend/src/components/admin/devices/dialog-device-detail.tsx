import { formatDateTime } from '@/utils/format'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { type SecuredDeviceResponse } from '@/schemas/device.schema'
import { User, Calendar, Info, Tag, Monitor, Box } from 'lucide-react'
import { deviceIconMap, deviceIconLabels, type DeviceIconName } from '@/utils/icon'

interface DialogDeviceDetailProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  device: SecuredDeviceResponse | null
}

export function DialogDeviceDetail({ open, onOpenChange, device }: DialogDeviceDetailProps) {
  if (!device) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[700px] p-0 overflow-hidden rounded-xl border-none shadow-2xl'>
        <DialogHeader className='p-8 pb-4 bg-gray-50/50'>
          <div className='flex items-center justify-between'>
            <DialogTitle className='text-2xl font-black uppercase text-primary tracking-tight'>
              Chi tiết thiết bị
            </DialogTitle>
            <Badge variant={device.active ? 'active' : 'inactive'} className='text-sm px-3 py-1'>
              {device.active ? 'Hoạt động' : 'Không hoạt động'}
            </Badge>
          </div>
          <DialogDescription className='text-sm font-medium mt-2'>
            Xem thông tin chi tiết và lịch sử cập nhật của thiết bị.
          </DialogDescription>
        </DialogHeader>

        <div className='p-8 pt-4 space-y-6'>
          {/* Basic Info */}
          <div className='grid grid-cols-2 gap-6'>
            <div className='flex items-start gap-4'>
              <div className='h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0'>
                <Info className='h-5 w-5 text-blue-600' />
              </div>
              <div className='space-y-1'>
                <p className='text-sm text-gray-500 font-medium'>Tên thiết bị</p>
                <p className='text-lg font-bold text-gray-900'>{device.deviceName}</p>
              </div>
            </div>

            <div className='flex items-start gap-4'>
              <div className='h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0'>
                <Tag className='h-5 w-5 text-orange-600' />
              </div>
              <div className='space-y-1'>
                <p className='text-sm text-gray-500 font-medium'>Loại thiết bị</p>
                <div className='font-semibold text-gray-900'>{device.deviceType}</div>
              </div>
            </div>

            {device.icon && (
              <div className='flex items-start gap-4'>
                <div className='h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0'>
                  {(() => {
                    const IconComponent = deviceIconMap[device.icon as DeviceIconName]
                    return IconComponent ? (
                      <IconComponent className='h-5 w-5 text-purple-600' />
                    ) : (
                      <Monitor className='h-5 w-5 text-purple-600' />
                    )
                  })()}
                </div>
                <div className='space-y-1'>
                  <p className='text-sm text-gray-500 font-medium'>Icon</p>
                  <div className='font-semibold text-gray-900'>
                    {deviceIconLabels[device.icon as DeviceIconName] || device.icon}
                  </div>
                </div>
              </div>
            )}

            <div className='flex items-start gap-4'>
              <div className='h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0'>
                <Box className='h-5 w-5 text-green-600' />
              </div>
              <div className='space-y-1'>
                <p className='text-sm text-gray-500 font-medium'>Tổng số lượng</p>
                <div className='font-semibold text-gray-900'>{device.totalQuantity ?? 0}</div>
              </div>
            </div>
          </div>

          {device.roomAllocations && device.roomAllocations.length > 0 && (
            <div className='space-y-3 pt-2'>
              <h4 className='font-semibold text-gray-900'>Phân bổ phòng thực hành</h4>
              <div className='grid grid-cols-2 gap-3'>
                {device.roomAllocations.map((alloc) => (
                  <div key={alloc.labRoomId} className='p-3 bg-gray-50 rounded-xl border border-gray-100'>
                    <p className='text-sm font-medium text-gray-900 truncate' title={alloc.labRoomName}>
                      {alloc.labRoomName}
                    </p>
                    <p className='text-xs text-gray-500 mt-1'>
                      Số lượng: <span className='font-semibold text-gray-700'>{alloc.quantity}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className='h-px bg-gray-100' />

          {/* Audit Info */}
          <div className='grid grid-cols-2 gap-6'>
            <div className='space-y-3'>
              <div className='flex items-center gap-2 text-gray-900 font-semibold'>
                <User className='h-4 w-4 text-gray-500' />
                <span>Tạo bởi</span>
              </div>
              <div className='pl-6 space-y-1'>
                <p className='text-sm font-medium text-gray-900'>{device.createdBy || '—'}</p>
                <div className='flex items-center gap-1.5 text-xs text-gray-500'>
                  <Calendar className='h-3 w-3' />
                  <span>{formatDateTime(device.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className='space-y-3'>
              <div className='flex items-center gap-2 text-gray-900 font-semibold'>
                <User className='h-4 w-4 text-gray-500' />
                <span>Sửa lần cuối bởi</span>
              </div>
              <div className='pl-6 space-y-1'>
                <p className='text-sm font-medium text-gray-900'>{device.modifiedBy || '—'}</p>
                <div className='flex items-center gap-1.5 text-xs text-gray-500'>
                  <Calendar className='h-3 w-3' />
                  <span>{formatDateTime(device.modifiedAt)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className='pt-2'>
            <Button
              variant='outline'
              onClick={() => onOpenChange(false)}
              className='w-full h-12 rounded-xl border-gray-200 hover:bg-gray-50 hover:text-gray-900'
            >
              Đóng
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
