import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { Label } from '@/components/ui/label'

interface DialogRejectProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (reason: string) => void
  title: string
  description?: string
  reasons: readonly string[]
  isLoading?: boolean
  confirmLabel?: string
  confirmVariant?: 'reject' | 'approve' | 'secondary' | 'warning' | 'default' | 'destructive' | 'ghost' | 'link'
}

export const DialogReject = ({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  reasons,
  isLoading,
  confirmLabel = 'Từ chối',
  confirmVariant = 'reject'
}: DialogRejectProps) => {
  const [selectedReason, setSelectedReason] = useState<string>('')
  const [otherReason, setOtherReason] = useState<string>('')

  const handleConfirm = () => {
    let finalReason = otherReason.trim()
    if (!finalReason && selectedReason && selectedReason !== 'Khác') {
      finalReason = selectedReason
    }
    onConfirm(finalReason || 'Từ chối bởi quản lý')
    setSelectedReason('')
    setOtherReason('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px] p-0 overflow-hidden rounded-xl border-none shadow-2xl'>
        <DialogHeader className='p-8 pb-4 bg-gray-50/50 relative'>
          <DialogTitle className='text-2xl font-black uppercase text-primary tracking-tight'>{title}</DialogTitle>
          <DialogDescription className='text-sm font-medium'>
            {description || 'Vui lòng cung cấp lý do để sinh viên được biết rõ thông tin.'}
          </DialogDescription>
        </DialogHeader>

        <div className='p-8 pt-4 space-y-6'>
          <div className='space-y-2'>
            <Label className='text-md font-semibold text-gray-700 ml-1'>Lý do từ chối mẫu</Label>
            <Select value={selectedReason} onValueChange={setSelectedReason}>
              <SelectTrigger className='h-12 rounded-xl border-gray-100 bg-gray-50 font-bold text-gray-700 ring-offset-0 focus:ring-1 focus:ring-primary/20 transition-all'>
                <SelectValue placeholder='Chọn lý do (tùy chọn)...' />
              </SelectTrigger>
              <SelectContent className='rounded-xl border-gray-100 shadow-2xl p-1'>
                {reasons.map((reason) => (
                  <SelectItem
                    key={reason}
                    value={reason}
                    className='rounded-xl py-3.5 font-bold text-gray-700 focus:bg-primary/5 focus:text-primary'
                  >
                    {reason}
                  </SelectItem>
                ))}
                <SelectItem
                  value='Khác'
                  className='rounded-xl py-3.5 font-bold text-gray-700 focus:bg-primary/5 focus:text-primary'
                >
                  Lý do khác / Tùy chỉnh
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label className='text-md font-semibold text-gray-700 ml-1'>Chi tiết / Lý do bổ sung</Label>
            <Textarea
              placeholder='Nhập chi tiết lý do từ chối tại đây...'
              value={otherReason}
              onChange={(e) => setOtherReason(e.target.value)}
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
              variant={confirmVariant}
              onClick={handleConfirm}
              disabled={isLoading}
              className='h-12 px-10 rounded-xl text-md'
            >
              {isLoading ? <Loader2 className='h-5 w-5 animate-spin' /> : confirmLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
