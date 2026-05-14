import { AlertTriangle } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Role } from '@/constants/types'

const ViewOnlyBanner = () => {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user || user.role === Role.STUDENT) {
    return null
  }

  return (
    <div className='bg-amber-50 border-b border-amber-200 py-2'>
      <div className='container mx-auto px-6 md:px-12 lg:px-20 flex items-center justify-center gap-2 text-amber-800'>
        <AlertTriangle className='h-4 w-4 shrink-0' />
        <p className='text-sm text-center'>
          <strong>Chế độ xem:</strong> Bạn đang xem trang dành cho sinh viên với vai trò{' '}
          <span className='font-semibold'>{user.role}</span>. Các chức năng đặt phòng và thao tác khác không khả dụng.
        </p>
      </div>
    </div>
  )
}

export default ViewOnlyBanner
