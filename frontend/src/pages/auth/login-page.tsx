import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLocation } from 'react-router'
import { loginRequestSchema, type LoginRequest } from '@/schemas/auth.schema'
import { useStudentLoginMutation, useLecturerLoginMutation } from '@/queries/auth.queries'
import { useAuth } from '@/hooks/use-auth'
import { handleErrorApi } from '@/utils/error-handler'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { PATHS } from '@/constants/paths'
import type { UserResponse } from '@/schemas/user.schema'

interface LoginPageProps {
  onSuccess: (user: UserResponse) => void
}

import { CommonLink } from '@/components/common/common-link'

const LoginPage = ({ onSuccess }: LoginPageProps) => {
  const { loginSuccess } = useAuth()
  const location = useLocation()

  const isStudent = location.pathname === PATHS.STUDENT.LOGIN
  const role = isStudent ? 'student' : 'lecturer'

  const studentLoginMutation = useStudentLoginMutation()
  const lecturerLoginMutation = useLecturerLoginMutation()

  const loginMutation = isStudent ? studentLoginMutation : lecturerLoginMutation

  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema),
    defaultValues: {
      username: '',
      password: ''
    }
  })

  const onSubmit = async (data: LoginRequest) => {
    if (loginMutation.isPending) return
    try {
      const result = await loginMutation.mutateAsync(data)
      const { accessToken } = result.data.data!
      const userData = await loginSuccess(accessToken)

      toast.success('Đăng nhập thành công')
      onSuccess(userData)
    } catch (error) {
      handleErrorApi({ error, setError: form.setError })
    }
  }

  const isLoading = loginMutation.isPending

  const bgImage = isStudent ? 'bg-[url("/images/student-login.jpeg")]' : 'bg-[url("/images/lecturer-login.png")]'
  const title = isStudent ? 'Đăng nhập - Sinh viên' : 'Đăng nhập hệ thống'
  const usernameLabel = isStudent ? 'Mã số sinh viên' : 'Mã số giảng viên'
  const usernamePlaceholder = isStudent ? 'Nhập mã số sinh viên' : 'Nhập mã số giảng viên'

  return (
    <div className={`fixed inset-0 ${bgImage} bg-cover bg-center flex items-center justify-end pr-[5%] lg:pr-[10%]`}>
      <div className='w-full max-w-[420px] bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl p-8 animate-fade-in'>
        <div className='flex flex-col items-center mb-8'>
          <img src='/images/full-logo.png' alt='IUH Logo' className='w-72 h-auto mb-6' />
          <h2 className='text-primary text-xl font-bold tracking-tight uppercase border-b-2 border-primary/10 pb-2 w-full text-center'>
            {title}
          </h2>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4' noValidate>
            <FormField
              control={form.control}
              name='username'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-xs font-bold uppercase text-gray-700 ml-1'>{usernameLabel}</FormLabel>
                  <FormControl>
                    <Input placeholder={usernamePlaceholder} disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-xs font-bold uppercase text-gray-700 ml-1'>Mật khẩu</FormLabel>
                  <FormControl>
                    <Input type='password' placeholder='••••••••' disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex justify-end'>
              <CommonLink to={PATHS.FORGOT_PASSWORD} state={{ role }} className='text-xs'>
                Quên mật khẩu?
              </CommonLink>
            </div>

            <Button
              type='submit'
              disabled={isLoading}
              className='w-full bg-primary h-12 text-white font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20'
            >
              {isLoading && <Loader2 className='mr-2 h-5 w-5 animate-spin' />}
              {isLoading ? 'Đang xác thực...' : 'Đăng nhập'}
            </Button>

            {isStudent && (
              <div className='flex flex-col items-center gap-2 mt-6 text-sm text-center'>
                <p className='text-gray-600'>
                  Chưa có tài khoản?{' '}
                  <CommonLink to={PATHS.STUDENT.REGISTER} bold>
                    Đăng ký ngay
                  </CommonLink>
                </p>
              </div>
            )}
          </form>
        </Form>
      </div>
    </div>
  )
}

export default LoginPage
