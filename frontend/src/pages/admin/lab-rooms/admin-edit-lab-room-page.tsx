import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft, Loader2, Info, MapPin, Smartphone, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { LabRoomRequestSchema, type LabRoomRequest } from '@/schemas/lab-room.schema'
import { useUpdateLabRoomMutation, useLabRoomByIdAdminQuery } from '@/queries/lab-room.queries'
import { PATHS } from '@/constants/paths'
import { handleErrorApi } from '@/utils/error-handler'
import { LocationPicker } from '@/components/admin/lab-rooms/location-picker'
import { useInfiniteFilterDevicesQuery } from '@/queries/device.queries'
import { InfiniteScrollSelect } from '@/components/common/infinite-scroll-select'

const AdminEditLabRoomPage = () => {
  const { id } = useParams()
  const labRoomId = Number(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: labRoomData, isLoading: isLabRoomLoading } = useLabRoomByIdAdminQuery(labRoomId)
  const updateMutation = useUpdateLabRoomMutation()

  const {
    data: devicesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isDevicesLoading
  } = useInfiniteFilterDevicesQuery({ active: true, limit: 20 })

  const availableDevices = (devicesData?.pages || []) as unknown as {
    deviceId: number
    deviceName: string
    deviceType: string
  }[]

  const form = useForm<LabRoomRequest>({
    resolver: zodResolver(LabRoomRequestSchema),
    defaultValues: {
      roomName: '',
      building: '',
      capacity: 30,
      longitude: 106.660172,
      latitude: 10.762622,
      devices: []
    }
  })

  // Watch values safely
  const latitude = useWatch({ control: form.control, name: 'latitude' })
  const longitude = useWatch({ control: form.control, name: 'longitude' })
  const watchedDevices = useWatch({ control: form.control, name: 'devices' })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'devices'
  })

  useEffect(() => {
    if (labRoomData) {
      form.reset({
        roomName: labRoomData.roomName,
        building: labRoomData.building || '',
        capacity: labRoomData.capacity,
        longitude: labRoomData.longitude || 106.687569,
        latitude: labRoomData.latitude || 10.822024,
        devices: labRoomData.devices.map((d) => ({ deviceId: d.device.deviceId, quantity: d.quantity }))
      })
    }
  }, [labRoomData, form])

  const onSubmit = async (data: LabRoomRequest) => {
    try {
      await updateMutation.mutateAsync({ id: labRoomId, data })
      toast.success('Cập nhật phòng thực hành thành công')
      queryClient.invalidateQueries({ queryKey: ['lab-rooms'] })
      navigate(PATHS.ADMIN.LAB_ROOMS)
    } catch (error) {
      handleErrorApi({ error, setError: form.setError })
    }
  }

  const handleLocationChange = (lat: number, lng: number) => {
    form.setValue('latitude', lat)
    form.setValue('longitude', lng)
  }

  if (isLabRoomLoading) {
    return (
      <div className='flex h-[50vh] items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    )
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
                Cập nhật phòng thực hành
              </h1>
              <p className='text-gray-500 font-medium'>
                Chỉnh sửa thông tin cho phòng: <span className='font-bold text-gray-700'>{labRoomData?.roomName}</span>
              </p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form className='space-y-8 pb-10'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
              <div className='space-y-8'>
                <div className='bg-white rounded-2xl shadow-xl border border-gray-100 animate-fade-in'>
                  <div className='p-6 border-b border-gray-100 bg-gray-50/30 flex items-center gap-3'>
                    <div className='h-10 w-10 bg-primary/10 flex items-center justify-center rounded-xl'>
                      <Info className='h-5 w-5 text-primary' />
                    </div>
                    <h3 className='text-lg font-black text-primary tracking-tight uppercase'>Thông tin chung</h3>
                  </div>

                  <div className='p-8 space-y-6'>
                    <FormField
                      control={form.control}
                      name='roomName'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-md font-semibold text-gray-700'>
                            Tên phòng <span className='text-red-500 font-bold'>*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder='VD: A1.01, H5.02...' className='h-12 border-gray-200' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className='grid grid-cols-2 gap-6'>
                      <FormField
                        control={form.control}
                        name='building'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='text-md font-semibold text-gray-700'>Tòa nhà</FormLabel>
                            <FormControl>
                              <Input
                                placeholder='VD: Tòa A'
                                className='h-12 border-gray-200'
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='capacity'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='text-md font-semibold text-gray-700'>Sức chứa</FormLabel>
                            <FormControl>
                              <Input
                                type='number'
                                placeholder='30'
                                className='h-12 border-gray-200'
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className='bg-white rounded-2xl shadow-xl border border-gray-100 animate-fade-in relative z-10'>
                  <div className='p-6 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='h-10 w-10 bg-primary/10 flex items-center justify-center rounded-xl'>
                        <Smartphone className='h-5 w-5 text-primary' />
                      </div>
                      <h3 className='text-lg font-black text-primary tracking-tight uppercase'>Thiết bị</h3>
                    </div>
                  </div>

                  <div className='p-8 space-y-4'>
                    {fields.length === 0 ? (
                      <div className='text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500 text-sm'>
                        Chưa có thiết bị nào được thêm vào phòng.
                      </div>
                    ) : (
                      <div className='space-y-3'>
                        {fields.map((field, index) => {
                          const otherSelectedIds = new Set(
                            watchedDevices
                              ?.filter((_, i) => i !== index)
                              .map((d) => d.deviceId)
                              .filter(Boolean)
                          )

                          const filteredDevices = availableDevices.filter(
                            (device) => !otherSelectedIds.has(device.deviceId)
                          )

                          return (
                            <div
                              key={field.id}
                              className='flex items-start gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100'
                            >
                              <FormField
                                control={form.control}
                                name={`devices.${index}.deviceId`}
                                render={({ field }) => (
                                  <FormItem className='flex-1'>
                                    <FormControl>
                                      <InfiniteScrollSelect
                                        value={field.value ? field.value.toString() : ''}
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        items={filteredDevices}
                                        hasMore={hasNextPage}
                                        isLoading={isDevicesLoading || isFetchingNextPage}
                                        onLoadMore={fetchNextPage}
                                        getItemValue={(item) => item.deviceId.toString()}
                                        getItemLabel={(item) => `${item.deviceName} (${item.deviceType})`}
                                        placeholder='Chọn thiết bị'
                                        className='bg-white h-10'
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`devices.${index}.quantity`}
                                render={({ field }) => (
                                  <FormItem className='w-24'>
                                    <FormControl>
                                      <Input
                                        type='number'
                                        min={1}
                                        placeholder='SL'
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                        className='h-10 bg-white border-gray-200'
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <Button
                                type='button'
                                variant='ghost'
                                size='icon'
                                onClick={() => remove(index)}
                                className='h-10 w-10 text-gray-400 hover:text-red-500 hover:bg-red-50'
                              >
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => append({ deviceId: 0, quantity: 1 })}
                      className='w-full h-12 border-dashed border-gray-300 text-gray-600 hover:text-primary hover:bg-primary/5 hover:border-primary mt-4'
                    >
                      <Plus className='mr-2 h-4 w-4' />
                      Thêm thiết bị
                    </Button>
                  </div>
                </div>
              </div>

              <div className='space-y-6 lg:col-span-1 h-fit sticky top-6'>
                <div className='bg-white rounded-2xl shadow-xl border border-gray-100 animate-fade-in h-full'>
                  <div className='p-6 border-b border-gray-100 bg-gray-50/30 flex items-center gap-3'>
                    <div className='h-10 w-10 bg-primary/10 flex items-center justify-center rounded-xl'>
                      <MapPin className='h-5 w-5 text-primary' />
                    </div>
                    <h3 className='text-lg font-black text-primary tracking-tight uppercase'>Vị trí trên bản đồ</h3>
                  </div>

                  <div className='flex flex-col'>
                    <div className='px-6 pt-6 pb-4'>
                      <p className='text-sm text-gray-500'>
                        Nhấn vào bản đồ để chọn vị trí chính xác của phòng thực hành.
                      </p>
                    </div>
                    <div className='flex-1 px-6'>
                      <LocationPicker
                        value={{
                          lat: latitude || 10.822024,
                          lng: longitude || 106.687569
                        }}
                        onChange={handleLocationChange}
                      />
                    </div>
                    <div className='grid grid-cols-2 gap-4 p-6 pt-4 border-t border-gray-100'>
                      <div className='bg-gray-50 p-3 rounded-lg border border-gray-100'>
                        <span className='text-xs text-gray-500 font-bold uppercase'>Kinh độ (Long)</span>
                        <p className='text-sm font-mono font-medium text-gray-900'>{longitude?.toFixed(6)}</p>
                      </div>
                      <div className='bg-gray-50 p-3 rounded-lg border border-gray-100'>
                        <span className='text-xs text-gray-500 font-bold uppercase'>Vĩ độ (Lat)</span>
                        <p className='text-sm font-mono font-medium text-gray-900'>{latitude?.toFixed(6)}</p>
                      </div>
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
                className='h-12 px-6 rounded-xl border-gray-200 hover:bg-gray-50 hover:text-gray-900'
              >
                Hủy
              </Button>
              <Button
                type='submit'
                onClick={form.handleSubmit(onSubmit)}
                disabled={updateMutation.isPending}
                className='h-12 px-6 rounded-xl font-semibold'
              >
                {updateMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default AdminEditLabRoomPage
