import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertCircle, UserX } from 'lucide-react'

interface DuplicateConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  conflictingUsers: string[]
}

export const DuplicateConfirmDialog = ({
  open,
  onOpenChange,
  onConfirm,
  conflictingUsers
}: DuplicateConfirmDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md bg-white border-2 border-amber-100 shadow-2xl p-0 overflow-hidden rounded-xl'>
        <div className='p-6'>
          <DialogHeader>
            <div className='mx-auto bg-amber-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-amber-100'>
              <AlertCircle className='h-10 w-10 text-amber-500' />
            </div>
            <DialogTitle className='text-xl font-bold text-center text-gray-800'>Phát hiện trùng lịch học!</DialogTitle>
            <DialogDescription className='text-center pt-2'>
              <span className='block text-sm text-gray-600 mb-4'>
                Các thành viên sau đã có lịch đặt phòng khác trong thời gian này:
              </span>
              <div className='bg-slate-50 rounded-lg p-4 border border-slate-200 max-h-48 overflow-y-auto custom-scrollbar'>
                <ul className='space-y-2'>
                  {conflictingUsers.map((user, index) => (
                    <li key={index} className='flex items-center gap-2 text-sm text-amber-700 font-semibold'>
                      <UserX className='h-4 w-4 shrink-0 text-amber-600' />
                      <span>{user}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <span className='block mt-4 text-gray-500 text-[11px] leading-relaxed italic'>
                Chú ý: Việc tiếp tục sẽ tạo lịch đặt trùng cho các thành viên trên. Bạn có chắc chắn muốn xác nhận?
              </span>
            </DialogDescription>
          </DialogHeader>
        </div>

        <DialogFooter className='bg-slate-50 p-4 flex gap-3 sm:justify-center border-t border-slate-100'>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            className='flex-1 border-gray-300 hover:bg-white hover:text-gray-900 font-bold uppercase text-xs'
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
            className='flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold uppercase text-xs shadow-md shadow-amber-200'
          >
            Tiếp tục đăng ký
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
