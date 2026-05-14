import { formatDateTime } from '@/utils/format'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { type SecureSlotResponse } from '@/schemas/slot.schema'
import { Clock, User, Calendar, FileText, Info } from 'lucide-react'

interface DialogSlotDetailProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  slot: SecureSlotResponse | null
}

export function DialogSlotDetail({ open, onOpenChange, slot }: DialogSlotDetailProps) {
  if (!slot) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[550px] p-0 overflow-hidden rounded-xl border-none shadow-2xl'>
        <DialogHeader className='p-8 pb-4 bg-gray-50/50'>
          <div className='flex items-center justify-between'>
            <DialogTitle className='text-2xl font-black uppercase text-primary tracking-tight'>
              Chi tiết ca sử dụng
            </DialogTitle>
            <Badge variant={slot.active ? 'active' : 'inactive'} className='text-sm px-3 py-1'>
              {slot.active ? 'Hoạt động' : 'Không hoạt động'}
            </Badge>
          </div>
          <DialogDescription className='text-sm font-medium mt-2'>
            Xem thông tin chi tiết và lịch sử cập nhật của ca sử dụng.
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
                <p className='text-sm text-gray-500 font-medium'>Tên ca</p>
                <p className='text-lg font-bold text-gray-900'>{slot.slotName}</p>
              </div>
            </div>

            <div className='flex items-start gap-4'>
              <div className='h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0'>
                <Clock className='h-5 w-5 text-orange-600' />
              </div>
              <div className='space-y-1'>
                <p className='text-sm text-gray-500 font-medium'>Thời gian</p>
                <div className='flex items-center gap-2 font-semibold text-gray-900'>
                  <span>{slot.startTime}</span>
                  <span className='text-gray-400'>—</span>
                  <span>{slot.endTime}</span>
                </div>
              </div>
            </div>

            {slot.description && (
              <div className='flex items-start gap-4'>
                <div className='h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0'>
                  <FileText className='h-5 w-5 text-gray-600' />
                </div>
                <div className='space-y-1'>
                  <p className='text-sm text-gray-500 font-medium'>Mô tả</p>
                  <p className='text-gray-900 leading-relaxed'>{slot.description}</p>
                </div>
              </div>
            )}
          </div>

          <div className='h-px bg-gray-100' />

          {/* Audit Info */}
          <div className='grid grid-cols-2 gap-6'>
            <div className='space-y-3'>
              <div className='flex items-center gap-2 text-gray-900 font-semibold'>
                <User className='h-4 w-4 text-gray-500' />
                <span>Tạo bởi</span>
              </div>
              <div className='pl-6 space-y-1'>
                <p className='text-sm font-medium text-gray-900'>{slot.createdBy || '—'}</p>
                <div className='flex items-center gap-1.5 text-xs text-gray-500'>
                  <Calendar className='h-3 w-3' />
                  <span>{formatDateTime(slot.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className='space-y-3'>
              <div className='flex items-center gap-2 text-gray-900 font-semibold'>
                <User className='h-4 w-4 text-gray-500' />
                <span>Sửa lần cuối bởi</span>
              </div>
              <div className='pl-6 space-y-1'>
                <p className='text-sm font-medium text-gray-900'>{slot.modifiedBy || '—'}</p>
                <div className='flex items-center gap-1.5 text-xs text-gray-500'>
                  <Calendar className='h-3 w-3' />
                  <span>{formatDateTime(slot.modifiedAt)}</span>
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
