import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { Label } from '@/components/ui/label'

interface DialogApproveProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (note: string) => void
  title: string
  description?: string
  isLoading?: boolean
}

export const DialogApprove = ({ open, onOpenChange, onConfirm, title, description, isLoading }: DialogApproveProps) => {
  const [note, setNote] = useState<string>('')

  const handleConfirm = () => {
    onConfirm(note.trim())
    setNote('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px] p-0 overflow-hidden rounded-xl border-none shadow-2xl'>
        <DialogHeader className='p-8 pb-4 bg-gray-50/50 relative'>
          <DialogTitle className='text-2xl font-black uppercase text-primary tracking-tight'>{title}</DialogTitle>
          <DialogDescription className='text-sm font-medium'>
            {description || 'Bạn có thể để lại ghi chú hoặc lời nhắn cho sinh viên (không bắt buộc).'}
          </DialogDescription>
        </DialogHeader>

        <div className='p-8 pt-4 space-y-6'>
          <div className='space-y-2'>
            <Label className='text-md font-semibold text-gray-700 ml-1'>Ghi chú phê duyệt (tùy chọn)</Label>
            <Textarea
              placeholder='Nhập lời nhắn gửi đến sinh viên tại đây...'
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className='min-h-[150px] rounded-xl border-gray-100 bg-gray-50/50 p-5 font-bold text-gray-700 focus:ring-1 focus:ring-primary/20 transition-all resize-none placeholder:text-gray-300 placeholder:font-bold'
            />
          </div>

          <div className='flex justify-end gap-3 pt-2 pb-4'>
            <Button
              type='button'
              variant='cancel'
              onClick={() => onOpenChange(false)}
              className='h-12 px-8 rounded-xl text-md'
            >
              Hủy
            </Button>
            <Button
              type='button'
              variant='approve'
              onClick={handleConfirm}
              disabled={isLoading}
              className='h-12 px-10 rounded-xl text-md'
            >
              {isLoading ? <Loader2 className='h-5 w-5 animate-spin' /> : 'Xác nhận duyệt'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
