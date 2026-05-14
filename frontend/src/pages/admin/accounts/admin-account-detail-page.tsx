import { useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import {
  User,
  Mail,
  Phone,
  Calendar,
  Loader2,
  Save,
  ChevronLeft,
  Building,
  School,
  GraduationCap,
  Key,
  Unlock,
  Lock,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useUserByIdQuery, useUpdateUserAdminMutation, useUpdateUserActiveMutation } from '@/queries/user.queries'
import { toast } from 'sonner'
import { format } from 'date-fns'
import type { UserResponse } from '@/schemas/user.schema'

interface FormData {
  username: string
  fullName: string
  dob: string
  phone: string
  iuhEmail: string
  personalEmail: string
  department: string
  faculty: string
  role: string
  lecturerId: string
  studentId: string
  grade: string
}

const AccountDetailForm = ({
  user,
  onBack,
  onStatusUpdate,
  onUpdateInfo,
  isUpdating,
  isStatusUpdating
}: {
  user: UserResponse
  onBack: () => void
  onStatusUpdate: (active: boolean) => void
  onUpdateInfo: (data: FormData) => void
  isUpdating: boolean
  isStatusUpdating: boolean
}) => {
  const [formData, setFormData] = useState<FormData>(() => ({
    username: user.username,
    fullName: user.fullName,
    dob: user.dob ? format(new Date(user.dob), 'yyyy-MM-dd') : '',
    phone: user.phone || '',
    iuhEmail: user.iuhEmail || '',
    personalEmail: user.personalEmail || '',
    department: user.department || '',
    faculty: user.faculty || '',
    role: user.role,
    lecturerId: user.lecturerId || '',
    studentId: user.studentId || '',
    grade: user.grade || ''
  }))

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdateInfo(formData)
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button variant='ghost' size='sm' className='h-10 w-10 p-0 rounded-full hover:bg-gray-100' onClick={onBack}>
            <ChevronLeft className='h-6 w-6' />
          </Button>
          <div>
            <h1 className='text-2xl font-bold text-[#153898] uppercase'>CHI TIẾT TÀI KHOẢN</h1>
            <div className='flex items-center gap-2 mt-1'>
              <span className='text-sm text-gray-500 font-mono'>{user.username}</span>
              <Badge className={user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                {user.active ? 'Đang hoạt động' : 'Đã khóa'}
              </Badge>
            </div>
          </div>
        </div>

        <div className='flex gap-2'>
          {user.active ? (
            <Button
              variant='outline'
              className='border-red-200 text-red-600 hover:bg-red-50 gap-2 font-bold'
              onClick={() => onStatusUpdate(false)}
              disabled={isStatusUpdating}
            >
              <Lock className='h-4 w-4' />
              Khóa tài khoản
            </Button>
          ) : (
            <Button
              variant='outline'
              className='border-green-200 text-green-600 hover:bg-green-50 gap-2 font-bold'
              onClick={() => onStatusUpdate(true)}
              disabled={isStatusUpdating}
            >
              <Unlock className='h-4 w-4' />
              Mở khóa tài khoản
            </Button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Left Column - Core Info */}
        <div className='lg:col-span-2 space-y-6'>
          <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6'>
            <div className='flex items-center gap-2 border-b border-gray-50 pb-4'>
              <User className='h-5 w-5 text-[#153898]' />
              <h2 className='font-bold text-gray-800'>Thông tin cá nhân</h2>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label className='font-bold text-gray-700'>Họ và tên</Label>
                <Input
                  name='fullName'
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder='Nguyễn Văn A'
                  className='rounded-xl border-gray-200'
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label className='font-bold text-gray-700'>Ngày sinh</Label>
                <div className='relative'>
                  <Calendar className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                  <Input
                    type='date'
                    name='dob'
                    value={formData.dob}
                    onChange={handleInputChange}
                    className='pl-10 rounded-xl border-gray-200'
                  />
                </div>
              </div>
              <div className='space-y-2'>
                <Label className='font-bold text-gray-700'>Email IUH</Label>
                <div className='relative'>
                  <Mail className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                  <Input
                    name='iuhEmail'
                    value={formData.iuhEmail}
                    onChange={handleInputChange}
                    placeholder='example@iuh.edu.vn'
                    className='pl-10 rounded-xl border-gray-200'
                    disabled
                  />
                </div>
              </div>
              <div className='space-y-2'>
                <Label className='font-bold text-gray-700'>Số điện thoại</Label>
                <div className='relative'>
                  <Phone className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                  <Input
                    name='phone'
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder='09xxxxxxxx'
                    className='pl-10 rounded-xl border-gray-200'
                  />
                </div>
              </div>
            </div>

            <div className='space-y-2'>
              <Label className='font-bold text-gray-700'>Email cá nhân</Label>
              <Input
                name='personalEmail'
                value={formData.personalEmail}
                onChange={handleInputChange}
                placeholder='example@gmail.com'
                className='rounded-xl border-gray-200'
              />
            </div>
          </div>

          <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6'>
            <div className='flex items-center gap-2 border-b border-gray-50 pb-4'>
              <Building className='h-5 w-5 text-[#153898]' />
              <h2 className='font-bold text-gray-800'>Học vấn & Công tác</h2>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label className='font-bold text-gray-700'>Khoa</Label>
                <div className='relative'>
                  <School className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                  <Input
                    name='faculty'
                    value={formData.faculty}
                    onChange={handleInputChange}
                    placeholder='Công nghệ Thông tin'
                    className='pl-10 rounded-xl border-gray-200'
                  />
                </div>
              </div>
              <div className='space-y-2'>
                <Label className='font-bold text-gray-700'>Ngành</Label>
                <div className='relative'>
                  <FileText className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                  <Input
                    name='department'
                    value={formData.department}
                    onChange={handleInputChange}
                    placeholder='Kỹ thuật Phần mềm'
                    className='pl-10 rounded-xl border-gray-200'
                  />
                </div>
              </div>

              {formData.role === 'STUDENT' ? (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 col-span-2'>
                  <div className='space-y-2'>
                    <Label className='font-bold text-gray-700'>Mã số Sinh viên (MSSV)</Label>
                    <Input
                      name='studentId'
                      value={formData.studentId}
                      onChange={handleInputChange}
                      placeholder='21xxxxxx'
                      className='rounded-xl border-gray-200'
                      disabled
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label className='font-bold text-gray-700'>Lớp</Label>
                    <Input
                      name='grade'
                      value={formData.grade}
                      onChange={handleInputChange}
                      placeholder='DHKTPM17A'
                      className='rounded-xl border-gray-200'
                    />
                  </div>
                </div>
              ) : formData.role === 'LECTURER' ? (
                <div className='space-y-2'>
                  <Label className='font-bold text-gray-700'>Mã số Giảng viên (lecturerId)</Label>
                  <Input
                    name='lecturerId'
                    value={formData.lecturerId}
                    onChange={handleInputChange}
                    placeholder='GV001'
                    className='rounded-xl border-gray-200'
                    disabled
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Right Column - Account Settings */}
        <div className='space-y-6'>
          <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6 flex flex-col'>
            <div className='flex items-center gap-2 border-b border-gray-50 pb-4'>
              <Key className='h-5 w-5 text-[#153898]' />
              <h2 className='font-bold text-gray-800'>Tài khoản</h2>
            </div>

            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label className='font-bold text-gray-700'>Tên đăng nhập / Mã số</Label>
                <Input
                  name='username'
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder='21xxx hoặc GVxxx'
                  className='rounded-xl border-gray-200'
                  disabled
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label className='font-bold text-gray-700'>Vai trò người dùng</Label>
                <Input
                  value={
                    formData.role === 'LECTURER'
                      ? 'Giảng viên'
                      : formData.role === 'STUDENT'
                        ? 'Sinh viên'
                        : 'Quản trị viên'
                  }
                  disabled
                  className='rounded-xl bg-gray-50'
                />
              </div>
            </div>

            <div className='mt-auto pt-6'>
              <Button
                type='submit'
                variant='primary'
                className='w-full font-bold h-12 rounded-xl gap-2 shadow-lg'
                disabled={isUpdating}
              >
                {isUpdating ? <Loader2 className='h-5 w-5 animate-spin' /> : <Save className='h-5 w-5' />}
                Lưu thay đổi
              </Button>
            </div>
          </div>

          <div className='bg-blue-50/50 rounded-2xl p-6 border border-blue-100 space-y-3'>
            <h3 className='font-bold text-[#153898] text-sm flex items-center gap-2'>
              <GraduationCap className='h-4 w-4' />
              Lưu ý quan trọng
            </h3>
            <ul className='text-xs text-blue-700/70 space-y-2 list-disc pl-4'>
              <li>Tên đăng nhập và Email IUH không thể thay đổi sau khi tạo.</li>
              <li>Mật khẩu chỉ có thể đổi thông qua trang đổi mật khẩu hoặc reset bởi admin.</li>
              <li>Việc khóa tài khoản sẽ ngăn chặn người dùng đăng nhập ngay lập tức.</li>
            </ul>
          </div>
        </div>
      </form>
    </div>
  )
}

const AdminAccountDetailPage = () => {
  const { username } = useParams<{ username: string }>()
  const navigate = useNavigate()

  const { data: user, isLoading, isError } = useUserByIdQuery(username!)

  const updateAdminMutation = useUpdateUserAdminMutation()
  const updateActiveMutation = useUpdateUserActiveMutation()

  const handleStatusUpdate = async (newActive: boolean) => {
    if (!user) return
    try {
      await updateActiveMutation.mutateAsync({ username: user.username, active: newActive })
      toast.success(newActive ? 'Đã kích hoạt tài khoản' : 'Đã khóa tài khoản')
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái')
    }
  }

  const handleUpdateInfo = async (formData: FormData) => {
    try {
      await updateAdminMutation.mutateAsync({ username: formData.username, body: formData })
      toast.success('Cập nhật thông tin thành công')
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || 'Đã có lỗi xảy ra')
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <Loader2 className='h-8 w-8 animate-spin text-[#153898]' />
      </div>
    )
  }

  if (isError || !user) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[400px] gap-4'>
        <p className='text-red-500 font-bold'>Không tìm thấy tài khoản người dùng</p>
        <Button onClick={() => navigate(-1)}>Quay lại</Button>
      </div>
    )
  }

  return (
    <AccountDetailForm
      user={user}
      onBack={() => navigate(-1)}
      onStatusUpdate={handleStatusUpdate}
      onUpdateInfo={handleUpdateInfo}
      isUpdating={updateAdminMutation.isPending}
      isStatusUpdating={updateActiveMutation.isPending}
    />
  )
}

export default AdminAccountDetailPage
