import { User, Loader2, Mail, Phone, Calendar, Building2, GraduationCap, Save, Edit2, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMeQuery, useUpdateProfileMutation } from '@/queries/user.queries'
import { updateUserRequestSchema, type UpdateUserRequest } from '@/schemas/user.schema'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { toast } from 'sonner'
import { handleErrorApi } from '@/utils/error-handler'
import { useEffect, useState } from 'react'

const LecturerProfilePage = () => {
  const { data: meData, isLoading: isLoadingMe } = useMeQuery()
  const updateProfileMutation = useUpdateProfileMutation()
  const [isEditing, setIsEditing] = useState(false)

  const user = meData

  const form = useForm<UpdateUserRequest>({
    resolver: zodResolver(updateUserRequestSchema),
    defaultValues: {
      dob: '',
      phone: '',
      personalEmail: '',
      department: '',
      faculty: '',
      grade: ''
    }
  })

  useEffect(() => {
    if (user) {
      form.reset({
        dob: user.dob || '',
        phone: user.phone || '',
        personalEmail: user.personalEmail || '',
        department: user.department || '',
        faculty: user.faculty || '',
        grade: user.grade || ''
      })
    }
  }, [user, form])

  const onSubmit = async (data: UpdateUserRequest) => {
    if (updateProfileMutation.isPending) return
    try {
      await updateProfileMutation.mutateAsync(data)
      toast.success('Cập nhật thông tin thành công!')
      setIsEditing(false)
    } catch (error) {
      console.error('[UpdateProfile] Error:', error)
      handleErrorApi({ error, setError: form.setError })
    }
  }

  const handleCancel = () => {
    if (user) {
      form.reset({
        dob: user.dob || '',
        phone: user.phone || '',
        personalEmail: user.personalEmail || '',
        department: user.department || '',
        faculty: user.faculty || '',
        grade: user.grade || ''
      })
    }
    setIsEditing(false)
  }

  const isLoading = updateProfileMutation.isPending || isLoadingMe

  if (isLoadingMe && !user) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    )
  }

  return (
    <div>
      <div className='mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6'>
        <div className='flex flex-col gap-2'>
          <h1 className='text-3xl font-black tracking-tight text-primary uppercase'>Hồ sơ cá nhân</h1>
          <p className='text-gray-500 font-medium'>Quản lý và cập nhật thông tin cá nhân của bạn.</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} className='h-10 bg-primary hover:bg-primary/90 font-bold gap-2'>
            <Edit2 className='h-4 w-4' />
            Chỉnh sửa thông tin
          </Button>
        )}
      </div>

      <div className='rounded-xl border border-gray-200 bg-white p-8 shadow-sm'>
        {/* User Info Header */}
        <div className='mb-8 pb-6 border-b border-gray-200'>
          <div className='flex items-center gap-4'>
            <div className='flex h-20 w-20 items-center justify-center rounded-full bg-primary/10'>
              <User className='h-10 w-10 text-primary' />
            </div>
            <div>
              <h2 className='text-2xl font-bold text-gray-900'>{user?.fullName}</h2>
              <p className='text-gray-500 font-medium'>{user?.username}</p>
              <div className='flex items-center gap-2 mt-1'>
                <Mail className='h-4 w-4 text-gray-400' />
                <p className='text-sm text-gray-600'>{user?.iuhEmail}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6' noValidate>
            <div className='grid gap-6 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='dob'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-md font-semibold text-gray-700 flex items-center gap-2'>
                      <Calendar className='h-4 w-4' />
                      Ngày sinh <span className='text-red-500 font-bold'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='date'
                        disabled={!isEditing || isLoading}
                        className='h-11'
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage className='text-xs' />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='phone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-md font-semibold text-gray-700 flex items-center gap-2'>
                      <Phone className='h-4 w-4' />
                      Số điện thoại <span className='text-red-500 font-bold'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='09xxxxxxxx'
                        disabled={!isEditing || isLoading}
                        className='h-11'
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage className='text-xs' />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='personalEmail'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-md font-semibold text-gray-700 flex items-center gap-2'>
                    <Mail className='h-4 w-4' />
                    Email cá nhân <span className='text-red-500 font-bold'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='example@gmail.com'
                      disabled={!isEditing || isLoading}
                      className='h-11'
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />

            <div className='grid gap-6 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='department'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-md font-semibold text-gray-700 flex items-center gap-2'>
                      <Building2 className='h-4 w-4' />
                      Khoa <span className='text-red-500 font-bold'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Công nghệ Thông tin'
                        disabled={!isEditing || isLoading}
                        className='h-11'
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage className='text-xs' />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='faculty'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-md font-semibold text-gray-700 flex items-center gap-2'>
                      <GraduationCap className='h-4 w-4' />
                      Ngành <span className='text-red-500 font-bold'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Kỹ thuật Phần mềm'
                        disabled={!isEditing || isLoading}
                        className='h-11'
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage className='text-xs' />
                  </FormItem>
                )}
              />
            </div>

            {isEditing && (
              <div className='flex gap-4 pt-4'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleCancel}
                  disabled={isLoading}
                  className='flex-1 h-12 font-bold border-gray-300 hover:bg-gray-50'
                >
                  <X className='mr-2 h-5 w-5' />
                  Hủy
                </Button>
                <Button
                  type='submit'
                  disabled={isLoading}
                  className='flex-1 bg-primary h-12 text-white font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/30'
                >
                  {isLoading && <Loader2 className='mr-2 h-5 w-5 animate-spin' />}
                  <Save className='mr-2 h-5 w-5' />
                  {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </div>
    </div>
  )
}

export default LecturerProfilePage
