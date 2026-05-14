import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { changePasswordRequestSchema, type ChangePasswordRequest } from '@/schemas/password.schema'
import { useChangePasswordMutation } from '@/queries/password.queries'
import { handleErrorApi } from '@/utils/error-handler'
import { toast } from 'sonner'
import { Loader2, Lock, Eye, EyeOff } from 'lucide-react'

interface ChangePasswordModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ChangePasswordModal({ open, onOpenChange }: ChangePasswordModalProps) {
  const changePasswordMutation = useChangePasswordMutation()

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<ChangePasswordRequest>({
    resolver: zodResolver(changePasswordRequestSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  const onSubmit = async (data: ChangePasswordRequest) => {
    if (changePasswordMutation.isPending) return
    try {
      await changePasswordMutation.mutateAsync(data)
      toast.success('Đổi mật khẩu thành công')
      form.reset()
      onOpenChange(false)
    } catch (error) {
      handleErrorApi({ error, setError: form.setError })
    }
  }

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset()
    }
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[425px] rounded-xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Lock className='h-5 w-5 text-primary' />
            Đổi mật khẩu
          </DialogTitle>
          <DialogDescription>Nhập mật khẩu hiện tại và mật khẩu mới của bạn</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='currentPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu hiện tại</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Input
                        type={showCurrentPassword ? 'text' : 'password'}
                        placeholder='Nhập mật khẩu hiện tại'
                        {...field}
                      />
                      <button
                        type='button'
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'
                      >
                        {showCurrentPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='newPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu mới</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder='Nhập mật khẩu mới (tối thiểu 6 ký tự)'
                        {...field}
                      />
                      <button
                        type='button'
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'
                      >
                        {showNewPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder='Nhập lại mật khẩu mới'
                        {...field}
                      />
                      <button
                        type='button'
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'
                      >
                        {showConfirmPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex gap-3 pt-4'>
              <Button
                type='button'
                variant='outline'
                className='flex-1'
                onClick={() => handleClose(false)}
                disabled={changePasswordMutation.isPending}
              >
                Hủy
              </Button>
              <Button type='submit' className='flex-1' disabled={changePasswordMutation.isPending}>
                {changePasswordMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {changePasswordMutation.isPending ? 'Đang xử lý...' : 'Đổi mật khẩu'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
