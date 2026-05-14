import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '@/hooks/use-auth'
import { useLogoutMutation } from '@/queries/auth.queries'
import { PATHS } from '@/constants/paths'
import { User, LogOut, Home, Lock, LayoutDashboard } from 'lucide-react'
import { Role } from '@/constants/types'
import ChangePasswordModal from '@/components/common/dialog-change-password'
import { UserAvatar } from '@/components/common/user-avatar'

export default function DropdownAvatar() {
  const { user, logoutLocal } = useAuth()
  const logoutMutation = useLogoutMutation()
  const navigate = useNavigate()
  const [showChangePassword, setShowChangePassword] = useState(false)

  if (!user) return null

  const handleLogout = async () => {
    if (logoutMutation.isPending) return
    try {
      await logoutMutation.mutateAsync(undefined)
    } catch (error) {
      console.error('Logout API failed:', error)
    } finally {
      logoutLocal()
      navigate(PATHS.STUDENT.LOGIN)
    }
  }

  const homeLink = user.role === Role.STUDENT ? PATHS.STUDENT.SCHEDULE : PATHS.LECTURER.DASHBOARD
  const homeLabel = user.role === Role.STUDENT ? 'Lịch của tôi' : 'Bảng điều khiển'
  const HomeIcon = user.role === Role.STUDENT ? Home : LayoutDashboard

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' size='icon' className='rounded-full h-9 w-9 ring-1 ring-border'>
            <UserAvatar name={user.fullName || 'UI'} className='h-8 w-8' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-72 rounded-lg shadow-lg border-gray-100'>
          <DropdownMenuLabel className='font-normal px-4 py-5'>
            <div className='flex items-center gap-3'>
              <UserAvatar name={user.fullName || 'UI'} className='h-10 w-10 shadow-sm ring-1 ring-border' />
              <div className='flex flex-col space-y-1.5 min-w-0'>
                <div className='flex items-center gap-2'>
                  <h4 className='text-sm font-bold leading-none text-gray-900 truncate'>{user.fullName}</h4>
                  <span className='shrink-0 px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[9px] font-bold uppercase'>
                    {user.role === Role.STUDENT ? 'Sinh viên' : 'Giảng viên'}
                  </span>
                </div>
                <p className='text-[11px] leading-none text-muted-foreground font-medium truncate'>
                  {user.iuhEmail || (user.studentId ?? user.lecturerId)}
                </p>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className='p-1'>
            <DropdownMenuItem asChild className='cursor-pointer rounded-lg py-2 focus:bg-primary/5 hover:bg-primary/5'>
              <Link to={PATHS.PROFILE}>
                <User className='mr-2 h-4 w-4 text-muted-foreground' />
                <span className='font-medium'>Hồ sơ cá nhân</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className='cursor-pointer rounded-lg py-2 focus:bg-primary/5 hover:bg-primary/5'>
              <Link to={homeLink}>
                <HomeIcon className='mr-2 h-4 w-4 text-muted-foreground' />
                <span className='font-medium'>{homeLabel}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setShowChangePassword(true)}
              className='cursor-pointer rounded-lg py-2 focus:bg-primary/5 hover:bg-primary/5'
            >
              <Lock className='mr-2 h-4 w-4 text-muted-foreground' />
              <span className='font-medium'>Đổi mật khẩu</span>
            </DropdownMenuItem>
          </div>
          <DropdownMenuSeparator />
          <div className='p-1'>
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              variant='destructive'
              className='cursor-pointer rounded-lg py-2 focus:bg-red-50'
            >
              <LogOut className='mr-2 h-4 w-4' />
              <span className='font-bold uppercase text-[11px] tracking-wide'>
                {logoutMutation.isPending ? 'Đang xử lý...' : 'Đăng xuất'}
              </span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <ChangePasswordModal open={showChangePassword} onOpenChange={setShowChangePassword} />
    </>
  )
}
