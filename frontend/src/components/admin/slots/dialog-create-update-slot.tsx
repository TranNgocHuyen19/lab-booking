import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { slotSchema, type SlotRequest, type SlotResponse, type SecureSlotResponse } from '@/schemas/slot.schema'
import { useCreateSlotMutation, useUpdateSlotMutation } from '@/queries/slot.queries'
import { handleErrorApi } from '@/utils/error-handler'
import { formatTimeForInput } from '@/utils/format'

interface DialogCreateUpdateSlotProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  slotToEdit?: SlotResponse | SecureSlotResponse | null
}

export function DialogCreateUpdateSlot({ open, onOpenChange, slotToEdit }: DialogCreateUpdateSlotProps) {
  const createMutation = useCreateSlotMutation()
  const updateMutation = useUpdateSlotMutation()

  const form = useForm<SlotRequest>({
    resolver: zodResolver(slotSchema),
    defaultValues: {
      slotName: '',
      startTime: '',
      endTime: '',
      description: ''
    }
  })

  useEffect(() => {
    if (open) {
      if (slotToEdit) {
        form.reset({
          slotName: slotToEdit.slotName,
          startTime: formatTimeForInput(slotToEdit.startTime),
          endTime: formatTimeForInput(slotToEdit.endTime),
          description: slotToEdit.description || '',
          active: 'active' in slotToEdit ? slotToEdit.active : true
        })
      } else {
        form.reset({
          slotName: '',
          startTime: '',
          endTime: '',
          description: '',
          active: true
        })
      }
    }
  }, [open, slotToEdit, form])

  const onSubmit = async (values: SlotRequest) => {
    try {
      if (slotToEdit) {
        await updateMutation.mutateAsync({ id: slotToEdit.slotId, data: values })
        toast.success('Cập nhật ca sử dụng thành công')
      } else {
        await createMutation.mutateAsync(values)
        toast.success('Thêm ca sử dụng thành công')
      }
      onOpenChange(false)
    } catch (error) {
      handleErrorApi({ error, setError: form.setError })
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[550px] p-0 overflow-hidden rounded-xl border-none shadow-2xl'>
        <DialogHeader className='p-8 pb-4 bg-gray-50/50'>
          <DialogTitle className='text-2xl font-black uppercase text-primary tracking-tight'>
            {slotToEdit ? 'Cập nhật ca sử dụng' : 'Thêm ca sử dụng'}
          </DialogTitle>
          <DialogDescription className='text-sm font-medium'>
            {slotToEdit
              ? 'Chỉnh sửa thông tin ca sử dụng. Nhấn lưu để cập nhật.'
              : 'Thêm mới một ca sử dụng vào hệ thống.'}
          </DialogDescription>
        </DialogHeader>

        <div className='p-8 pt-4'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <FormField
                control={form.control}
                name='slotName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-gray-700 font-semibold'>Tên ca</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='VD: Ca 1, Ca Sáng...'
                        {...field}
                        className='h-12 border-gray-200 rounded-xl'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='startTime'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-gray-700 font-semibold'>Giờ bắt đầu</FormLabel>
                      <FormControl>
                        <Input type='time' {...field} className='h-12 border-gray-200 rounded-xl' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='endTime'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-gray-700 font-semibold'>Giờ kết thúc</FormLabel>
                      <FormControl>
                        <Input type='time' {...field} className='h-12 border-gray-200 rounded-xl' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-gray-700 font-semibold'>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Mô tả chi tiết về ca sử dụng...'
                        className='resize-none border-gray-200 rounded-xl min-h-[100px]'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {slotToEdit && (
                <FormField
                  control={form.control}
                  name='active'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-gray-200 p-4'>
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className='space-y-1 leading-none'>
                        <FormLabel className='font-semibold text-gray-700'>Hoạt động</FormLabel>
                        <p className='text-sm text-gray-500'>Trạng thái hoạt động của ca sử dụng.</p>
                      </div>
                    </FormItem>
                  )}
                />
              )}

              <DialogFooter className='pt-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => onOpenChange(false)}
                  className='h-12 px-6 rounded-xl border-gray-200 hover:bg-gray-50 hover:text-gray-900'
                >
                  Hủy
                </Button>
                <Button type='submit' disabled={isLoading} className='h-12 px-6 rounded-xl font-semibold'>
                  {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                  {slotToEdit ? 'Lưu thay đổi' : 'Thêm mới'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
