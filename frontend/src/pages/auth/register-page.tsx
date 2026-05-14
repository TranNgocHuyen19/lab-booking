import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router'
import { registerRequestSchema, type RegisterRequest } from '@/schemas/auth.schema'
import { type ApiResponse, type PageResponse } from '@/schemas/base.schema'
import { type ResearchGroupResponse } from '@/schemas/research-group.schema'
import { useRegisterMutation } from '@/queries/auth.queries'
import { useResearchGroupsInfiniteQuery } from '@/queries/research-group.queries'
import { PATHS } from '@/constants/paths'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import { handleErrorApi } from '@/utils/error-handler'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { InfiniteScrollMultipleSelect } from '@/components/common/infinite-scroll-multiple-select'
import { ImageUpload } from '@/components/common/image-upload'
import { useUploadFileMutation } from '@/queries/file.queries'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { uploadMultipleFiles } from '@/services/file.service'
import { OtpVerificationFlow } from '@/components/common/otp-verification-flow'
import { useAuth } from '@/hooks/use-auth'
import { GroupType, type RoleType } from '@/constants/types'
import { getDashboardPath } from '@/utils/rbac'

import { CommonLink } from '@/components/common/common-link'

const RegisterPage = () => {
  const navigate = useNavigate()
  const { loginSuccess } = useAuth()
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'RESEARCH' | 'THESIS'>('ALL')
  const registerMutation = useRegisterMutation()
  const uploadMutation = useUploadFileMutation()

  const [openOtpDialog, setOpenOtpDialog] = useState(false)
  const [frontFile, setFrontFile] = useState<File | null>(null)
  const [backFile, setBackFile] = useState<File | null>(null)
  const [tempRegData, setTempRegData] = useState<RegisterRequest | null>(null)
  const [isRegistering, setIsRegistering] = useState(false)

  const {
    data: groupsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useResearchGroupsInfiniteQuery({
    limit: 10,
    type: typeFilter === 'ALL' ? undefined : typeFilter
  })

  const researchGroups =
    groupsData?.pages.flatMap((page: ApiResponse<PageResponse<ResearchGroupResponse[]>>) => page.data.data) || []

  const form = useForm<RegisterRequest>({
    resolver: zodResolver(registerRequestSchema),
    defaultValues: {
      username: '',
      fullName: '',
      password: '',
      confirmPassword: '',
      dob: '',
      phone: '',
      iuhEmail: '',
      personalEmail: '',
      department: '',
      faculty: '',
      grade: '',
      frontStudentCard: 0,
      backStudentCard: 0,
      researchGroupIds: [],
      joinMessage: ''
    }
  })

  const onSubmit = async (data: RegisterRequest) => {
    if (registerMutation.isPending || uploadMutation.isPending) return
    if (!frontFile || !backFile) {
      toast.error('Vui lòng chọn đầy đủ 2 mặt thẻ sinh viên')
      return
    }
    setTempRegData(data)
    setOpenOtpDialog(true)
  }

  const handleOtpSuccess = async () => {
    if (!tempRegData || !frontFile || !backFile) return
    try {
      setIsRegistering(true)
      const [frontRes, backRes] = await uploadMultipleFiles([frontFile, backFile], 'student-cards')
      const finalData: RegisterRequest = {
        ...tempRegData,
        frontStudentCard: frontRes.id,
        backStudentCard: backRes.id
      }
      const result = await registerMutation.mutateAsync(finalData)
      const { accessToken } = result.data.data!
      const user = await loginSuccess(accessToken)
      if (user) {
        toast.success('Đăng ký thành công!')
        setOpenOtpDialog(false)
        navigate(getDashboardPath(user.role as RoleType))
      }
    } catch (error) {
      console.error('[Register] Error:', error)
      handleErrorApi({ error, setError: form.setError })
    } finally {
      setIsRegistering(false)
    }
  }

  const emailsForOtp = [tempRegData?.iuhEmail || '']
  if (tempRegData?.personalEmail && tempRegData.personalEmail.trim() !== '') {
    emailsForOtp.push(tempRegData.personalEmail)
  }

  const isLoading = registerMutation.isPending || isRegistering
  const selectedGroups = useWatch({
    control: form.control,
    name: 'researchGroupIds'
  })
  const isNoGroupSelected = !selectedGroups || selectedGroups.length === 0

  return (
    <div className='fixed inset-0 bg-[url("/images/student-login.jpeg")] bg-cover bg-center flex items-center justify-center p-4 overflow-y-auto py-10 md:py-20'>
      <div className='w-full max-w-[850px] bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-10 animate-fade-in my-auto'>
        <div className='flex flex-col items-center mb-8'>
          <img src='/images/full-logo.png' alt='IUH Logo' className='w-96 h-auto mb-8' />
          <h2 className='text-primary text-3xl font-black tracking-tight uppercase border-b-2 border-primary/20 pb-5 w-full text-center'>
            Đăng ký tài khoản sinh viên
          </h2>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4' noValidate>
            <div className='grid gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='username'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-md font-semibold text-gray-700'>
                      Mã sinh viên <span className='text-red-500 font-bold'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder='22000001' disabled={isLoading} className='h-11' {...field} />
                    </FormControl>
                    <FormMessage className='text-xs' />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='fullName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-md font-semibold text-gray-700'>
                      Họ tên <span className='text-red-500 font-bold'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder='Nguyễn Văn A' disabled={isLoading} className='h-11' {...field} />
                    </FormControl>
                    <FormMessage className='text-xs' />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='dob'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-md font-semibold text-gray-700'>Ngày sinh</FormLabel>
                    <FormControl>
                      <Input type='date' disabled={isLoading} className='h-11' {...field} value={field.value ?? ''} />
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
                    <FormLabel className='text-md font-semibold text-gray-700'>Số điện thoại</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='09xxxxxxxx'
                        disabled={isLoading}
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

            <div className='grid gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='iuhEmail'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-md font-semibold text-gray-700'>
                      Email IUH <span className='text-red-500 font-bold'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='example@student.iuh.edu.vn'
                        disabled={isLoading}
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
                name='personalEmail'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-md font-semibold text-gray-700'>Email cá nhân</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='example@gmail.com'
                        disabled={isLoading}
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

            <div className='grid gap-4 md:grid-cols-3'>
              <FormField
                control={form.control}
                name='department'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-md font-semibold text-gray-700'>Khoa</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Công nghệ Thông tin'
                        disabled={isLoading}
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
                    <FormLabel className='text-md font-semibold text-gray-700'>Ngành</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Kỹ thuật Phần mềm'
                        disabled={isLoading}
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
                name='grade'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-md font-semibold text-gray-700'>
                      Lớp <span className='text-red-500 font-bold'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='DHKTPM18A'
                        disabled={isLoading}
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

            <div className='grid gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-md font-semibold text-gray-700'>
                      Mật khẩu <span className='text-red-500 font-bold'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type='password' placeholder='••••••••' disabled={isLoading} className='h-11' {...field} />
                    </FormControl>
                    <FormMessage className='text-xs' />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-md font-semibold text-gray-700'>
                      Xác nhận mật khẩu <span className='text-red-500 font-bold'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type='password' placeholder='••••••••' disabled={isLoading} className='h-11' {...field} />
                    </FormControl>
                    <FormMessage className='text-xs' />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='frontStudentCard'
                render={({ field }) => (
                  <ImageUpload
                    height='h-64'
                    label={
                      <span>
                        Mặt trước thẻ sinh viên <span className='text-red-500 font-bold'>*</span>
                      </span>
                    }
                    value={field.value}
                    onChange={(base64, file) => {
                      field.onChange(base64)
                      setFrontFile(file || null)
                    }}
                    disabled={isLoading}
                  />
                )}
              />

              <FormField
                control={form.control}
                name='backStudentCard'
                render={({ field }) => (
                  <ImageUpload
                    height='h-64'
                    label={
                      <span>
                        Mặt sau thẻ sinh viên <span className='text-red-500 font-bold'>*</span>
                      </span>
                    }
                    value={field.value}
                    onChange={(base64, file) => {
                      field.onChange(base64)
                      setBackFile(file || null)
                    }}
                    disabled={isLoading}
                  />
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='researchGroupIds'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-lg font-bold text-gray-800 mb-3 block'>
                    Đăng ký tham gia nhóm nghiên cứu
                  </FormLabel>
                  <div className='flex gap-2 mb-4'>
                    <button
                      type='button'
                      onClick={() => setTypeFilter('ALL')}
                      className={cn(
                        'text-xs font-semibold px-4 py-1 rounded-full border transition-all shadow-sm',
                        typeFilter === 'ALL'
                          ? 'bg-primary text-white border-primary shadow-md'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-primary/30 hover:text-primary hover:bg-primary/5'
                      )}
                    >
                      Tất cả
                    </button>
                    {Object.entries(GroupType).map(([key, label]) => (
                      <button
                        key={key}
                        type='button'
                        onClick={() => setTypeFilter(key as 'RESEARCH' | 'THESIS')}
                        className={cn(
                          'text-xs font-semibold px-4 py-1 rounded-full border transition-all shadow-sm',
                          typeFilter === key
                            ? 'bg-primary text-white border-primary shadow-md'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-primary/30 hover:text-primary hover:bg-primary/5'
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <FormControl>
                    <InfiniteScrollMultipleSelect
                      items={researchGroups}
                      value={field.value?.map(String) || []}
                      onValueChange={(vals) => field.onChange(vals.map(Number))}
                      getItemValue={(item: ResearchGroupResponse) => item.researchGroupId.toString()}
                      getItemLabel={(item: ResearchGroupResponse) => item.groupName}
                      hasMore={!!hasNextPage}
                      isLoading={isFetchingNextPage}
                      onLoadMore={fetchNextPage}
                      placeholder='Chọn nhóm nghiên cứu...'
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='joinMessage'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-md font-semibold text-gray-700'>
                    Lời nhắn gửi nhóm nghiên cứu
                    {isNoGroupSelected && (
                      <span className='ml-2 text-xs font-normal text-amber-600'>(Vui lòng chọn nhóm trước)</span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={
                        isNoGroupSelected
                          ? 'Vui lòng chọn ít nhất một nhóm nghiên cứu để gửi lời nhắn...'
                          : 'Tại sao bạn muốn tham gia nhóm này?'
                      }
                      disabled={isLoading || isNoGroupSelected}
                      className='min-h-[100px] resize-none'
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />

            <Button
              type='submit'
              disabled={isLoading}
              className='w-full bg-primary h-14 text-white font-black text-xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/30 rounded-xl'
            >
              {isLoading && <Loader2 className='mr-3 h-6 w-6 animate-spin' />}
              {isLoading ? 'Đang đăng ký...' : 'ĐĂNG KÝ NGAY'}
            </Button>

            <div className='text-center text-sm mt-4'>
              <p className='text-gray-600'>
                Đã có tài khoản?{' '}
                <CommonLink to={PATHS.STUDENT.LOGIN} bold>
                  Đăng nhập tại đây
                </CommonLink>
              </p>
            </div>
          </form>
        </Form>
      </div>

      <Dialog open={openOtpDialog} onOpenChange={setOpenOtpDialog}>
        <DialogContent className='sm:max-w-[450px] p-8 rounded-[2rem] border-none shadow-2xl'>
          <OtpVerificationFlow
            emails={emailsForOtp}
            scope='REGISTER'
            name={tempRegData?.fullName}
            onSuccess={handleOtpSuccess}
            onCancel={() => setOpenOtpDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default RegisterPage
