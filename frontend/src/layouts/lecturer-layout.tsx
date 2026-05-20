import { useState } from 'react'
import { Outlet, NavLink } from 'react-router'
import DropdownAvatar from '@/components/common/dropdown-avatar'
import { ChevronLeft, ChevronRight, GraduationCap } from 'lucide-react'
import { type UserResponse } from '@/schemas/user.schema'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from '@/constants/nav-items'
import { Role } from '@/constants/types'
import { NotificationPopover } from '@/components/common/notification-popover'

interface LecturerLayoutProps {
  user: UserResponse
}

const LecturerLayout = ({ user }: LecturerLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false)
  const navItems = NAV_ITEMS[Role.LECTURER]

  return (
    <div className='flex min-h-screen bg-gray-50'>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 transition-all duration-300 ease-in-out',
          collapsed ? 'w-20' : 'w-64'
        )}
      >
        <div className={cn('flex h-16 items-center border-b border-white/10 px-4', collapsed ? 'justify-center' : '')}>
          <div className='flex items-center gap-3 overflow-hidden'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-600 shadow-lg shadow-primary/30'>
              <GraduationCap className='h-5 w-5 text-white' />
            </div>
            {!collapsed && <span className='text-lg font-bold text-white whitespace-nowrap'>Giảng viên</span>}
          </div>
        </div>

        <nav className='mt-4 flex flex-col gap-1 px-3'>
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/30'
                      : 'text-white/70 hover:bg-white/10 hover:text-white',
                    collapsed && 'justify-center px-0'
                  )
                }
              >
                <Icon className={cn('h-5 w-5 shrink-0', collapsed && 'h-6 w-6')} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            )
          })}
        </nav>
      </aside>

      <div
        className='flex flex-1 flex-col transition-all duration-300'
        style={{ marginLeft: collapsed ? '5rem' : '16rem' }}
      >
        <header className='sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 backdrop-blur-md px-6'>
          <div className='flex items-center gap-4'>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className='flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-all hover:bg-gray-200'
            >
              {collapsed ? <ChevronRight className='h-5 w-5' /> : <ChevronLeft className='h-5 w-5' />}
            </button>
            <img src='/images/fit-logo.png' alt='FIT Logo' className='h-15 w-auto' />
          </div>

          <div className='flex items-center gap-4'>
            <NotificationPopover user={user} />

            <div className='flex items-center gap-3'>
              <div className='hidden text-right md:block'>
                <p className='text-sm font-semibold text-gray-900'>{user.fullName}</p>
                <p className='text-xs text-gray-500'>{user.role}</p>
              </div>
              <DropdownAvatar />
            </div>
          </div>
        </header>

        <main className='flex-1 p-6'>
          <Outlet />
        </main>

        <footer className='border-t border-gray-200 bg-white py-4 px-6'>
          <p className='text-center text-sm text-gray-500'>
            © {new Date().getFullYear()} Lab Room Booking System. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  )
}

export default LecturerLayout
