import { useState, useEffect } from 'react'
import { useForm, type UseFormReturn, type Path } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Loader2 } from 'lucide-react'
import {
  UpdateAttendanceSystemConfigRequestSchema,
  UpdateBookingSystemConfigRequestSchema,
  type UpdateAttendanceSystemConfigRequest,
  type UpdateBookingSystemConfigRequest,
  type AttendanceSystemConfigResponse,
  type BookingSystemConfigResponse
} from '@/schemas/system-config.schema'
import {
  useUpdateAttendanceConfigMutation,
  useUpdateBookingConfigMutation,
  useUpdateAttendanceFieldMutation,
  useUpdateBookingFieldMutation
} from '@/queries/system-config.queries'
import { handleErrorApi } from '@/utils/error-handler'
import { cn } from '@/lib/utils'

const FIELD_TO_KEY_MAP: Record<string, string> = {
  // Attendance
  earlyCheckinMinutes: 'ATTENDANCE-EARLY-CHECKIN-MINUTES',
  lateCheckinMinutes: 'ATTENDANCE-LATE-CHECKIN-MINUTES',
  earlyCheckoutMinutes: 'ATTENDANCE-EARLY-CHECKOUT-MINUTES',
  lateCheckoutMinutes: 'ATTENDANCE-LATE-CHECKOUT-MINUTES',
  labRadiusMeters: 'ATTENDANCE-LAB-RADIUS-METERS',
  // Booking
  studentAdvanceDays: 'BOOKING-ADVANCE-DAYS-STUDENT',
  lecturerAdvanceDays: 'BOOKING-ADVANCE-DAYS-LECTURER',
  adminAdvanceDays: 'BOOKING-ADVANCE-DAYS-ADMIN',
  minMinutesBeforeStartToCancel: 'BOOKING-MIN-MINUTES-CANCEL',
  minMinutesBeforeStartToApprove: 'BOOKING-MIN-MINUTES-APPROVE',
  studentMinMinutesToBook: 'BOOKING-MIN-MINUTES-CREATE-STUDENT',
  lecturerMinMinutesToBook: 'BOOKING-MIN-MINUTES-CREATE-LECTURER'
}

interface DialogUpdateSystemConfigProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: 'attendance' | 'booking'
  initialData: AttendanceSystemConfigResponse | BookingSystemConfigResponse | undefined
  field?: string // If present, only edit this specific field
  fieldLabel?: string
}

export function DialogUpdateSystemConfig({
  open,
  onOpenChange,
  type,
  initialData,
  field,
  fieldLabel
}: DialogUpdateSystemConfigProps) {
  const [reason, setReason] = useState('')

  const updateAttendanceMutation = useUpdateAttendanceConfigMutation()
  const updateBookingMutation = useUpdateBookingConfigMutation()
  const updateAttendanceFieldMutation = useUpdateAttendanceFieldMutation()
  const updateBookingFieldMutation = useUpdateBookingFieldMutation()

  const isAttendance = type === 'attendance'
  const isPending =
    updateAttendanceMutation.isPending ||
    updateBookingMutation.isPending ||
    updateAttendanceFieldMutation.isPending ||
    updateBookingFieldMutation.isPending

  const attendanceForm = useForm<UpdateAttendanceSystemConfigRequest>({
    resolver: zodResolver(UpdateAttendanceSystemConfigRequestSchema),
    defaultValues: {
      earlyCheckinMinutes: 0,
      lateCheckinMinutes: 0,
      earlyCheckoutMinutes: 0,
      lateCheckoutMinutes: 0,
      labRadiusMeters: 0
    }
  })

  const bookingForm = useForm<UpdateBookingSystemConfigRequest>({
    resolver: zodResolver(UpdateBookingSystemConfigRequestSchema),
    defaultValues: {
      studentAdvanceDays: 0,
      lecturerAdvanceDays: 0,
      adminAdvanceDays: 0,
      minMinutesBeforeStartToCancel: 0,
      minMinutesBeforeStartToApprove: 0,
      studentMinMinutesToBook: 0,
      lecturerMinMinutesToBook: 0
    }
  })

  useEffect(() => {
    if (open && initialData) {
      if (isAttendance) {
        const data = initialData as AttendanceSystemConfigResponse
        attendanceForm.reset({
          earlyCheckinMinutes: data.earlyCheckinMinutes,
          lateCheckinMinutes: data.lateCheckinMinutes,
          earlyCheckoutMinutes: data.earlyCheckoutMinutes,
          lateCheckoutMinutes: data.lateCheckoutMinutes,
          labRadiusMeters: data.labRadiusMeters
        })
      } else {
        const data = initialData as BookingSystemConfigResponse
        bookingForm.reset({
          studentAdvanceDays: data.studentAdvanceDays,
          lecturerAdvanceDays: data.lecturerAdvanceDays,
          adminAdvanceDays: data.adminAdvanceDays,
          minMinutesBeforeStartToCancel: data.minMinutesBeforeStartToCancel,
          minMinutesBeforeStartToApprove: data.minMinutesBeforeStartToApprove,
          studentMinMinutesToBook: data.studentMinMinutesToBook,
          lecturerMinMinutesToBook: data.lecturerMinMinutesToBook
        })
      }
    }
  }, [open, initialData, isAttendance, attendanceForm, bookingForm])

  const handleSave = async (data: UpdateAttendanceSystemConfigRequest | UpdateBookingSystemConfigRequest) => {
    try {
      if (field) {
        let value: number
        if (isAttendance) {
          value = (data as UpdateAttendanceSystemConfigRequest)[
            field as keyof UpdateAttendanceSystemConfigRequest
          ] as number
        } else {
          value = (data as UpdateBookingSystemConfigRequest)[field as keyof UpdateBookingSystemConfigRequest] as number
        }
        const key = FIELD_TO_KEY_MAP[field]

        if (!key) throw new Error('Invalid field key mapping')

        if (isAttendance) {
          await updateAttendanceFieldMutation.mutateAsync({ key, value, reason })
        } else {
          await updateBookingFieldMutation.mutateAsync({ key, value, reason })
        }
        toast.success(`Cập nhật ${fieldLabel} thành công`)
      } else {
        if (isAttendance) {
          await updateAttendanceMutation.mutateAsync({
            ...data,
            reason: reason || undefined
          } as UpdateAttendanceSystemConfigRequest)
          toast.success('Cập nhật cấu hình điểm danh thành công')
        } else {
          await updateBookingMutation.mutateAsync({
            ...data,
            reason: reason || undefined
          } as UpdateBookingSystemConfigRequest)
          toast.success('Cập nhật cấu hình đặt phòng thành công')
        }
      }
      onOpenChange(false)
      setReason('')
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  const renderFormField = <T extends UpdateAttendanceSystemConfigRequest | UpdateBookingSystemConfigRequest>(
    form: UseFormReturn<T>,
    name: keyof T & string,
    label: string,
    unit: string,
    description?: string
  ) => {
    if (field && field !== name) return null
    return (
      <FormField
        control={form.control}
        name={name as Path<T>}
        render={({ field: formField }) => (
          <FormItem className={cn(field ? 'col-span-1' : 'col-span-1')}>
            <FormLabel className='text-gray-700 font-semibold'>
              {label} ({unit})
            </FormLabel>
            <FormControl>
              <Input
                type='number'
                {...formField}
                value={formField.value as number}
                onChange={(e) => formField.onChange(e.target.valueAsNumber)}
                className='h-12 border-gray-200 rounded-xl focus:ring-primary/20'
              />
            </FormControl>
            {description && (
              <div className='bg-blue-50/50 p-2.5 rounded-lg border border-blue-100/50 mt-2 hover:bg-blue-50 transition-colors'>
                <p className='text-[11px] text-blue-700 font-bold leading-relaxed flex gap-1.5'>
                  <span className='shrink-0 bg-blue-100 px-1 rounded text-[9px] uppercase tracking-wider h-fit mt-0.5'>
                    Lưu ý
                  </span>
                  {description}
                </p>
                {name === 'minMinutesBeforeStartToApprove' && (
                  <p className='text-[10px] text-primary font-black mt-1 uppercase tracking-tight'>
                    👉 Hiện tại:{' '}
                    {(formField.value as number) >= 0
                      ? `Yêu cầu duyệt TRƯỚC ${formField.value} phút`
                      : `Cho phép duyệt SAU ${Math.abs(formField.value as number)} phút`}
                  </p>
                )}
                {(name === 'studentMinMinutesToBook' || name === 'lecturerMinMinutesToBook') && (
                  <p className='text-[10px] text-primary font-black mt-1 uppercase tracking-tight'>
                    👉 Hiện tại:{' '}
                    {(formField.value as number) >= 0
                      ? `Yêu cầu đặt TRƯỚC ${formField.value} phút`
                      : `Cho phép đặt SAU ${Math.abs(formField.value as number)} phút`}
                  </p>
                )}
              </div>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[1000px] p-0 overflow-hidden rounded-xl border-none shadow-2xl'>
        <DialogHeader className='p-8 pb-4 bg-gray-50/50'>
          <DialogTitle className='text-2xl font-black uppercase text-primary tracking-tight'>
            {field ? `Cập nhật ${fieldLabel}` : `Cập nhật cấu hình ${isAttendance ? 'điểm danh' : 'đặt phòng'}`}
          </DialogTitle>
          <DialogDescription className='text-sm font-medium'>
            {field
              ? `Chỉnh sửa giá trị ${fieldLabel}. Nhấn xác nhận để cập nhật.`
              : `Chỉnh sửa cấu hình ${isAttendance ? 'điểm danh' : 'đặt phòng'}. Nhấn xác nhận để cập nhật.`}
          </DialogDescription>
        </DialogHeader>

        <div className='p-8 pt-4'>
          <Form {...(isAttendance ? attendanceForm : bookingForm)}>
            <form
              onSubmit={isAttendance ? attendanceForm.handleSubmit(handleSave) : bookingForm.handleSubmit(handleSave)}
              className='space-y-6'
            >
              <div className={cn('grid gap-x-6 gap-y-6', field ? 'grid-cols-1' : 'grid-cols-2')}>
                {isAttendance ? (
                  <>
                    {renderFormField(attendanceForm, 'earlyCheckinMinutes', 'Thời gian cho phép check-in sớm', 'phút')}
                    {renderFormField(
                      attendanceForm,
                      'lateCheckinMinutes',
                      'Thời gian tối đa cho phép check-in muộn',
                      'phút'
                    )}
                    {renderFormField(
                      attendanceForm,
                      'earlyCheckoutMinutes',
                      'Thời gian tối thiểu để checkout sớm',
                      'phút'
                    )}
                    {renderFormField(
                      attendanceForm,
                      'lateCheckoutMinutes',
                      'Thời gian tối đa để checkout muộn',
                      'phút'
                    )}
                    <div className={cn(!field && 'col-span-2')}>
                      {renderFormField(attendanceForm, 'labRadiusMeters', 'Bán kính check-in cho phép', 'mét')}
                    </div>
                  </>
                ) : (
                  <>
                    {renderFormField(bookingForm, 'studentAdvanceDays', 'Số ngày được đặt trước (Sinh viên)', 'ngày')}
                    {renderFormField(bookingForm, 'lecturerAdvanceDays', 'Số ngày được đặt trước (Giảng viên)', 'ngày')}
                    {renderFormField(bookingForm, 'adminAdvanceDays', 'Số ngày được đặt trước (Quản trị viên)', 'ngày')}
                    {renderFormField(
                      bookingForm,
                      'minMinutesBeforeStartToCancel',
                      'Hạn chót cho phép sinh viên hủy đơn',
                      'phút',
                      'Số phút trước khi bắt đầu Slot mà sinh viên vẫn có thể hủy đơn.'
                    )}
                    {renderFormField(
                      bookingForm,
                      'minMinutesBeforeStartToApprove',
                      'Hạn chót phê duyệt đơn đặt phòng',
                      'phút',
                      'Dương (+): Duyệt trước giờ bắt đầu. Âm (-): Được phép duyệt sau giờ bắt đầu.'
                    )}
                    {renderFormField(
                      bookingForm,
                      'studentMinMinutesToBook',
                      'Hạn chót để sinh viên tạo đơn đặt',
                      'phút',
                      'Dương (+): Đặt trước giờ bắt đầu. Âm (-): Cho phép đặt sau khi đã bắt đầu.'
                    )}
                    {renderFormField(
                      bookingForm,
                      'lecturerMinMinutesToBook',
                      'Hạn chót để giảng viên tạo đơn đặt',
                      'phút',
                      'Dương (+): Đặt trước giờ bắt đầu. Âm (-): Cho phép đặt sau khi đã bắt đầu.'
                    )}
                  </>
                )}
              </div>

              <div className='space-y-2'>
                <Label className='text-gray-700 font-semibold'>Lý do thay đổi</Label>
                <Textarea
                  placeholder='Nhập lý do thay đổi để lưu vào lịch sử...'
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className='border-gray-200 rounded-xl font-medium focus:ring-primary focus:border-primary resize-none'
                />
              </div>

              <DialogFooter className='pt-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => onOpenChange(false)}
                  className='h-12 px-6 rounded-xl border-gray-200 hover:bg-gray-50 hover:text-gray-900'
                >
                  Hủy
                </Button>
                <Button type='submit' disabled={isPending} className='h-12 px-6 rounded-xl font-semibold'>
                  {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                  Xác nhận thay đổi
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
