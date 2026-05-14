import { useNavigate } from 'react-router'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ChevronLeft,
  Loader2,
  Save,
  Search,
  Check,
  Users,
  UserPlus,
  Info,
  HelpCircle,
  GraduationCap
} from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { createResearchGroupSchema, type CreateResearchGroupRequest } from '@/schemas/research-group.schema'
import { useCreateResearchGroupMutation } from '@/queries/research-group.queries'
import { PATHS } from '@/constants/paths'
import { GroupType, GroupTypeLabel, MemberRole } from '@/constants/types'
import { handleErrorApi } from '@/utils/error-handler'
import { useDebounce } from '@/hooks/use-debounce'
import { useSearchUsersQuery } from '@/queries/user.queries'
import { UserAvatar } from '@/components/common/user-avatar'
import { cn } from '@/lib/utils'
import { type UserResponse } from '@/schemas/user.schema'
import { MemberCard } from '@/components/lecturer/research-group/member-card'
import { InfiniteScrollSelect } from '@/components/common/infinite-scroll-select'

const AdminAddResearchGroupPage = () => {
  const navigate = useNavigate()
  const createMutation = useCreateResearchGroupMutation()

  const [keyword, setKeyword] = useState('')
  const debouncedKeyword = useDebounce(keyword, 400)

  const { data: searchResult, isLoading: isSearching } = useSearchUsersQuery({
    keyword: debouncedKeyword,
    page: 1,
    size: 10
  })

  const users: UserResponse[] = searchResult || []

  const [advisorSearch, setAdvisorSearch] = useState('')
  const { data: lecturersResult, isLoading: isLoadingLecturers } = useSearchUsersQuery({
    page: 1,
    size: 20,
    keyword: advisorSearch
  })
  const lecturers = lecturersResult || []

  const form = useForm<CreateResearchGroupRequest>({
    resolver: zodResolver(createResearchGroupSchema),
    defaultValues: {
      groupName: '',
      description: '',
      projectName: '',
      groupType: 'RESEARCH',
      isPrivate: false,
      advisorId: undefined,
      initialMembers: []
    }
  })

  const initialMembers =
    useWatch({
      control: form.control,
      name: 'initialMembers'
    }) || []

  const toggleUserSelection = (user: UserResponse) => {
    const isSelected = initialMembers.some((m) => m.username === user.username)
    if (isSelected) {
      form.setValue(
        'initialMembers',
        initialMembers.filter((m) => m.username !== user.username)
      )
    } else {
      form.setValue('initialMembers', [...initialMembers, { username: user.username, role: 'MEMBER' }])
      setKeyword('')
    }
  }

  const isUserSelected = (username: string) => {
    return initialMembers.some((m) => m.username === username)
  }

  const onSubmit = async (data: CreateResearchGroupRequest) => {
    try {
      await createMutation.mutateAsync(data)
      toast.success('Thêm nhóm nghiên cứu thành công')
      navigate(PATHS.ADMIN.RESEARCH_GROUPS)
    } catch (error) {
      handleErrorApi({ error, setError: form.setError })
    }
  }

  return (
    <div className='flex flex-col gap-8'>
      <div>
        <div className='mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6'>
          <div className='flex items-start gap-4'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => navigate(-1)}
              className='h-10 w-10 min-w-[40px] rounded-full hover:bg-white/50 -mt-1'
            >
              <ChevronLeft className='h-6 w-6 text-gray-600' />
            </Button>
            <div className='flex flex-col gap-1'>
              <h1 className='text-3xl font-black tracking-tight text-primary uppercase leading-none'>
                Thêm nhóm nghiên cứu mới
              </h1>
              <p className='text-gray-500 font-medium'>Bắt đầu xây dựng nhóm nghiên cứu của bạn</p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form className='space-y-8 pb-10'>
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
              <div className='lg:col-span-2 space-y-6'>
                <div className='bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in'>
                  <div className='p-6 border-b border-gray-100 bg-gray-50/30 flex items-center gap-3'>
                    <div className='h-10 w-10  bg-primary/10 flex items-center justify-center rounded-xl'>
                      <Info className='h-5 w-5 text-primary' />
                    </div>
                    <h3 className='text-lg font-black text-primary tracking-tight uppercase'>Thông tin chung</h3>
                  </div>

                  <div className='p-8 space-y-6'>
                    <div className='grid grid-cols-12 gap-6'>
                      <FormField
                        control={form.control}
                        name='groupName'
                        render={({ field }) => (
                          <FormItem className='col-span-12 md:col-span-9'>
                            <FormLabel className='text-md font-semibold text-gray-700'>
                              Tên nhóm <span className='text-red-500 font-bold'>*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder='Ví dụ: Nhóm Nghiên cứu AI'
                                className='h-12 border-gray-200 '
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className='text-xs' />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='groupType'
                        render={({ field }) => (
                          <FormItem className='col-span-12 md:col-span-3'>
                            <FormLabel className='text-md font-semibold text-gray-700'>
                              Loại nhóm <span className='text-red-500 font-bold'>*</span>
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className='h-12 border-gray-200 '>
                                  <SelectValue placeholder='Chọn loại nhóm' />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className=''>
                                {Object.entries(GroupType).map(([key, value]) => (
                                  <SelectItem key={key} value={value} className='font-medium'>
                                    {GroupTypeLabel[value as keyof typeof GroupTypeLabel]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className='text-xs' />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='advisorId'
                        render={({ field }) => (
                          <FormItem className='col-span-12'>
                            <FormLabel className='text-md font-semibold text-gray-700'>
                              Giảng viên quản lý <span className='text-red-500 font-bold'>*</span>
                            </FormLabel>
                            <FormControl>
                              <div className='relative'>
                                <GraduationCap className='absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10' />
                                <InfiniteScrollSelect
                                  placeholder='Chọn giảng viên chịu trách nhiệm...'
                                  items={lecturers}
                                  getItemValue={(u) => String(u.userId)}
                                  getItemLabel={(u) => `${u.fullName} (${u.username})`}
                                  value={field.value ? String(field.value) : undefined}
                                  onValueChange={(val) => field.onChange(val ? Number(val) : undefined)}
                                  onSearchChange={setAdvisorSearch}
                                  isLoading={isLoadingLecturers}
                                  className='h-12 border-gray-200 pl-11'
                                />
                              </div>
                            </FormControl>
                            <FormDescription className='text-xs italic'>
                              Giảng viên này sẽ có quyền quản trị nhóm.
                            </FormDescription>
                            <FormMessage className='text-xs' />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='projectName'
                        render={({ field }) => (
                          <FormItem className='col-span-12'>
                            <FormLabel className='text-md font-semibold text-gray-700'>Tên đề tài</FormLabel>
                            <FormControl>
                              <Input
                                placeholder='Ví dụ: Xây dựng hệ thống quản lý phòng Lab thông minh'
                                className='h-12 border-gray-200   '
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className='text-xs' />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name='description'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-md font-semibold text-gray-700'>Mô tả chi tiết</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder='Hãy mô tả ngắn gọn về mục tiêu và hướng nghiên cứu của nhóm...'
                              className='min-h-[140px] border-gray-200  resize-none'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className='text-xs' />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className='bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-row items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <div className='h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center'>
                      <Users className='h-6 w-6 text-gray-400' />
                    </div>
                    <div>
                      <h4 className='text-md font-bold text-gray-900 leading-none mb-1 uppercase'>Chế độ riêng tư</h4>
                      <p className='text-xs text-gray-500 font-medium'>Khi bật, nhóm sẽ ẩn khỏi tìm kiếm công khai.</p>
                    </div>
                  </div>
                  <FormField
                    control={form.control}
                    name='isPrivate'
                    render={({ field }) => (
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className='data-[state=checked]:bg-primary'
                        />
                      </FormControl>
                    )}
                  />
                </div>
              </div>

              <div className='h-full'>
                <div className='bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col h-full animate-fade-in overflow-hidden'>
                  <div className='p-6 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <div className='h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center'>
                        <UserPlus className='h-4 w-4 text-primary' />
                      </div>
                      <h3 className='text-lg font-black text-primary tracking-tight uppercase'>Thành viên</h3>
                    </div>
                    <Badge variant='secondary' className='h-6 bg-primary/10 text-primary font-black border-none px-3'>
                      Đã chọn: {initialMembers.length}
                    </Badge>
                  </div>

                  <div className='p-6 flex-1 flex flex-col gap-6'>
                    <div className='relative group'>
                      <Search className='absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors' />
                      <Input
                        placeholder='Tìm kiếm qua Email, ID...'
                        className='pl-10 h-12 bg-gray-50 border-gray-100 text-sm focus:bg-white transition-all '
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                      />

                      {keyword && (
                        <div className='absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-gray-100 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2'>
                          {isSearching ? (
                            <div className='p-8 flex flex-col items-center justify-center gap-3'>
                              <Loader2 className='h-6 w-6 animate-spin text-primary' />
                              <span className='text-xs text-gray-500 font-bold uppercase'>Đang tìm kiếm...</span>
                            </div>
                          ) : users.length === 0 ? (
                            <div className='p-8 text-center flex flex-col items-center gap-2'>
                              <HelpCircle className='h-10 w-10 text-gray-200' />
                              <p className='text-sm text-gray-500 font-bold uppercase'>Không tìm thấy</p>
                            </div>
                          ) : (
                            <div className='max-h-[300px] overflow-y-auto p-2'>
                              {users.map((user) => {
                                const selected = isUserSelected(user.username)
                                return (
                                  <div
                                    key={user.userId}
                                    onClick={() => toggleUserSelection(user)}
                                    className={cn(
                                      'flex items-center justify-between p-3  cursor-pointer transition-all border border-transparent mb-1 rounded-xl',
                                      selected ? 'bg-primary/5 border-primary/10' : 'hover:bg-gray-50'
                                    )}
                                  >
                                    <div className='flex items-center gap-3'>
                                      <UserAvatar
                                        name={user.fullName}
                                        className='h-9 w-9 border border-white shadow-sm'
                                      />
                                      <div className='flex flex-col'>
                                        <span className='text-sm font-bold text-gray-900 leading-none mb-1'>
                                          {user.fullName}
                                        </span>
                                        <span className='text-[11px] text-gray-500 font-medium whitespace-nowrap'>
                                          {user.username}
                                        </span>
                                      </div>
                                    </div>
                                    {selected && (
                                      <div className='h-5 w-5 rounded-full bg-primary flex items-center justify-center'>
                                        <Check className='h-3 w-3 text-white' />
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className='flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar'>
                      {initialMembers.length === 0 ? (
                        <div className='flex flex-col items-center justify-center h-full gap-4 opacity-30'>
                          <div className='h-16 w-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center'>
                            <Users className='h-8 w-8 text-gray-300' />
                          </div>
                          <p className='text-sm font-black uppercase text-gray-400 tracking-widest'>
                            Chưa có thành viên nào
                          </p>
                        </div>
                      ) : (
                        initialMembers.map((member, index) => (
                          <MemberCard
                            key={member.username}
                            username={member.username}
                            role={member.role}
                            availableRoles={[MemberRole.MEMBER, MemberRole.CO_LEADER]}
                            onRoleChange={(value) => {
                              const newMembers = [...initialMembers]
                              newMembers[index] = { ...member, role: value }
                              form.setValue('initialMembers', newMembers)
                            }}
                            onRemove={() =>
                              form.setValue(
                                'initialMembers',
                                initialMembers.filter((m) => m.username !== member.username)
                              )
                            }
                          />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='flex items-center justify-end gap-3 border-t border-gray-100'>
              <Button
                type='button'
                variant='outline'
                onClick={() => navigate(-1)}
                className='h-12 px-8 font-bold border-gray-200 rounded-xl hover:bg-gray-50 transition-all'
              >
                Hủy bỏ
              </Button>
              <Button
                type='submit'
                variant='primary'
                onClick={form.handleSubmit(onSubmit)}
                disabled={createMutation.isPending}
                className='h-12 px-10'
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Save className='mr-2 h-5 w-5' />
                    Tạo nhóm nghiên cứu
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default AdminAddResearchGroupPage
