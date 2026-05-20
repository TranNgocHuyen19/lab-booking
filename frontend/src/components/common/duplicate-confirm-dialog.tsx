import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertCircle, Loader2, UserX } from 'lucide-react'

export interface DuplicateConflictDetail {
  title: string
  room?: string
  date?: string
  slot?: string
  bookingTypeLabel?: string
  devicesText?: string
  devicesList?: string[]
  subtitle?: string
  time?: string
  status?: string
  instruction?: string
}

interface DuplicateConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm?: () => void
  conflictingUsers?: string[]
  conflictDetails?: DuplicateConflictDetail[]
  title?: string
  description?: string
  note?: string
  confirmLabel?: string
  cancelLabel?: string
  showCancel?: boolean
  closeOnConfirm?: boolean
  confirmLoading?: boolean
}

export const DuplicateConfirmDialog = ({
  open,
  onOpenChange,
  onConfirm,
  conflictingUsers = [],
  conflictDetails = [],
  title = 'Phát hiện trùng lịch học!',
  description = 'Các thành viên sau đã có lịch đặt phòng khác trong thời gian này:',
  note = 'Chú ý: Việc tiếp tục sẽ tạo lịch đặt trùng cho các thành viên trên. Bạn có chắc chắn muốn xác nhận?',
  confirmLabel = 'Tiếp tục đăng ký',
  cancelLabel = 'Hủy bỏ',
  showCancel = true,
  closeOnConfirm = true,
  confirmLoading = false
}: DuplicateConfirmDialogProps) => {
  const hasConflictDetails = conflictDetails.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='w-[95vw] max-w-3xl bg-white border-2 border-amber-100 shadow-2xl p-0 overflow-hidden rounded-2xl'>
        <div className='p-7'>
          <DialogHeader>
            <div className='mx-auto bg-amber-50 w-20 h-20 rounded-full flex items-center justify-center mb-4 border border-amber-100'>
              <AlertCircle className='h-11 w-11 text-amber-500' />
            </div>
            <DialogTitle className='text-[32px] font-extrabold text-center text-gray-800 leading-tight'>
              {title}
            </DialogTitle>
            <DialogDescription className='text-center pt-2'>
              <span className='block text-lg text-gray-600 mb-5'>{description}</span>
              <div className='bg-slate-50 rounded-xl p-5 border border-slate-200 max-h-[360px] overflow-y-auto custom-scrollbar'>
                {hasConflictDetails ? (
                  <ul className='space-y-4 text-left'>
                    {conflictDetails.map((item, index) => (
                      <li key={index} className='rounded-xl border border-amber-100 bg-white p-4 shadow-sm'>
                        <div className='flex items-start gap-3'>
                          <UserX className='h-5 w-5 shrink-0 text-amber-600 mt-0.5' />
                          <div className='min-w-0 space-y-1.5'>
                            <div className='text-lg font-bold text-gray-900'>{item.title}</div>
                            {item.room ||
                            item.date ||
                            item.slot ||
                            item.bookingTypeLabel ||
                            item.devicesText ||
                            item.devicesList ? (
                              <div className='space-y-1 text-sm text-gray-600'>
                                {item.room && (
                                  <div>
                                    <span className='font-semibold text-gray-700'>Phòng:</span> {item.room}
                                  </div>
                                )}
                                {item.date && (
                                  <div>
                                    <span className='font-semibold text-gray-700'>Ngày sử dụng:</span> {item.date}
                                  </div>
                                )}
                                {item.slot && (
                                  <div>
                                    <span className='font-semibold text-gray-700'>Ca sử dụng:</span> {item.slot}
                                  </div>
                                )}
                                {item.bookingTypeLabel && (
                                  <div>
                                    <span className='font-semibold text-gray-700'>Loại lịch:</span>{' '}
                                    {item.bookingTypeLabel}
                                  </div>
                                )}
                                {Array.isArray(item.devicesList) && item.devicesList.length > 0 ? (
                                  <div>
                                    <div className='font-semibold text-gray-700'>Thiết bị đã đặt trong lịch cũ:</div>
                                    <ul className='list-disc pl-5 mt-1 space-y-1'>
                                      {item.devicesList.map((device, deviceIndex) => (
                                        <li key={deviceIndex}>{device}</li>
                                      ))}
                                    </ul>
                                  </div>
                                ) : typeof item.devicesText === 'string' ? (
                                  <div>
                                    <span className='font-semibold text-gray-700'>Thiết bị đã đặt trong lịch cũ:</span>{' '}
                                    {item.devicesText}
                                  </div>
                                ) : null}
                              </div>
                            ) : (
                              <>
                                {item.subtitle && <div className='text-sm text-gray-600'>{item.subtitle}</div>}
                                {item.time && (
                                  <div className='text-sm font-semibold text-amber-700'>
                                    Thời gian trùng: {item.time}
                                  </div>
                                )}
                              </>
                            )}
                            {item.status && (
                              <div className='text-sm text-gray-600'>
                                Trạng thái tạm thời: <span className='font-semibold'>{item.status}</span>
                              </div>
                            )}
                            {item.instruction && <div className='text-sm text-gray-500'>{item.instruction}</div>}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className='space-y-2'>
                    {conflictingUsers.map((user, index) => (
                      <li key={index} className='flex items-center gap-2 text-sm text-amber-700 font-semibold'>
                        <UserX className='h-4 w-4 shrink-0 text-amber-600' />
                        <span>{user}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <span className='block mt-5 text-gray-500 text-sm leading-relaxed italic'>{note}</span>
            </DialogDescription>
          </DialogHeader>
        </div>

        <DialogFooter className='bg-slate-50 p-5 flex gap-3 sm:justify-center border-t border-slate-100'>
          {showCancel && (
            <Button
              variant='outline'
              disabled={confirmLoading}
              onClick={() => onOpenChange(false)}
              className='flex-1 h-12 border-gray-300 hover:bg-white hover:text-gray-900 font-bold uppercase text-sm'
            >
              {cancelLabel}
            </Button>
          )}
          <Button
            disabled={confirmLoading}
            onClick={() => {
              onConfirm?.()
              if (closeOnConfirm) {
                onOpenChange(false)
              }
            }}
            className='flex-1 h-12 bg-amber-600 hover:bg-amber-700 text-white font-bold uppercase text-sm shadow-md shadow-amber-200'
          >
            {confirmLoading ? (
              <span className='inline-flex items-center gap-2'>
                <Loader2 className='h-4 w-4 animate-spin' />
                Đang xử lý...
              </span>
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
