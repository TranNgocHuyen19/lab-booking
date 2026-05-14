import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ChevronLeft,
  Loader2,
  Info,
  Users,
  Save,
  GraduationCap,
  Search,
  HelpCircle,
  Check,
  UserPlus
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { updateResearchGroupSchema, type UpdateResearchGroupRequest } from '@/schemas/research-group.schema'
import { useGroupDetailAdminQuery, useUpdateResearchGroupMutation } from '@/queries/research-group.queries'
import { PATHS } from '@/constants/paths'
import { GroupType, GroupTypeLabel, MemberRole } from '@/constants/types'
import { handleErrorApi } from '@/utils/error-handler'
import { MemberCard } from '@/components/lecturer/research-group/member-card'
import { InfiniteScrollSelect } from '@/components/common/infinite-scroll-select'
import { useSearchUsersQuery } from '@/queries/user.queries'
import { LecturerLoading } from '@/components/common/lecturer-loading'
import { cn } from '@/lib/utils'
import { UserAvatar } from '@/components/common/user-avatar'
import { type UserResponse } from '@/schemas/user.schema'

const AdminUpdateResearchGroupPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const groupId = Number(id)

  const { data: detailData, isLoading: isLoadingDetail } = useGroupDetailAdminQuery(groupId)
  const updateMutation = useUpdateResearchGroupMutation()

  // For selecting advisor
  const [advisorSearch, setAdvisorSearch] = useState('')
  const { data: lecturersResult, isLoading: isLoadingLecturers } = useSearchUsersQuery({
    page: 1,
    size: 20,
    keyword: advisorSearch
  })
  const lecturers = lecturersResult || []

  // For member search
  const [memberKeyword, setMemberKeyword] = useState('')
  const { data: searchResult, isLoading: isSearching } = useSearchUsersQuery({
    keyword: memberKeyword,
    page: 1,
    size: 10
  })
  const searchUsers: UserResponse[] = searchResult || []

  const form = useForm<UpdateResearchGroupRequest>({
    resolver: zodResolver(updateResearchGroupSchema),
    defaultValues: {
      groupName: '',
      description: '',
      projectName: '',
      groupType: 'RESEARCH',
      isPrivate: false,
      advisorId: undefined,
      members: []
    }
  })

  useEffect(() => {
    if (detailData?.data) {
      const group = detailData.data
      form.reset({
        groupName: group.groupName,
        description: group.description || '',
        projectName: group.projectName || '',
        groupType: group.groupType,
        isPrivate: group.isPrivate,
        advisorId: group.leaderId || undefined,
        members: group.members?.map((m) => ({ username: m.username, role: m.role })) || []
      })
    }
  }, [detailData, form])

  const members =
    useWatch({
      control: form.control,
      name: 'members'
    }) || []

  const toggleUserSelection = (user: UserResponse) => {
    const isSelected = members.some((m) => m.username === user.username)
    if (isSelected) {
      form.setValue(
        'members',
        members.filter((m) => m.username !== user.username)
      )
    } else {
      form.setValue('members', [...members, { username: user.username, role: MemberRole.MEMBER }])
      setMemberKeyword('')
    }
  }

  const isUserSelected = (username: string) => {
    return members.some((m) => m.username === username)
  }

  const onSubmit = async (data: UpdateResearchGroupRequest) => {
    try {
      await updateMutation.mutateAsync({ id: groupId, data })
      toast.success('Cập nhật nhóm nghiên cứu thành công')
      navigate(PATHS.ADMIN.RESEARCH_GROUPS)
    } catch (error) {
      handleErrorApi({ error, setError: form.setError })
    }
  }

  if (isLoadingDetail) {
    return <LecturerLoading />
  }

  return (
    <div className='flex flex-col gap-8'>
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
            <h1 className='text-3xl font-black text-primary uppercase tracking-tight leading-none'>
              Cập nhật thông tin nhóm
            </h1>
            <p className='text-gray-500 font-medium truncate max-w-2xl'>
              Chỉnh sửa chi tiết cho nhóm:{' '}
              <span className='font-bold text-gray-700'>{detailData?.data?.groupName}</span>
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form className='space-y-8 pb-10'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            <div className='lg:col-span-2 space-y-6'>
              <div className='bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in'>
                <div className='p-6 border-b border-gray-100 bg-gray-50/30 flex items-center gap-3'>
                  <div className='h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center'>
                    <Info className='h-5 w-5 text-primary' />
                  </div>
                  <h3 className='text-xl font-black text-primary tracking-tight uppercase'>Cấu hình nhóm</h3>
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
                              className='h-12 border-gray-200'
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
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className='h-12 border-gray-200'>
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
                            Giảng viên hướng dẫn <span className='text-red-500 font-bold'>*</span>
                          </FormLabel>
                          <FormControl>
                            <div className='relative'>
                              <GraduationCap className='absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10' />
                              <InfiniteScrollSelect
                                placeholder='Thay đổi giảng viên hướng dẫn...'
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
                            Chuyển quyền quản lý cho giảng viên khác.
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
                              placeholder='Ví dụ: Xây dựng hệ thống quản lý phòng Lab'
                              className='h-12 border-gray-200'
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage className='text-xs' />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='description'
                      render={({ field }) => (
                        <FormItem className='col-span-12'>
                          <FormLabel className='text-md font-semibold text-gray-700'>Mô tả chi tiết</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder='Hãy mô tả ngắn gọn về mục tiêu và hướng nghiên cứu của nhóm...'
                              className='min-h-[140px] border-gray-200 resize-none'
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage className='text-xs' />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className='bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-row items-center justify-between'>
                <div className='flex items-center gap-4'>
                  <div className='h-12 w-12 bg-gray-50 flex items-center justify-center rounded-xl'>
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
              <div className='bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col h-full min-h-[600px] animate-fade-in overflow-hidden'>
                <div className='p-6 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center'>
                      <UserPlus className='h-4 w-4 text-primary' />
                    </div>
                    <h3 className='text-lg font-black text-primary tracking-tight uppercase'>Thành viên</h3>
                  </div>

                  <Badge variant='secondary' className='h-6 bg-primary/10 text-primary font-black border-none px-3'>
                    Số lượng: {members.length}
                  </Badge>
                </div>

                <div className='p-6 flex-1 flex flex-col gap-6'>
                  <div className='relative group'>
                    <Search className='absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors' />
                    <Input
                      placeholder='Tìm kiếm qua Email, ID...'
                      className='pl-10 h-11 bg-gray-50 border-gray-100 text-sm focus:bg-white transition-all rounded-xl'
                      value={memberKeyword}
                      onChange={(e) => setMemberKeyword(e.target.value)}
                    />

                    {memberKeyword && (
                      <div className='absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-gray-100 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2'>
                        {isSearching ? (
                          <div className='p-8 flex flex-col items-center justify-center gap-3'>
                            <Loader2 className='h-6 w-6 animate-spin text-primary' />
                            <span className='text-xs text-gray-500 font-bold uppercase'>Đang tìm kiếm...</span>
                          </div>
                        ) : searchUsers.length === 0 ? (
                          <div className='p-8 text-center flex flex-col items-center gap-2'>
                            <HelpCircle className='h-10 w-10 text-gray-200' />
                            <p className='text-sm text-gray-500 font-bold uppercase'>Không tìm thấy</p>
                          </div>
                        ) : (
                          <div className='max-h-[300px] overflow-y-auto p-2'>
                            {searchUsers.map((user) => {
                              const selected = isUserSelected(user.username)
                              return (
                                <div
                                  key={user.userId}
                                  onClick={() => toggleUserSelection(user)}
                                  className={cn(
                                    'flex items-center justify-between p-3 cursor-pointer transition-all border border-transparent mb-1 rounded-xl',
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
                                      <span className='text-[11px] text-gray-500 font-medium'>{user.username}</span>
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

                  <div className='flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar max-h-[460px]'>
                    {members.length === 0 ? (
                      <div className='flex flex-col items-center justify-center h-full gap-4 opacity-30 py-20'>
                        <div className='h-16 w-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center'>
                          <Users className='h-8 w-8 text-gray-300' />
                        </div>
                        <p className='text-sm font-black uppercase text-gray-400 tracking-widest'>
                          Chưa có thành viên nào
                        </p>
                      </div>
                    ) : (
                      members.map((member, index) => {
                        // Find full name from detailData if available, or searchResult
                        const memberDetail = detailData?.data?.members?.find((m) => m.username === member.username)
                        const searchDetail = searchUsers.find((u) => u.username === member.username)
                        const fullName = memberDetail?.fullName || searchDetail?.fullName || member.username

                        return (
                          <MemberCard
                            key={member.username}
                            username={member.username}
                            fullName={fullName}
                            role={member.role}
                            availableRoles={[MemberRole.MEMBER, MemberRole.CO_LEADER, MemberRole.LEADER]}
                            onRoleChange={(value) => {
                              const newMembers = [...members]
                              newMembers[index] = { ...member, role: value }
                              form.setValue('members', newMembers)
                            }}
                            onRemove={() =>
                              form.setValue(
                                'members',
                                members.filter((m) => m.username !== member.username)
                              )
                            }
                          />
                        )
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='flex items-center justify-end gap-3 border-t border-gray-100 pt-6'>
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
              disabled={updateMutation.isPending}
              className='h-12 px-10'
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className='mr-2 h-5 w-5' />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default AdminUpdateResearchGroupPage
