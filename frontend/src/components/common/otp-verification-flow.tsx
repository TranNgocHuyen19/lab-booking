import { useState, useEffect, useCallback, useRef } from 'react'
import { Mail, RefreshCw, Loader2, ChevronRight, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { useSendOtpMutation, useVerifyOtpMutation } from '@/queries/otp.queries'
import { toast } from 'sonner'
import { handleErrorApi } from '@/utils/error-handler'

interface OtpVerificationFlowProps {
  emails: string[]
  scope: string
  name?: string
  onSuccess: (data: { resetToken?: string; email: string }) => void
  onCancel?: () => void
  onBack?: () => void
  className?: string
  hideLogo?: boolean
  hideFooter?: boolean
}

export function OtpVerificationFlow({
  emails,
  scope,
  name,
  onSuccess,
  onCancel,
  onBack,
  className,
  hideLogo = false,
  hideFooter = false
}: OtpVerificationFlowProps) {
  const [step, setStep] = useState<'SELECT' | 'INPUT'>(emails.length === 1 ? 'INPUT' : 'SELECT')
  const [targetEmail, setTargetEmail] = useState(emails.length === 1 ? emails[0] : '')
  const [otpValue, setOtpValue] = useState('')
  const [countdown, setCountdown] = useState(0)
  const autoSendInitiated = useRef(false)

  const sendOtpMutation = useSendOtpMutation()
  const verifyOtpMutation = useVerifyOtpMutation()

  const handleSendOtp = useCallback(
    async (email: string) => {
      try {
        setTargetEmail(email)
        await sendOtpMutation.mutateAsync({ email, scope, name })
        setStep('INPUT')
        setCountdown(60)
        toast.success('Mã OTP đã được gửi thành công')
      } catch (error) {
        handleErrorApi({ error })
      }
    },
    [sendOtpMutation, scope, name]
  )

  useEffect(() => {
    if (emails.length === 1 && !autoSendInitiated.current) {
      autoSendInitiated.current = true
      const email = emails[0]
      sendOtpMutation
        .mutateAsync({ email, scope, name })
        .then(() => {
          setCountdown(60)
        })
        .catch((error) => {
          handleErrorApi({ error })
        })
    }
  }, [emails, scope, name, sendOtpMutation])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleVerify = async () => {
    if (otpValue.length < 6) return
    try {
      const result = await verifyOtpMutation.mutateAsync({
        email: targetEmail,
        otp: otpValue,
        scope
      })
      onSuccess({ resetToken: result.data.data?.resetToken, email: targetEmail })
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  if (step === 'SELECT') {
    return (
      <div className={cn('space-y-6 flex flex-col items-center', className)}>
        {!hideLogo && <img src='/images/full-logo.png' alt='IUH Logo' className='w-64 h-auto mb-2' />}

        <div className='text-center space-y-2'>
          <h2 className='text-2xl font-bold text-gray-800'>Xác thực tài khoản</h2>
          <p className='text-gray-500 text-sm'>Vui lòng chọn email bạn muốn nhận mã OTP</p>
        </div>

        <div className='grid gap-3 w-full'>
          {emails.map((email) => (
            <Button
              key={email}
              variant='outline'
              className='h-auto py-4 justify-start gap-4 hover:border-blue-800 hover:bg-blue-50 group border-gray-200 rounded-xl transition-all'
              onClick={() => handleSendOtp(email)}
              disabled={sendOtpMutation.isPending}
            >
              <div className='p-2 rounded-full bg-gray-100 group-hover:bg-blue-100 transition-colors'>
                <Mail className='h-5 w-5 text-gray-400 group-hover:text-blue-800' />
              </div>
              <div className='text-left'>
                <p className='text-sm font-semibold text-gray-900'>{email}</p>
              </div>
              <ChevronRight className='ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-all text-blue-800' />
            </Button>
          ))}
        </div>

        {!hideFooter && onCancel && (
          <button
            onClick={onCancel}
            className='text-sm text-gray-500 hover:text-blue-800 flex items-center gap-2 transition-colors font-medium mt-2'
          >
            <ArrowLeft className='h-4 w-4' />
            Quay lại
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col items-center space-y-6', className)}>
      {!hideLogo && <img src='/images/full-logo.png' alt='IUH Logo' className='w-64 h-auto mb-2' />}

      <div className='text-center space-y-2'>
        <h2 className='text-2xl font-bold text-gray-800'>Xác thực mã OTP</h2>
        <div className='text-gray-500 text-sm'>
          <p>Mã OTP đã được gửi đến</p>
          <p className='font-bold text-gray-800 mt-1'>{targetEmail}</p>
        </div>
      </div>

      <div className='space-y-6 w-full flex flex-col items-center'>
        <InputOTP maxLength={6} value={otpValue} onChange={setOtpValue}>
          <InputOTPGroup className='gap-2'>
            <InputOTPSlot
              index={0}
              className='w-12 h-14 text-xl font-semibold border-gray-200 bg-gray-50/50 rounded-lg'
            />
            <InputOTPSlot
              index={1}
              className='w-12 h-14 text-xl font-semibold border-gray-200 bg-gray-50/50 rounded-lg'
            />
            <InputOTPSlot
              index={2}
              className='w-12 h-14 text-xl font-semibold border-gray-200 bg-gray-50/50 rounded-lg'
            />
            <InputOTPSlot
              index={3}
              className='w-12 h-14 text-xl font-semibold border-gray-200 bg-gray-50/50 rounded-lg'
            />
            <InputOTPSlot
              index={4}
              className='w-12 h-14 text-xl font-semibold border-gray-200 bg-gray-50/50 rounded-lg'
            />
            <InputOTPSlot
              index={5}
              className='w-12 h-14 text-xl font-semibold border-gray-200 bg-gray-50/50 rounded-lg'
            />
          </InputOTPGroup>
        </InputOTP>

        <Button
          className='w-full h-12 text-base font-bold bg-[#1a3a8a] hover:bg-[#1e40af] text-white rounded-lg'
          disabled={otpValue.length < 6 || verifyOtpMutation.isPending}
          onClick={handleVerify}
        >
          {verifyOtpMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          Xác nhận
        </Button>

        <div className='flex flex-col items-center gap-4 w-full'>
          <button
            type='button'
            onClick={() => handleSendOtp(targetEmail)}
            disabled={countdown > 0 || sendOtpMutation.isPending}
            className='text-sm text-gray-400 hover:text-blue-800 disabled:text-gray-400 flex items-center gap-2 transition-colors font-medium'
          >
            <RefreshCw className={cn('h-4 w-4', sendOtpMutation.isPending && 'animate-spin')} />
            {countdown > 0 ? `Gửi lại mã sau ${countdown}s` : 'Gửi lại mã xác thực'}
          </button>

          {!hideFooter && (emails.length > 1 || onBack) && (
            <button
              type='button'
              onClick={() => (emails.length > 1 ? setStep('SELECT') : onBack?.())}
              className='text-sm text-gray-500 hover:text-blue-800 flex items-center gap-2 transition-colors font-medium'
            >
              <ArrowLeft className='h-4 w-4' />
              {emails.length > 1 ? 'Thay đổi email nhận mã' : 'Quay lại đăng nhập'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
