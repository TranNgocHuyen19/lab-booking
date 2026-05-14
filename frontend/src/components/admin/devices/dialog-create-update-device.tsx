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
import {
  DeviceRequestSchema,
  type DeviceRequest,
  type DeviceResponse,
  type SecuredDeviceResponse
} from '@/schemas/device.schema'
import { useCreateDeviceMutation, useUpdateDeviceMutation } from '@/queries/device.queries'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { deviceIconMap, allDeviceIcons, deviceIconLabels, type DeviceIconName } from '@/utils/icon'
import { handleErrorApi } from '@/utils/error-handler'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

interface DialogCreateUpdateDeviceProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deviceToEdit?: DeviceResponse | SecuredDeviceResponse | null
}

export function DialogCreateUpdateDevice({ open, onOpenChange, deviceToEdit }: DialogCreateUpdateDeviceProps) {
  const createMutation = useCreateDeviceMutation()
  const updateMutation = useUpdateDeviceMutation()

  const form = useForm<DeviceRequest>({
    resolver: zodResolver(DeviceRequestSchema),
    defaultValues: {
      deviceName: '',
      deviceType: '',
      icon: '',
      active: true
    }
  })

  useEffect(() => {
    if (open) {
      if (deviceToEdit) {
        form.reset({
          deviceName: deviceToEdit.deviceName,
          deviceType: deviceToEdit.deviceType,
          icon: deviceToEdit.icon || 'default',
          active: 'active' in deviceToEdit ? deviceToEdit.active : true
        })
      } else {
        form.reset({
          deviceName: '',
          deviceType: '',
          icon: 'default',
          active: true
        })
      }
    }
  }, [open, deviceToEdit, form])

  const onSubmit = async (values: DeviceRequest) => {
    try {
      if (deviceToEdit) {
        await updateMutation.mutateAsync({ id: deviceToEdit.deviceId, data: values })
        toast.success('Cập nhật thiết bị thành công')
      } else {
        await createMutation.mutateAsync(values)
        toast.success('Thêm thiết bị thành công')
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
            {deviceToEdit ? 'Cập nhật thiết bị' : 'Thêm thiết bị'}
          </DialogTitle>
          <DialogDescription className='text-sm font-medium'>
            {deviceToEdit
              ? 'Chỉnh sửa thông tin thiết bị. Nhấn lưu để cập nhật.'
              : 'Thêm mới một thiết bị vào hệ thống.'}
          </DialogDescription>
        </DialogHeader>

        <div className='p-8 pt-4'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <FormField
                control={form.control}
                name='deviceName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-gray-700 font-semibold'>Tên thiết bị</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='VD: Máy chiếu, Micro...'
                        {...field}
                        className='h-12 border-gray-200 rounded-xl'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='deviceType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-gray-700 font-semibold'>Loại thiết bị</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='VD: DISPLAY, AUDIO...'
                        {...field}
                        className='h-12 border-gray-200 rounded-xl'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='icon'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-gray-700 font-semibold'>Icon</FormLabel>
                    <FormControl>
                      <TooltipProvider>
                        <div className='grid grid-cols-8 gap-2'>
                          {allDeviceIcons.map((iconName) => {
                            const IconComponent = deviceIconMap[iconName as DeviceIconName]
                            const isSelected = (field.value || 'default') === iconName
                            return (
                              <Tooltip key={iconName}>
                                <TooltipTrigger asChild>
                                  <div
                                    onClick={() => field.onChange(iconName)}
                                    className={cn(
                                      'flex items-center justify-center p-2 rounded-xl border-2 cursor-pointer transition-all hover:bg-gray-50 aspect-square',
                                      isSelected
                                        ? 'border-primary bg-primary/5 text-primary'
                                        : 'border-transparent bg-gray-50/50 border-gray-200 text-gray-500'
                                    )}
                                  >
                                    <IconComponent className='h-6 w-6' />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{deviceIconLabels[iconName as DeviceIconName]}</p>
                                </TooltipContent>
                              </Tooltip>
                            )
                          })}
                        </div>
                      </TooltipProvider>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {deviceToEdit && (
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
                        <p className='text-sm text-gray-500'>Trạng thái hoạt động của thiết bị.</p>
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
                  {deviceToEdit ? 'Lưu thay đổi' : 'Thêm mới'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
