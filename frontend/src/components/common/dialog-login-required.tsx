import { LogIn, UserPlus } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { PATHS } from '@/constants/paths'

interface LoginRequiredDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const LoginRequiredDialog = ({ open, onOpenChange }: LoginRequiredDialogProps) => {
  const navigate = useNavigate()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[400px] p-0 overflow-hidden border-none shadow-2xl rounded-xl bg-white'>
        <div className='absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-primary to-blue-400' />

        <div className='pt-10 pb-6 text-center'>
          <div className='w-16 h-16 bg-blue-50/80 rounded-xl flex items-center justify-center mx-auto mb-5 relative'>
            <div className='absolute inset-0 bg-primary/5 rounded-xl animate-pulse' />
            <div className='w-11 h-11 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20'>
              <LogIn className='h-5 w-5 text-white' />
            </div>
          </div>

          <DialogHeader className='px-8 space-y-2'>
            <DialogTitle className='text-2xl font-bold text-slate-900 tracking-tight text-center'>
              Xác thực <span className='text-primary'>tài khoản</span>
            </DialogTitle>
            <DialogDescription className='text-slate-500 font-medium text-[14px] leading-relaxed text-center'>
              Chào mừng bạn! Vui lòng thực hiện đăng nhập để trải nghiệm đầy đủ các chức năng của hệ thống.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className='px-8 pb-10 space-y-3.5'>
          <div className='grid grid-cols-1 gap-3'>
            <Button
              onClick={() => {
                onOpenChange(false)
                navigate(PATHS.STUDENT.LOGIN)
              }}
              className='w-full h-12 bg-primary hover:bg-primary/95 text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2'
            >
              <LogIn className='h-4.5 w-4.5' />
              Đăng nhập ngay
            </Button>

            <Button
              variant='outline'
              onClick={() => {
                onOpenChange(false)
                navigate(PATHS.STUDENT.REGISTER)
              }}
              className='w-full h-12 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2'
            >
              <UserPlus className='h-4.5 w-4.5' />
              Tạo tài khoản mới
            </Button>
          </div>

          <div className='pt-6 mt-4 border-t border-slate-50 flex flex-col items-center gap-3'>
            <p className='text-[11px] text-slate-400 font-bold text-center leading-relaxed px-4'>
              Hệ thống Quản lý Lab &bull; IUH
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
