import { useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useCreateUserMutation } from '@/queries/user.queries'
import { toast } from 'sonner'
import { PATHS } from '@/constants/paths'
import { createUserRequestSchema, type CreateUserRequest } from '@/schemas/user.schema'
import { handleErrorApi } from '@/utils/error-handler'

const AdminCreateAccountPage = () => {
  const navigate = useNavigate()
  const createUserMutation = useCreateUserMutation()

  const form = useForm<CreateUserRequest>({
    resolver: zodResolver(createUserRequestSchema),
    defaultValues: {
      username: '',
      password: '',
      fullName: '',
      dob: '',
      phone: '',
      iuhEmail: '',
      personalEmail: '',
      department: '',
      faculty: '',
      role: 'LECTURER',
      lecturerId: '',
      studentId: '',
      grade: ''
    }
  })

  const onSubmit = async (data: CreateUserRequest) => {
    try {
      await createUserMutation.mutateAsync(data)
      toast.success('Tạo tài khoản thành công')
      navigate(PATHS.ADMIN.ACCOUNTS)
    } catch (error) {
      handleErrorApi({ error, setError: form.setError })
    }
  }

  return (
    <div className='space-y-6 p-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button
            variant='ghost'
            size='sm'
            className='h-10 w-10 p-0 rounded-full hover:bg-gray-100'
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className='h-6 w-6' />
          </Button>
          <div>
            <h1 className='text-2xl font-bold text-[#153898] uppercase'>THÊM TÀI KHOẢN GIẢNG VIÊN</h1>
            <p className='text-sm text-gray-500'>Cấp tài khoản mới cho Giảng viên trong hệ thống</p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Left Column - Core Info */}
          <div className='lg:col-span-2 space-y-6'>
            <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6'>
              <div className='flex items-center gap-2 border-b border-gray-50 pb-4'>
                <User className='h-5 w-5 text-[#153898]' />
                <h2 className='font-bold text-gray-800'>Thông tin cá nhân</h2>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='fullName'
                  render={({ field }) => (
                    <FormItem className='space-y-2'>
                      <FormLabel className='font-bold text-gray-700'>Họ và tên</FormLabel>
                      <FormControl>
                        <Input placeholder='Nguyễn Văn A' className='rounded-xl border-gray-200' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='dob'
                  render={({ field }) => (
                    <FormItem className='space-y-2'>
                      <FormLabel className='font-bold text-gray-700'>Ngày sinh</FormLabel>
                      <div className='relative'>
                        <Calendar className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                        <FormControl>
                          <Input type='date' className='pl-10 rounded-xl border-gray-200' {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='iuhEmail'
                  render={({ field }) => (
                    <FormItem className='space-y-2'>
                      <FormLabel className='font-bold text-gray-700'>Email IUH</FormLabel>
                      <div className='relative'>
                        <Mail className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                        <FormControl>
                          <Input
                            placeholder='example@iuh.edu.vn'
                            className='pl-10 rounded-xl border-gray-200'
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='phone'
                  render={({ field }) => (
                    <FormItem className='space-y-2'>
                      <FormLabel className='font-bold text-gray-700'>Số điện thoại</FormLabel>
                      <div className='relative'>
                        <Phone className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                        <FormControl>
                          <Input placeholder='09xxxxxxxx' className='pl-10 rounded-xl border-gray-200' {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='personalEmail'
                render={({ field }) => (
                  <FormItem className='space-y-2'>
                    <FormLabel className='font-bold text-gray-700'>Email cá nhân</FormLabel>
                    <FormControl>
                      <Input placeholder='example@gmail.com' className='rounded-xl border-gray-200' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6'>
              <div className='flex items-center gap-2 border-b border-gray-50 pb-4'>
                <Building className='h-5 w-5 text-[#153898]' />
                <h2 className='font-bold text-gray-800'>Học vấn & Công tác</h2>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='faculty'
                  render={({ field }) => (
                    <FormItem className='space-y-2'>
                      <FormLabel className='font-bold text-gray-700'>Khoa</FormLabel>
                      <div className='relative'>
                        <School className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                        <FormControl>
                          <Input
                            placeholder='Công nghệ Thông tin'
                            className='pl-10 rounded-xl border-gray-200'
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='department'
                  render={({ field }) => (
                    <FormItem className='space-y-2'>
                      <FormLabel className='font-bold text-gray-700'>Ngành</FormLabel>
                      <div className='relative'>
                        <FileText className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                        <FormControl>
                          <Input
                            placeholder='Kỹ thuật Phần mềm'
                            className='pl-10 rounded-xl border-gray-200'
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='lecturerId'
                  render={({ field }) => (
                    <FormItem className='space-y-2'>
                      <FormLabel className='font-bold text-gray-700'>Mã số Giảng viên (lecturerId)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='GV001'
                          className='rounded-xl border-gray-200'
                          {...field}
                          onChange={(e) => {
                            field.onChange(e)
                            form.setValue('username', e.target.value)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                <FormField
                  control={form.control}
                  name='username'
                  render={({ field }) => (
                    <FormItem className='space-y-2'>
                      <FormLabel className='font-bold text-gray-700'>Tên đăng nhập / Mã số</FormLabel>
                      <FormControl>
                        <Input placeholder='21xxx hoặc GVxxx' className='rounded-xl border-gray-200' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem className='space-y-2'>
                      <FormLabel className='font-bold text-gray-700'>Mật khẩu khởi tạo</FormLabel>
                      <FormControl>
                        <Input
                          type='password'
                          placeholder='Nhập mật khẩu (tối thiểu 6 ký tự)'
                          className='rounded-xl border-gray-200'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='space-y-2'>
                  <Label className='font-bold text-gray-700'>Vai trò người dùng</Label>
                  <Input value='Giảng viên' disabled className='rounded-xl bg-gray-50' />
                </div>
              </div>

              <div className='mt-auto pt-6'>
                <Button
                  type='submit'
                  variant='primary'
                  className='w-full font-bold h-12 rounded-xl gap-2 shadow-lg'
                  disabled={createUserMutation.isPending}
                >
                  {createUserMutation.isPending ? (
                    <Loader2 className='h-5 w-5 animate-spin' />
                  ) : (
                    <Save className='h-5 w-5' />
                  )}
                  Tạo tài khoản
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
                <li>Mật khẩu mặc định nên được yêu cầu đổi ngay sau lần đăng nhập đầu tiên.</li>
              </ul>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default AdminCreateAccountPage
