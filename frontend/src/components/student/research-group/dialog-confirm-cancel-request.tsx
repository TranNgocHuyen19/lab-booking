import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle } from 'lucide-react'

interface DialogConfirmCancelRequestProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isLoading?: boolean
  groupName: string
}

export const DialogConfirmCancelRequest = ({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  groupName
}: DialogConfirmCancelRequestProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='rounded-xl p-8 border-none shadow-2xl max-w-md' showCloseButton={false}>
        <DialogHeader className='flex flex-col items-center text-center'>
          <div className='w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4'>
            <AlertCircle className='h-8 w-8 text-red-500' />
          </div>
          <DialogTitle className='text-2xl font-black text-gray-900'>Huỷ yêu cầu tham gia?</DialogTitle>
          <DialogDescription className='text-gray-500 font-medium text-md leading-relaxed'>
            Bạn có chắc chắn muốn huỷ yêu cầu tham gia nhóm{' '}
            <span className='text-gray-900 font-bold'>"{groupName}"</span> không? Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className='flex gap-3 sm:justify-center mt-6'>
          <DialogClose asChild>
            <Button
              variant='outline'
              className='h-12 px-8 rounded-xl font-bold border-gray-100 hover:bg-gray-50 flex-1 sm:flex-none'
            >
              Để sau
            </Button>
          </DialogClose>
          <Button
            onClick={(e: React.MouseEvent) => {
              e.preventDefault()
              onConfirm()
            }}
            disabled={isLoading}
            className='h-12 px-8 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 border-none flex-1 sm:flex-none'
          >
            {isLoading ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin mr-2' />
                Đang xử lý...
              </>
            ) : (
              'Huỷ yêu cầu'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
