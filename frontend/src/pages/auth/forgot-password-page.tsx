import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useLocation } from 'react-router'
import {
  forgotPasswordRequestSchema,
  type ForgotPasswordRequest,
  resetPasswordRequestSchema,
  type ResetPasswordRequest
} from '@/schemas/password.schema'
import { useForgotPasswordMutation, useResetPasswordMutation } from '@/queries/password.queries'
import { handleErrorApi } from '@/utils/error-handler'
import { toast } from 'sonner'
import { Loader2, ArrowLeft } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { PATHS } from '@/constants/paths'
import { OtpVerificationFlow } from '@/components/common/otp-verification-flow'

type Step = 'EMAIL' | 'OTP' | 'PASSWORD'

const ForgotPasswordPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const role = location.state?.role
  const isLecturer = role === 'lecturer'

  const [step, setStep] = useState<Step>('EMAIL')
  const [email, setEmail] = useState('')

  const forgotMutation = useForgotPasswordMutation()
  const resetMutation = useResetPasswordMutation()

  const bgImage = isLecturer ? 'bg-[url("/images/lecturer-login.png")]' : 'bg-[url("/images/student-login.jpeg")]'
  const backLink = isLecturer ? PATHS.LECTURER.LOGIN : PATHS.STUDENT.LOGIN

  const emailForm = useForm<ForgotPasswordRequest>({
    resolver: zodResolver(forgotPasswordRequestSchema),
    defaultValues: { email: '' }
  })

  const passwordForm = useForm<ResetPasswordRequest>({
    resolver: zodResolver(resetPasswordRequestSchema),
    defaultValues: { email: '', resetToken: '', newPassword: '', confirmPassword: '' }
  })

  const onEmailSubmit = async (data: ForgotPasswordRequest) => {
    try {
      await forgotMutation.mutateAsync({ ...data, role })
      setEmail(data.email)
      setStep('OTP')
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  const handleOtpSuccess = (data: { resetToken?: string; email: string }) => {
    passwordForm.setValue('email', data.email)
    passwordForm.setValue('resetToken', data.resetToken || '')
    setStep('PASSWORD')
    toast.success('Xác thực mã OTP thành công')
  }

  const onPasswordSubmit = async (data: ResetPasswordRequest) => {
    try {
      await resetMutation.mutateAsync(data)
      toast.success('Mật khẩu của bạn đã được thay đổi thành công')
      navigate(backLink)
    } catch (error) {
      handleErrorApi({ error, setError: passwordForm.setError })
    }
  }

  const renderStep = () => {
    switch (step) {
      case 'EMAIL':
        return (
          <div className='space-y-6 animate-in fade-in slide-in-from-right-4 duration-500'>
            <div className='text-center space-y-2'>
              <h2 className='text-2xl font-bold text-gray-900'>Quên mật khẩu?</h2>
              <p className='text-gray-500 text-sm'>Nhập email đăng ký để nhận mã xác thực OTP</p>
            </div>

            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className='space-y-4'>
                <FormField
                  control={emailForm.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Địa chỉ Email</FormLabel>
                      <FormControl>
                        <Input placeholder='name@iuh.edu.vn' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type='submit'
                  className='w-full h-11 text-base font-semibold'
                  disabled={forgotMutation.isPending}
                >
                  {forgotMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                  {forgotMutation.isPending ? 'Đang gửi mã...' : 'Gửi mã xác thực'}
                </Button>
              </form>
            </Form>
          </div>
        )
      case 'OTP':
        return (
          <div className='animate-in fade-in slide-in-from-right-4 duration-500'>
            <OtpVerificationFlow
              emails={[email]}
              scope='password_reset'
              onSuccess={handleOtpSuccess}
              onBack={() => setStep('EMAIL')}
              hideLogo={true}
              hideFooter={true}
            />
          </div>
        )
      case 'PASSWORD':
        return (
          <div className='space-y-6 animate-in fade-in slide-in-from-right-4 duration-500'>
            <div className='text-center space-y-2'>
              <h2 className='text-2xl font-bold text-gray-900'>Mật khẩu mới</h2>
              <p className='text-gray-500 text-sm'>Vui lòng thiết lập mật khẩu mới cho tài khoản của bạn</p>
            </div>

            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className='space-y-4'>
                <FormField
                  control={passwordForm.control}
                  name='newPassword'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu mới</FormLabel>
                      <FormControl>
                        <Input type='password' placeholder='••••••••' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name='confirmPassword'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                      <FormControl>
                        <Input type='password' placeholder='••••••••' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type='submit'
                  className='w-full h-11 text-base font-semibold'
                  disabled={resetMutation.isPending}
                >
                  {resetMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                  Đổi mật khẩu
                </Button>
              </form>
            </Form>
          </div>
        )
    }
  }

  return (
    <div className={`fixed inset-0 ${bgImage} bg-cover bg-center flex items-center justify-end pr-[5%] lg:pr-[10%]`}>
      <div className='w-full max-w-[450px] bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl p-8 animate-fade-in'>
        <div className='flex flex-col items-center mb-6'>
          <img src='/images/full-logo.png' alt='IUH Logo' className='w-64 h-auto' />
        </div>

        {renderStep()}

        <div className='mt-6 text-center'>
          <Link
            to={backLink}
            className='inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary transition-colors'
          >
            <ArrowLeft className='w-4 h-4 mr-1' />
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
