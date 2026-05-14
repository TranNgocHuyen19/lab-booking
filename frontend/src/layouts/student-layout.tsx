import { useState } from 'react'
import { Outlet, Link, NavLink, useNavigate, useLocation, matchPath } from 'react-router'
import DropdownAvatar from '@/components/common/dropdown-avatar'
import ViewOnlyBanner from '@/components/common/view-only-banner'
import {
  Globe,
  Clock,
  Mail,
  LogIn,
  MapPin,
  Users,
  Phone,
  Menu,
  X,
  User,
  LogOut,
  Home,
  Lock,
  Calendar,
  type LucideIcon
} from 'lucide-react'
import { type UserResponse } from '@/schemas/user.schema'
import { PATHS } from '@/constants/paths'
import { useAuth } from '@/hooks/use-auth'
import { useLogoutMutation } from '@/queries/auth.queries'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Role } from '@/constants/types'
import ChangePasswordModal from '@/components/common/dialog-change-password'
import { UserAvatar } from '@/components/common/user-avatar'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  public?: boolean
  children?: { to: string; label: string; icon: LucideIcon }[]
}

interface StudentLayoutProps {
  user: UserResponse | null
}

const StudentLayout = ({ user }: StudentLayoutProps) => {
  const { logoutLocal } = useAuth()
  const logoutMutation = useLogoutMutation()
  const navigate = useNavigate()
  const [showChangePassword, setShowChangePassword] = useState(false)

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

  const navItems: NavItem[] = [
    { to: PATHS.HOME, label: 'Trang chủ', icon: Home, public: true },
    { to: PATHS.STUDENT.SCHEDULE, label: 'Đăng ký', icon: Calendar, public: true },
    { to: PATHS.STUDENT.GROUPS, label: 'Nhóm', icon: Users, public: true },
    { to: PATHS.STUDENT.CONTACT, label: 'Liên hệ', icon: Phone, public: true }
  ]

  const filteredNavItems: NavItem[] = navItems.filter((item) => item.public || user)

  const MobileMenuItem = ({
    icon: Icon,
    label,
    onClick,
    to
  }: {
    icon: LucideIcon
    label: string
    onClick?: () => void
    to?: string
  }) => {
    const location = useLocation()
    const isActive = to ? !!matchPath({ path: to, end: to === PATHS.HOME }, location.pathname) : false

    if (to) {
      return (
        <SheetClose asChild>
          <NavLink
            to={to}
            end={to === PATHS.HOME}
            className={`flex items-center justify-between w-full py-4 px-6 border-b border-gray-100 transition-colors group ${
              isActive ? 'bg-primary/5' : ''
            } hover:bg-primary`}
          >
            <div className='flex items-center gap-4'>
              {Icon && (
                <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-gray-500'} group-hover:text-secondary`} />
              )}
              <span
                className={`text-[15px] font-medium ${isActive ? 'text-primary font-bold' : 'text-gray-700'} group-hover:text-secondary`}
              >
                {label}
              </span>
            </div>
          </NavLink>
        </SheetClose>
      )
    }
    return (
      <SheetClose asChild>
        <button
          className='w-full text-left flex items-center justify-between py-4 px-6 hover:bg-primary border-b border-gray-100 transition-colors group'
          onClick={onClick}
        >
          <div className='flex items-center gap-4'>
            {Icon && <Icon className='h-5 w-5 text-gray-500 group-hover:text-secondary' />}
            <span className='text-[15px] font-medium text-gray-700 group-hover:text-secondary'>{label}</span>
          </div>
        </button>
      </SheetClose>
    )
  }

  return (
    <div className='flex min-h-screen flex-col bg-white'>
      {/* Top Utility Bar - Desktop Only */}
      <div className='hidden xl:block bg-primary text-white py-3 font-medium'>
        <div className='w-full px-6 md:px-20 lg:px-40 flex items-center justify-between'>
          <p className='text-sm'>
            Chào mừng bạn đến với Khoa Công nghệ thông tin - Trường Đại học Công nghiệp Thành phố Hồ Chí Minh
          </p>
        </div>
      </div>

      {/* Đã khôi phục ViewOnlyBanner */}
      <ViewOnlyBanner />

      <header className='bg-primary xl:!bg-white shadow-sm sticky top-0 z-50 transition-all duration-300'>
        <div className='w-full px-6 md:px-20 lg:px-40 flex items-center justify-between gap-8 h-20'>
          <Link to='/' className='flex items-center gap-4 group shrink-0'>
            <img
              src='/images/fit-logo.png'
              className='h-16 w-auto hidden xl:block transition-transform duration-500 group-hover:scale-105'
              alt='FIT Logo'
            />
            <img src='/images/logo-white.svg' className='h-16 w-auto xl:hidden' alt='IUH Logo' />
          </Link>

          <nav className='hidden xl:flex items-center h-full'>
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.to === PATHS.HOME}
                className={({ isActive }) => {
                  return `px-5 h-full flex items-center text-[15px] font-bold transition-all duration-300 uppercase tracking-wide border-b-4 whitespace-nowrap ${
                    isActive
                      ? 'text-primary border-primary bg-white'
                      : 'text-primary border-transparent hover:bg-primary hover:text-secondary'
                  }`
                }}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className='flex items-center gap-4 shrink-0'>
            <div className='hidden xl:flex items-center gap-6'>
              {user ? (
                <div className='flex items-center gap-4 animate-fade-in text-primary'>
                  <div className='text-right'>
                    <div className='text-sm font-black leading-tight hover:text-primary transition-colors cursor-pointer'>
                      {user.fullName}
                    </div>
                    <div className='text-[10px] font-bold text-primary uppercase tracking-wider'>
                      {user.role === Role.STUDENT ? 'Sinh viên' : 'Giảng viên'}
                    </div>
                  </div>
                  <DropdownAvatar />
                </div>
              ) : (
                <Link
                  to={PATHS.STUDENT.LOGIN}
                  className='inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-black text-white transition-all shadow-lg hover:bg-[#112d73] hover:scale-105 active:scale-95 gap-2'
                >
                  <LogIn className='h-4 w-4' />
                  Đăng nhập
                </Link>
              )}
            </div>

            <div className='flex items-center gap-2 xl:border-l xl:border-gray-200 xl:pl-4'>
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    size='icon'
                    className='xl:hidden h-10 w-10 rounded-md transition-colors text-white hover:cursor-pointer'
                  >
                    <Menu className='h-10 w-10' size={50} />
                  </Button>
                </SheetTrigger>

                <SheetContent
                  side='right'
                  className='w-[320px] sm:w-[350px] p-0 flex flex-col gap-0 border-none shadow-2xl [&>button]:hidden bg-white'
                >
                  <div className='bg-primary px-4 py-4 flex justify-between items-center text-white shrink-0 h-[70px]'>
                    <div className='flex items-center gap-3'>
                      <div className='flex items-center gap-3'>
                        <img src='/images/logo-white.svg' alt='IUH' className='h-15 w-auto' />
                      </div>
                    </div>
                    <SheetClose asChild>
                      <button className='h-8 w-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all'>
                        <X className='h-5 w-5 text-white' />
                      </button>
                    </SheetClose>
                  </div>

                  <div className='flex-1 overflow-y-auto'>
                    {user ? (
                      <>
                        <div className='p-6 border-b border-gray-100 flex items-center gap-4'>
                          <div className='h-12 w-12 rounded-full border border-gray-100 p-0.5 shrink-0'>
                            <UserAvatar
                              name={user.fullName || 'SV'}
                              className='h-full w-full rounded-full text-base font-bold bg-white text-primary border border-gray-100'
                            />
                          </div>
                          <div className='flex flex-col min-w-0'>
                            <span className='font-bold text-primary truncate text-[15px]'>{user.fullName}</span>
                            <div className='inline-flex mt-0.5'>
                              <span className='bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide'>
                                MSSV: {user.username}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className='py-2'>
                          <div className='px-6 pt-4 pb-2'>
                            <span className='text-[11px] font-bold text-gray-400 uppercase tracking-widest'>
                              CỔNG ĐĂNG KÝ
                            </span>
                          </div>

                          <div className='flex flex-col'>
                            {filteredNavItems.map((item) => {
                              if (item.children && item.children.length > 0) {
                                return (
                                  <Collapsible key={item.label} className='w-full'>
                                    <CollapsibleTrigger asChild>
                                      <div className='flex items-center justify-between w-full py-4 px-6 hover:bg-primary transition-colors cursor-pointer border-b border-gray-100 group'>
                                        <div className='flex items-center gap-4'>
                                          <item.icon className='h-5 w-5 text-gray-500 group-hover:text-secondary' />
                                          <span className='text-[15px] font-medium text-gray-700 group-hover:text-secondary'>
                                            {item.label}
                                          </span>
                                        </div>
                                      </div>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className='bg-gray-50'>
                                      {item.children.map((child) => (
                                        <MobileMenuItem
                                          key={child.label}
                                          to={child.to}
                                          label={child.label}
                                          icon={child.icon}
                                        />
                                      ))}
                                    </CollapsibleContent>
                                  </Collapsible>
                                )
                              }
                              return (
                                <MobileMenuItem key={item.label} to={item.to} label={item.label} icon={item.icon} />
                              )
                            })}
                          </div>

                          <div className='px-6 pt-6 pb-2'>
                            <span className='text-[11px] font-bold text-gray-400 uppercase tracking-widest'>
                              CÁ NHÂN
                            </span>
                          </div>
                          <div className='flex flex-col'>
                            <MobileMenuItem to={PATHS.PROFILE} label='Hồ sơ cá nhân' icon={User} />
                            <MobileMenuItem
                              to={user.role === Role.STUDENT ? PATHS.STUDENT.SCHEDULE : PATHS.LECTURER.DASHBOARD}
                              label={user.role === Role.STUDENT ? 'Lịch của tôi' : 'Dashboard'}
                              icon={Clock}
                            />
                            <MobileMenuItem
                              label='Đổi mật khẩu'
                              icon={Lock}
                              onClick={() => setShowChangePassword(true)}
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className='py-2'>
                        <div className='flex flex-col mt-2'>
                          {filteredNavItems.map((item) => (
                            <MobileMenuItem key={item.label} to={item.to} label={item.label} icon={item.icon} />
                          ))}
                        </div>
                        <div className='p-6 mt-4'>
                          <SheetClose asChild>
                            <Link
                              to={PATHS.STUDENT.LOGIN}
                              className='flex w-full items-center justify-center rounded bg-primary px-4 py-3 text-sm font-bold text-secondary shadow hover:bg-primary/90 transition-all uppercase'
                            >
                              ĐĂNG NHẬP
                            </Link>
                          </SheetClose>
                          <div className='text-center mt-4'>
                            <span className='text-sm text-gray-500 font-medium cursor-pointer hover:underline'>
                              Đăng ký tài khoản
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {user && (
                    <div className='p-4 border-t border-gray-100 bg-white mt-auto'>
                      <SheetClose asChild>
                        <button
                          onClick={handleLogout}
                          // Nút Logout đỏ theo thiết kế, nhưng vẫn giữ style clean
                          className='flex w-full items-center justify-center gap-2 rounded bg-[#dc2626] px-4 py-3 text-sm font-bold text-white shadow hover:bg-red-700 transition-all uppercase tracking-wide'
                        >
                          <LogOut className='h-4 w-4' />
                          ĐĂNG XUẤT
                        </button>
                      </SheetClose>
                    </div>
                  )}
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main className='flex-1'>
        <Outlet />
      </main>

      {/* FOOTER - Giữ nguyên bg-primary như cũ */}
      <footer className='border-t border-white/5'>
        <div className='bg-primary text-white pt-16 pb-12'>
          <div className='w-full px-6 md:px-20 lg:px-40'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12'>
              <div className='space-y-6'>
                <div className='bg-white p-4 w-32 h-32 rounded-lg flex items-center justify-center shadow-lg'>
                  <img src='/images/logomark.png' alt='IUH' className='w-full h-auto' />
                </div>
                <p className='text-[14px] leading-relaxed text-blue-50/80 font-medium'>
                  Đại học Công nghiệp TP.HCM là cơ sở giáo dục đại học định hướng ứng dụng hàng đầu tại Việt Nam.
                </p>
                <div className='flex items-center gap-3'>
                  {[
                    { icon: Globe, href: 'https://iuh.edu.vn' },
                    { icon: Mail, href: 'mailto:dhcn@iuh.edu.vn' },
                    { icon: Users, href: '#' }
                  ].map((social, i) => (
                    <a
                      key={i}
                      href={social.href}
                      className='h-10 w-10 rounded-full bg-white/10 hover:bg-white text-white hover:text-primary flex items-center justify-center transition-all border border-white/20'
                    >
                      <social.icon className='h-5 w-5' />
                    </a>
                  ))}
                </div>
              </div>

              {/* Column 2: Contact Info */}
              <div className='space-y-6'>
                <div className='space-y-2'>
                  <h4 className='text-lg font-black tracking-tight'>Liên hệ</h4>
                  <div className='h-1 w-10 bg-secondary rounded-full opacity-60' />
                </div>
                <ul className='space-y-5'>
                  <li className='flex gap-4 text-sm font-medium text-blue-50/90'>
                    <MapPin className='h-5 w-5 shrink-0 text-white/50' />
                    <span>12 Nguyễn Văn Bảo, Phường 4, Gò Vấp, TP.HCM</span>
                  </li>
                  <li className='flex gap-4 text-sm font-medium text-blue-50/90'>
                    <Phone className='h-5 w-5 shrink-0 text-white/50' />
                    <span>028 38440 390</span>
                  </li>
                  <li className='flex gap-4 text-sm font-medium text-blue-50/90'>
                    <Mail className='h-5 w-5 shrink-0 text-white/50' />
                    <span>dhcn@iuh.edu.vn</span>
                  </li>
                </ul>
              </div>

              {/* Column 3: Quick Links */}
              <div className='space-y-6'>
                <div className='space-y-2'>
                  <h4 className='text-lg font-black tracking-tight'>Liên kết nhanh</h4>
                  <div className='h-1 w-10 bg-secondary rounded-full opacity-60' />
                </div>
                <ul className='space-y-4 font-medium text-sm text-blue-50/70'>
                  {['Cổng thông tin sinh viên', 'Đào tạo trực tuyến (LMS)', 'Thư viện điện tử', 'Tuyển sinh 2026'].map(
                    (link) => (
                      <li key={link}>
                        <Link to='#' className='hover:text-white hover:translate-x-1 transition-all block'>
                          {link}
                        </Link>
                      </li>
                    )
                  )}
                </ul>
              </div>

              {/* Column 4: Map */}
              <div className='space-y-6'>
                <div className='space-y-2'>
                  <h4 className='text-lg font-black tracking-tight'>Bản đồ</h4>
                  <div className='h-1 w-10 bg-secondary rounded-full opacity-60' />
                </div>
                <div className='rounded-xl overflow-hidden shadow-2xl h-44 bg-white/5 group border border-white/10'>
                  <iframe
                    src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.858169091085!2d106.68427047583877!3d10.822164158346794!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3174deb3ef536f31%3A0x8b7bb8b7c956157b!2sIndustrial%20University%20of%20Ho%20Chi%20Minh%20City!5e0!3m2!1sen!2s!4v1767172356779!5m2!1sen!2s'
                    width='600'
                    height='450'
                    style={{ border: '0' }}
                    loading='lazy'
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Bottom Bar */}
        <div className='bg-primary py-5 border-t border-white/5'>
          <div className='w-full px-6 md:px-20 lg:px-40'>
            <div className='flex flex-col md:flex-row items-center justify-between gap-4'>
              <p className='text-xs font-medium text-white/40'>
                Copyright © {new Date().getFullYear()} Industrial University of Ho Chi Minh City. All rights reserved.
              </p>
              <div className='flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-white/20'>
                <span>Privacy Policy</span>
                <span>Terms of Service</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <ChangePasswordModal open={showChangePassword} onOpenChange={setShowChangePassword} />
    </div>
  )
}

export default StudentLayout
