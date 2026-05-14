import { formatDateTime } from '@/utils/format'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { type SecureLabRoomResponse } from '@/schemas/lab-room.schema'
import { User, Calendar, Info, MapPin, Users, Smartphone } from 'lucide-react'

interface DialogLabRoomDetailProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  labRoom: SecureLabRoomResponse | null
}

export function DialogLabRoomDetail({ open, onOpenChange, labRoom }: DialogLabRoomDetailProps) {
  if (!labRoom) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px] p-0 overflow-hidden rounded-xl border-none shadow-2xl'>
        <DialogHeader className='p-8 pb-4 bg-gray-50/50'>
          <div className='flex items-center justify-between'>
            <DialogTitle className='text-2xl font-black uppercase text-primary tracking-tight'>
              Chi tiết phòng thực hành
            </DialogTitle>
            <Badge variant={labRoom.active ? 'active' : 'inactive'} className='text-sm px-3 py-1'>
              {labRoom.active ? 'Hoạt động' : 'Không hoạt động'}
            </Badge>
          </div>
          <DialogDescription className='text-sm font-medium mt-2'>
            Xem thông tin chi tiết và lịch sử cập nhật của phòng thực hành.
          </DialogDescription>
        </DialogHeader>

        <div className='p-8 pt-4 space-y-6'>
          {/* Basic Info */}
          <div className='space-y-4'>
            <div className='flex items-start gap-4'>
              <div className='h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0'>
                <Info className='h-5 w-5 text-blue-600' />
              </div>
              <div className='space-y-1'>
                <p className='text-sm text-gray-500 font-medium'>Tên phòng</p>
                <p className='text-lg font-bold text-gray-900'>{labRoom.roomName}</p>
              </div>
            </div>

            <div className='flex items-start gap-4'>
              <div className='h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0'>
                <MapPin className='h-5 w-5 text-orange-600' />
              </div>
              <div className='space-y-1'>
                <p className='text-sm text-gray-500 font-medium'>Tòa nhà</p>
                <div className='font-semibold text-gray-900'>{labRoom.building || '—'}</div>
              </div>
            </div>

            <div className='flex items-start gap-4'>
              <div className='h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0'>
                <Users className='h-5 w-5 text-green-600' />
              </div>
              <div className='space-y-1'>
                <p className='text-sm text-gray-500 font-medium'>Sức chứa</p>
                <div className='font-semibold text-gray-900'>{labRoom.capacity} người</div>
              </div>
            </div>
          </div>

          <div className='h-px bg-gray-100' />

          {/* Devices Info */}
          {labRoom.devices && labRoom.devices.length > 0 && (
            <>
              <div className='space-y-3'>
                <div className='flex items-center gap-2 text-gray-900 font-semibold'>
                  <Smartphone className='h-4 w-4 text-gray-500' />
                  <span>Danh sách thiết bị</span>
                </div>
                <div className='pl-6 grid grid-cols-2 gap-2'>
                  {labRoom.devices.map((device, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100'
                    >
                      <span className='text-sm font-medium text-gray-700'>{device.device.deviceName}</span>
                      <Badge variant='secondary' className='text-xs'>
                        x{device.quantity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
              <div className='h-px bg-gray-100' />
            </>
          )}

          {/* Audit Info */}
          <div className='grid grid-cols-2 gap-6'>
            <div className='space-y-3'>
              <div className='flex items-center gap-2 text-gray-900 font-semibold'>
                <User className='h-4 w-4 text-gray-500' />
                <span>Tạo bởi</span>
              </div>
              <div className='pl-6 space-y-1'>
                <p className='text-sm font-medium text-gray-900'>{labRoom.createdBy || '—'}</p>
                <div className='flex items-center gap-1.5 text-xs text-gray-500'>
                  <Calendar className='h-3 w-3' />
                  <span>{formatDateTime(labRoom.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className='space-y-3'>
              <div className='flex items-center gap-2 text-gray-900 font-semibold'>
                <User className='h-4 w-4 text-gray-500' />
                <span>Sửa lần cuối bởi</span>
              </div>
              <div className='pl-6 space-y-1'>
                <p className='text-sm font-medium text-gray-900'>{labRoom.modifiedBy || '—'}</p>
                <div className='flex items-center gap-1.5 text-xs text-gray-500'>
                  <Calendar className='h-3 w-3' />
                  <span>{formatDateTime(labRoom.modifiedAt)}</span>
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
