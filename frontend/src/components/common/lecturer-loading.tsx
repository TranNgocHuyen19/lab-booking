import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LecturerLoadingProps {
  message?: string
  className?: string
  fullHeight?: boolean
}

export const LecturerLoading = ({
  message = 'Đang tải thông tin...',
  className,
  fullHeight = true
}: LecturerLoadingProps) => {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 p-6', fullHeight && 'h-[60vh]', className)}>
      <Loader2 className='h-12 w-12 animate-spin text-primary' />
      <p className='text-gray-500 font-medium uppercase font-black text-xs tracking-widest animate-pulse'>{message}</p>
    </div>
  )
}

export default LecturerLoading
