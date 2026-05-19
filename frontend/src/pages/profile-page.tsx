import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { UserAvatar } from '@/components/common/user-avatar'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useUpdateProfileMutation } from '@/queries/user.queries'
import { useLogoutMutation } from '@/queries/auth.queries'
import { updateUserRequestSchema, type UpdateUserRequest } from '@/schemas/user.schema'
import { handleErrorApi } from '@/utils/error-handler'
import { Link, useNavigate } from 'react-router'
import { Save, X, Loader2 } from 'lucide-react'
import { PATHS } from '@/constants/paths'
import {
  User,
  GraduationCap,
  Camera,
  Users,
  Lock,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  Pencil,
  Mail,
  Phone,
  Calendar,
  IdCard,
  Building2,
  MapPin,
  Eye,
  EyeOff,
  ShieldCheck,
  type LucideIcon
} from 'lucide-react'
import { Role } from '@/constants/types'
import { cn } from '@/lib/utils'
import { formatDate } from '@/utils/format'

type TabId = 'profile' | 'groups' | 'security' | 'notifications' | 'settings'

const ProfilePage = () => {
  const { user, updateUser, logoutLocal, refetchUser } = useAuth()
  const [activeTab, setActiveTab] = useState<TabId>('profile')
  const [isEditing, setIsEditing] = useState(false)

  const updateProfileMutation = useUpdateProfileMutation()
  const logoutMutation = useLogoutMutation()
  const navigate = useNavigate()

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

  useEffect(() => {
    refetchUser()
  }, [refetchUser])

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors }
  } = useForm<UpdateUserRequest>({
    resolver: zodResolver(updateUserRequestSchema),
    defaultValues: {
      dob: user?.dob || '',
      phone: user?.phone || '',
      personalEmail: user?.personalEmail || '',
      department: user?.department || '',
      faculty: user?.faculty || '',
      grade: user?.grade || ''
    }
  })

  useEffect(() => {
    if (user) {
      reset({
        dob: user.dob || '',
        phone: user.phone || '',
        personalEmail: user.personalEmail || '',
        department: user.department || '',
        faculty: user.faculty || '',
        grade: user.grade || ''
      })
    }
  }, [user, reset])

  if (!user) return null

  const isStudent = user.role === Role.STUDENT

  const onUpdateProfile = async (data: UpdateUserRequest) => {
    try {
      const response = await updateProfileMutation.mutateAsync(data)
      if (response.data) {
        updateUser(response.data)
      }
      toast.success('Cập nhật hồ sơ thành công')
      setIsEditing(false)
    } catch (error) {
      handleErrorApi({ error, setError })
    }
  }

  const menuItems: { id: TabId; label: string; icon: LucideIcon }[] = [
    { id: 'profile', label: 'Hồ sơ cá nhân', icon: User },
    { id: 'groups', label: 'Nhóm nghiên cứu', icon: Users },
    { id: 'security', label: 'Bảo mật tài khoản', icon: Lock },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
    { id: 'settings', label: 'Cài đặt hệ thống', icon: Settings }
  ]

  return (
    <div className='min-h-screen bg-[#f8fafc] pb-20'>
      <div className='bg-[#153898] h-60 w-full relative overflow-hidden'>
        <div
          className='absolute inset-0 opacity-10'
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />
        <div className='absolute top-[-10%] right-[-5%] w-96 h-96 bg-white/5 rounded-full blur-3xl' />
      </div>

      <div className='container mx-auto px-6 md:px-12 lg:px-20'>
        <div className='flex flex-col lg:flex-row gap-8 -mt-24 relative z-10'>
          <div className='w-full lg:w-80 shrink-0 space-y-6'>
            <Card className='border-none shadow-2xl rounded-xl bg-white/95 backdrop-blur-sm p-8'>
              <div className='flex flex-col items-center text-center space-y-5'>
                <div className='relative group'>
                  <UserAvatar
                    name={user.fullName || 'UI'}
                    className='h-32 w-32 ring-4 ring-white shadow-xl'
                    fallbackClassName='bg-primary text-white text-4xl font-black'
                  />
                  <button className='absolute bottom-1 right-1 p-2.5 bg-white rounded-full shadow-lg border border-gray-100 hover:scale-110 transition-transform'>
                    <Camera className='h-4 w-4 text-primary' />
                  </button>
                </div>
                <div className='space-y-1.5'>
                  <h2 className='text-2xl font-black text-slate-900 leading-tight uppercase tracking-tight'>
                    {user.fullName}
                  </h2>
                  <div className='flex items-center justify-center gap-2'>
                    <span className='px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black rounded uppercase tracking-widest'>
                      {isStudent ? 'Sinh Viên' : 'Giảng Viên'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className='border-none shadow-2xl rounded-xl bg-white/95 backdrop-blur-sm p-4'>
              <nav className='space-y-1.5'>
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      'w-full flex items-center justify-between px-4 py-3.5 rounded-lg transition-all group',
                      activeTab === item.id
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-primary font-semibold'
                    )}
                  >
                    <div className='flex items-center gap-3'>
                      <item.icon
                        className={cn(
                          'h-5 w-5',
                          activeTab === item.id ? 'text-white' : 'text-gray-400 group-hover:text-primary'
                        )}
                      />
                      <span className='text-[14px] font-bold'>{item.label}</span>
                    </div>
                    {activeTab === item.id && <ChevronRight className='h-4 w-4 text-white/50' />}
                  </button>
                ))}

                <Separator className='my-3 mx-2 opacity-50' />

                <button
                  onClick={handleLogout}
                  className='w-full flex items-center gap-3 px-4 py-3.5 text-red-500 hover:bg-red-50 rounded-lg transition-all font-bold'
                >
                  <LogOut className='h-5 w-5' />
                  <span className='text-[14px]'>Đăng xuất</span>
                </button>
              </nav>
            </Card>
          </div>

          <div className='flex-1 space-y-8 min-h-[600px]'>
            {activeTab === 'profile' && (
              <Card className='border-none shadow-2xl rounded-xl bg-white/95 backdrop-blur-sm p-10 animate-in fade-in slide-in-from-right-4 duration-300'>
                <div className='flex items-center justify-between border-b-2 border-primary/10 pb-4 mb-10'>
                  <h2 className='text-primary text-2xl font-black tracking-tight uppercase flex items-center gap-3'>
                    <User className='h-6 w-6' />
                    Thông tin tài khoản
                  </h2>
                </div>

                <form onSubmit={handleSubmit(onUpdateProfile)} className='space-y-10'>
                  <div className='space-y-6'>
                    <div className='grid gap-6 md:grid-cols-2'>
                      <div className='space-y-2'>
                        <label className='text-md font-semibold text-gray-700 block flex items-center gap-2'>
                          <User className='h-4 w-4 text-primary/60' /> Họ và tên
                        </label>
                        <Input
                          value={user.fullName ?? ''}
                          readOnly
                          className='h-12 bg-gray-50/50 cursor-default border-gray-200 focus-visible:ring-0 font-medium text-gray-500'
                        />
                      </div>
                      <div className='space-y-2'>
                        <label className='text-md font-semibold text-gray-700 block flex items-center gap-2'>
                          <IdCard className='h-4 w-4 text-primary/60' />{' '}
                          {isStudent ? 'Mã số sinh viên' : 'Mã số giảng viên'}
                        </label>
                        <Input
                          value={(isStudent ? user.studentId : user.lecturerId) ?? ''}
                          readOnly
                          className='h-12 bg-gray-50/50 cursor-default border-gray-200 focus-visible:ring-0 font-medium text-gray-500'
                        />
                      </div>
                    </div>

                    <div className='grid gap-6 md:grid-cols-2'>
                      <div className='space-y-2'>
                        <label className='text-md font-semibold text-gray-700 block flex items-center gap-2'>
                          <Mail className='h-4 w-4 text-primary/60' /> Email Nhà trường
                        </label>
                        <Input
                          value={user.iuhEmail ?? ''}
                          readOnly
                          className='h-12 bg-gray-50/50 cursor-default border-gray-200 focus-visible:ring-0 font-medium text-gray-500'
                        />
                      </div>
                      <div className='space-y-2'>
                        <label className='text-md font-semibold text-gray-700 block flex items-center gap-2'>
                          <Mail className='h-4 w-4 text-primary/60' /> Email cá nhân
                        </label>
                        <Input
                          {...register('personalEmail')}
                          readOnly={!isEditing}
                          className={cn(
                            'h-12 border-gray-200 font-medium transition-all',
                            !isEditing ? 'bg-gray-50/50 cursor-default focus-visible:ring-0 text-gray-500' : 'bg-white'
                          )}
                        />
                        {errors.personalEmail && (
                          <p className='text-xs font-bold text-red-500 mt-1'>{errors.personalEmail.message}</p>
                        )}
                      </div>
                    </div>

                    <div className='grid gap-6 md:grid-cols-2'>
                      <div className='space-y-2'>
                        <label className='text-md font-semibold text-gray-700 block flex items-center gap-2'>
                          <Phone className='h-4 w-4 text-primary/60' /> Số điện thoại
                        </label>
                        <Input
                          {...register('phone')}
                          readOnly={!isEditing}
                          className={cn(
                            'h-12 border-gray-200 font-medium transition-all',
                            !isEditing ? 'bg-gray-50/50 cursor-default focus-visible:ring-0 text-gray-500' : 'bg-white'
                          )}
                        />
                        {errors.phone && <p className='text-xs font-bold text-red-500 mt-1'>{errors.phone.message}</p>}
                      </div>
                      <div className='space-y-2'>
                        <label className='text-md font-semibold text-gray-700 block flex items-center gap-2'>
                          <Calendar className='h-4 w-4 text-primary/60' /> Ngày sinh
                        </label>
                        <Input
                          type={isEditing ? 'date' : 'text'}
                          {...(isEditing ? register('dob') : {})}
                          value={!isEditing ? formatDate(user.dob) : undefined}
                          readOnly={!isEditing}
                          className={cn(
                            'h-12 border-gray-200 font-medium transition-all',
                            !isEditing ? 'bg-gray-50/50 cursor-default focus-visible:ring-0 text-gray-500' : 'bg-white'
                          )}
                        />
                        {errors.dob && <p className='text-xs font-bold text-red-500 mt-1'>{errors.dob.message}</p>}
                      </div>
                    </div>
                  </div>

                  <div className='pt-10 border-t border-gray-100'>
                    <h3 className='text-primary text-xl font-black uppercase mb-8 flex items-center gap-3'>
                      <GraduationCap className='h-6 w-6' />
                      Thông tin đào tạo
                    </h3>
                    <div className='grid gap-6 md:grid-cols-3'>
                      <div className='space-y-2'>
                        <label className='text-md font-semibold text-gray-700 block flex items-center gap-2'>
                          <Building2 className='h-4 w-4 text-primary/60' /> Khoa
                        </label>
                        <Input
                          {...register('faculty')}
                          readOnly={!isEditing}
                          className={cn(
                            'h-12 border-gray-200 font-medium transition-all',
                            !isEditing ? 'bg-gray-50/50 cursor-default focus-visible:ring-0 text-gray-500' : 'bg-white'
                          )}
                        />
                        {errors.faculty && (
                          <p className='text-xs font-bold text-red-500 mt-1'>{errors.faculty.message}</p>
                        )}
                      </div>
                      <div className='space-y-2'>
                        <label className='text-md font-semibold text-gray-700 block flex items-center gap-2'>
                          <MapPin className='h-4 w-4 text-primary/60' /> Ngành
                        </label>
                        <Input
                          {...register('department')}
                          readOnly={!isEditing}
                          className={cn(
                            'h-12 border-gray-200 font-medium transition-all',
                            !isEditing ? 'bg-gray-50/50 cursor-default focus-visible:ring-0 text-gray-500' : 'bg-white'
                          )}
                        />
                        {errors.department && (
                          <p className='text-xs font-bold text-red-500 mt-1'>{errors.department.message}</p>
                        )}
                      </div>
                      <div className='space-y-2'>
                        <label className='text-md font-semibold text-gray-700 block flex items-center gap-2'>
                          <GraduationCap className='h-4 w-4 text-primary/60' /> Lớp
                        </label>
                        <Input
                          {...register('grade')}
                          readOnly={!isEditing}
                          className={cn(
                            'h-12 border-gray-200 font-medium transition-all',
                            !isEditing
                              ? 'bg-gray-50/50 cursor-default focus-visible:ring-0 text-primary font-bold'
                              : 'bg-white'
                          )}
                        />
                        {errors.grade && <p className='text-xs font-bold text-red-500 mt-1'>{errors.grade.message}</p>}
                      </div>
                    </div>
                  </div>

                  <div className='pt-6'>
                    {!isEditing ? (
                      <Button
                        type='button'
                        onClick={() => setIsEditing(true)}
                        variant='primary'
                        size='xl'
                        className='w-full'
                      >
                        <Pencil className='h-5 w-5' />
                        Cập nhật thông tin
                      </Button>
                    ) : (
                      <div className='flex gap-4'>
                        <Button
                          type='button'
                          onClick={() => {
                            reset()
                            setIsEditing(false)
                          }}
                          variant='cancel'
                          size='xl'
                          className='flex-1'
                        >
                          <X className='h-5 w-5' />
                          Hủy bỏ
                        </Button>
                        <Button
                          type='submit'
                          disabled={updateProfileMutation.isPending}
                          variant='primary'
                          size='xl'
                          className='flex-[2] bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30'
                        >
                          {updateProfileMutation.isPending ? (
                            <Loader2 className='h-5 w-5 animate-spin' />
                          ) : (
                            <Save className='h-5 w-5' />
                          )}
                          Lưu thay đổi
                        </Button>
                      </div>
                    )}
                  </div>
                </form>
              </Card>
            )}

            {activeTab === 'groups' && (
              <Card className='border-none shadow-2xl rounded-xl bg-white/95 backdrop-blur-sm p-10 animate-in fade-in slide-in-from-right-4 duration-300'>
                <div className='border-b-2 border-primary/10 pb-4 mb-8 flex items-center justify-between'>
                  <h2 className='text-primary text-2xl font-black tracking-tight uppercase flex items-center gap-3'>
                    <Users className='h-6 w-6' />
                    Nhóm nghiên cứu tham gia
                  </h2>
                  <span className='px-3 py-1 bg-primary/10 text-primary text-xs font-black rounded-full'>
                    {user.joinedGroups?.length || 0} Nhóm
                  </span>
                </div>

                {user.joinedGroups && user.joinedGroups.length > 0 ? (
                  <div className='grid gap-4 md:grid-cols-2'>
                    {user.joinedGroups.map((group, idx) => (
                      <Link
                        key={idx}
                        to={(isStudent ? PATHS.STUDENT.GROUP_DETAIL : PATHS.LECTURER.RESEARCH_GROUP_DETAIL).replace(
                          ':id',
                          group.researchGroupId.toString()
                        )}
                        className='flex items-center justify-between p-5 rounded-xl border border-gray-100 bg-gray-50/30 hover:bg-white hover:border-primary/20 hover:shadow-md transition-all group'
                      >
                        <div className='flex items-center gap-4'>
                          <UserAvatar
                            name={group.leaderName ?? ''}
                            className='h-10 w-10 border border-gray-100 shadow-sm'
                            fallbackClassName='bg-primary/10 text-primary text-xs font-black'
                          />
                          <div className='min-w-0'>
                            <p className='font-bold text-gray-800 truncate leading-tight'>{group.groupName}</p>
                            <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1'>
                              {group.groupType}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className='h-5 w-5 text-gray-300 group-hover:text-primary transition-colors' />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-20 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200'>
                    <Users className='h-12 w-12 text-gray-300 mx-auto mb-4' />
                    <p className='text-gray-400 font-bold mb-4'>Bạn chưa tham gia nhóm nghiên cứu nào</p>
                    <Button variant='primary' className='px-6 py-2 h-auto text-xs'>
                      Tìm nhóm tham gia ngay
                    </Button>
                  </div>
                )}
              </Card>
            )}

            {activeTab === 'security' && (
              <Card className='border-none shadow-2xl rounded-xl bg-white/95 backdrop-blur-sm p-10 animate-in fade-in slide-in-from-right-4 duration-300'>
                <div className='flex items-center justify-between border-b-2 border-primary/10 pb-4 mb-10'>
                  <h2 className='text-primary text-2xl font-black tracking-tight uppercase flex items-center gap-3'>
                    <Lock className='h-6 w-6' />
                    Đổi mật khẩu
                  </h2>
                  <div className='flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-black'>
                    <ShieldCheck className='h-3.5 w-3.5' />
                    Bảo mật cao
                  </div>
                </div>

                <div className='max-w-2xl mx-auto space-y-10'>
                  <div className='space-y-6 pt-4'>
                    <div className='space-y-3'>
                      <label className='text-md font-bold text-slate-700 flex items-center gap-2 ml-1'>
                        <Lock className='h-4 w-4 text-primary' /> Mật khẩu hiện tại
                      </label>
                      <div className='relative group'>
                        <Input
                          type='password'
                          placeholder='Nhập mật khẩu cũ của bạn'
                          className='h-12 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-primary/20 transition-all rounded-xl pr-12 font-medium'
                        />
                        <button className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors p-1'>
                          <Eye className='h-5 w-5' />
                        </button>
                      </div>
                    </div>

                    <div className='flex items-center gap-4 py-2'>
                      <Separator className='flex-1 opacity-50' />
                      <span className='text-[10px] font-black text-gray-300 uppercase tracking-widest'>
                        Thiết lập mới
                      </span>
                      <Separator className='flex-1 opacity-50' />
                    </div>

                    <div className='grid gap-8 md:grid-cols-1'>
                      <div className='space-y-3'>
                        <label className='text-md font-bold text-slate-700 flex items-center gap-2 ml-1'>
                          <Pencil className='h-4 w-4 text-primary' /> Mật khẩu mới
                        </label>
                        <div className='relative group'>
                          <Input
                            type='password'
                            placeholder='Tối thiểu 8 ký tự'
                            className='h-12 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-primary/20 transition-all rounded-xl pr-12 font-medium'
                          />
                          <button className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors p-1'>
                            <EyeOff className='h-5 w-5' />
                          </button>
                        </div>
                        <p className='text-[11px] text-gray-400 font-bold ml-1 flex items-center gap-1.5'>
                          <span className='h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse' />
                          Bao gồm chữ cái, số và ký tự đặc biệt để an toàn nhất.
                        </p>
                      </div>

                      <div className='space-y-3'>
                        <label className='text-md font-bold text-slate-700 flex items-center gap-2 ml-1'>
                          <ShieldCheck className='h-4 w-4 text-primary' /> Xác nhận mật khẩu mới
                        </label>
                        <div className='relative group'>
                          <Input
                            type='password'
                            placeholder='Nhập lại mật khẩu mới'
                            className='h-12 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-primary/20 transition-all rounded-xl pr-12 font-medium'
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='pt-8 space-y-4'>
                    <Button variant='primary' size='xl' className='w-full text-xl'>
                      <Lock className='h-6 w-6' />
                      Xác nhận thay đổi
                    </Button>
                    <div className='text-center'>
                      <button className='text-gray-400 font-bold hover:text-primary transition-all text-sm group inline-flex items-center gap-2'>
                        Quên mật khẩu hiện tại?
                        <span className='h-px w-0 bg-primary transition-all group-hover:w-full' />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {['notifications', 'settings'].includes(activeTab) && (
              <Card className='border-none shadow-2xl rounded-xl bg-white/95 backdrop-blur-sm p-20 text-center animate-in fade-in slide-in-from-right-4 duration-300'>
                <div className='max-w-xs mx-auto space-y-4'>
                  <div className='h-20 w-20 bg-primary/5 text-primary/20 rounded-full flex items-center justify-center mx-auto'>
                    {activeTab === 'notifications' && <Bell className='h-10 w-10' />}
                    {activeTab === 'settings' && <Settings className='h-10 w-10' />}
                  </div>
                  <h3 className='text-xl font-black text-slate-800 uppercase'>Chức năng đang phát triển</h3>
                  <p className='text-sm text-slate-400 font-medium'>
                    IUH đang nỗ lực hoàn thiện tính năng này để phục vụ bạn sớm nhất.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
