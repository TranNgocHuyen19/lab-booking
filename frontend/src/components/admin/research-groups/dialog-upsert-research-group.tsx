import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  createResearchGroupSchema,
  type CreateResearchGroupRequest,
  type SecureResearchGroupResponse
} from '@/schemas/research-group.schema'
import { useCreateResearchGroupMutation, useUpdateResearchGroupMutation } from '@/queries/research-group.queries'
import { useAdminFilterUsersQuery } from '@/queries/user.queries'
import { GroupType, GroupTypeLabel } from '@/constants/types'
import { handleErrorApi } from '@/utils/error-handler'
import { useAuth } from '@/hooks/use-auth'
import { InfiniteScrollSelect } from '@/components/common/infinite-scroll-select'

interface DialogUpsertResearchGroupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group?: SecureResearchGroupResponse
  onSuccess?: () => void
}

export const DialogUpsertResearchGroup = ({ open, onOpenChange, group, onSuccess }: DialogUpsertResearchGroupProps) => {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const createMutation = useCreateResearchGroupMutation()
  const updateMutation = useUpdateResearchGroupMutation()
  const isEdit = !!group

  const [advisorSearch, setAdvisorSearch] = useState('')
  const { data: usersData, isLoading: isLoadingUsers } = useAdminFilterUsersQuery({
    page: 0,
    size: 20,
    keyword: advisorSearch,
    role: 'LECTURER'
  })
  const lecturers = usersData?.data?.data ?? []

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

  useEffect(() => {
    if (group && open) {
      form.reset({
        groupName: group.groupName,
        description: group.description || '',
        projectName: group.projectName || '',
        groupType: group.groupType,
        isPrivate: group.isPrivate,
        advisorId: group.leaderId ?? undefined
      })
    } else if (!open) {
      form.reset()
    }
  }, [group, open, form])

  const onSubmit = async (data: CreateResearchGroupRequest) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: group!.researchGroupId, data })
        toast.success('Cập nhật nhóm nghiên cứu thành công')
      } else {
        await createMutation.mutateAsync(data)
        toast.success('Thêm nhóm nghiên cứu thành công')
      }
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      handleErrorApi({ error, setError: form.setError })
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='rounded-xl sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-black text-primary uppercase'>
            {isEdit ? 'Chỉnh sửa nhóm nghiên cứu' : 'Thêm nhóm nghiên cứu mới'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Cập nhật lại thông tin cho nhóm nghiên cứu.'
              : 'Điền thông tin để bắt đầu xây dựng nhóm nghiên cứu mới.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='groupName'
                render={({ field }) => (
                  <FormItem className='md:col-span-2'>
                    <FormLabel className='font-bold text-gray-700'>Tên nhóm *</FormLabel>
                    <FormControl>
                      <Input placeholder='Ví dụ: Nhóm Nghiên cứu AI' className='h-11' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isAdmin && !isEdit && (
                <FormField
                  control={form.control}
                  name='advisorId'
                  render={({ field }) => (
                    <FormItem className='md:col-span-2'>
                      <FormLabel className='font-bold text-gray-700'>Giảng viên hướng dẫn *</FormLabel>
                      <FormControl>
                        <InfiniteScrollSelect
                          placeholder='Chọn giảng viên...'
                          items={lecturers}
                          getItemValue={(u) => String(u.userId)}
                          getItemLabel={(u) => `${u.fullName} (${u.username})`}
                          value={field.value ? String(field.value) : undefined}
                          onValueChange={(val) => field.onChange(val ? Number(val) : undefined)}
                          onSearchChange={setAdvisorSearch}
                          isLoading={isLoadingUsers}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name='groupType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='font-bold text-gray-700'>Loại nhóm *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className='h-11'>
                          <SelectValue placeholder='Chọn loại nhóm' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(GroupType).map(([key, value]) => (
                          <SelectItem key={key} value={value}>
                            {GroupTypeLabel[value as keyof typeof GroupTypeLabel]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='projectName'
                render={({ field }) => (
                  <FormItem className='md:col-span-1'>
                    <FormLabel className='font-bold text-gray-700'>Tên đề tài</FormLabel>
                    <FormControl>
                      <Input placeholder='Ví dụ: Hệ thống thông minh...' className='h-11' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem className='md:col-span-2'>
                    <FormLabel className='font-bold text-gray-700'>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea placeholder='Mục tiêu nghiên cứu...' className='min-h-[100px]' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='isPrivate'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4 md:col-span-2'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-base font-bold'>Chế độ riêng tư</FormLabel>
                      <DialogDescription>Nhóm sẽ ẩn khỏi tìm kiếm công khai.</DialogDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className='flex justify-end gap-3 pt-4 border-t'>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)} className='h-11 px-6'>
                Hủy
              </Button>
              <Button type='submit' variant='primary' disabled={isPending} className='h-11 px-8'>
                {isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Save className='mr-2 h-4 w-4' />}
                {isEdit ? 'Lưu thay đổi' : 'Tạo nhóm'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
