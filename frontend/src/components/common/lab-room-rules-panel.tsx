import { CalendarClock, Clock, Loader2, MapPin, ShieldCheck } from 'lucide-react'
import { useAttendanceConfigQuery, useBookingConfigQuery } from '@/queries/system-config.queries'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import React from 'react'

const formatMinuteRule = (value: number | undefined, action: string) => {
  if (value === undefined) return 'Chưa cấu hình'
  if (value >= 0) return `${action} trước giờ bắt đầu ít nhất ${value} phút`
  return `${action} sau giờ bắt đầu tối đa ${Math.abs(value)} phút`
}

const formatUnit = (value: number | undefined, unit: string) => {
  if (value === undefined) return 'Chưa cấu hình'
  return `${value} ${unit}`
}

const formatCancelRule = (value: number | undefined) => {
  if (value === undefined) return 'Chưa cấu hình'
  return `Hủy trước giờ bắt đầu ít nhất ${value} phút`
}

const highlightNumbers = (text: string) => {
  const parts = text.split(/(-?\d+)/g)
  return (
    <>
      {parts.map((part, index) => {
        if (/^-?\d+$/.test(part)) {
          return (
            <span key={index} className='text-2xl font-black tabular-nums text-primary'>
              {part}
            </span>
          )
        }
        return <span key={index}>{part}</span>
      })}
    </>
  )
}

const RuleItem = ({
  label,
  value,
  helper
}: {
  label: string
  value: React.ReactNode
  helper?: string
}) => (
  <div className='rounded-lg border bg-card p-5 shadow-sm'>
    <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>{label}</p>
    <p className='mt-2 text-lg font-bold leading-tight text-foreground'>{value}</p>
    {helper && <p className='mt-2 text-sm leading-relaxed text-muted-foreground'>{helper}</p>}
  </div>
)

const SectionHeader = ({
  icon: Icon,
  title,
  description
}: {
  icon: typeof ShieldCheck
  title: string
  description: string
}) => (
  <div className='flex items-start gap-3 border-b border-primary/10 pb-4'>
    <div className='rounded-md bg-primary/10 p-2 text-primary'>
      <Icon className='h-5 w-5' />
    </div>
    <div>
      <h3 className='text-xl font-black uppercase tracking-tight text-primary'>{title}</h3>
      <p className='mt-1 text-sm font-medium text-gray-500'>{description}</p>
    </div>
  </div>
)

export const LabRoomRulesPanel = () => {
  const { data: bookingConfig, isLoading: isLoadingBooking } = useBookingConfigQuery()
  const { data: attendanceConfig, isLoading: isLoadingAttendance } = useAttendanceConfigQuery()
  const isLoading = isLoadingBooking || isLoadingAttendance

  if (isLoading) {
    return (
      <div className='rounded-xl border bg-card p-12 text-center shadow-sm'>
        <Loader2 className='mx-auto h-10 w-10 animate-spin text-primary' />
        <p className='mt-4 text-sm font-semibold text-muted-foreground'>Đang tải quy định phòng Lab...</p>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader className='border-b'>
          <SectionHeader
            icon={CalendarClock}
            title='Quy định đặt phòng'
            description='Các mốc thời gian hệ thống dùng để kiểm tra khi tạo, hủy và duyệt yêu cầu đặt phòng.'
          />
        </CardHeader>

        <CardContent className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-3'>
          <RuleItem
            label='Sinh viên được đặt trước'
            value={highlightNumbers(formatUnit(bookingConfig?.studentAdvanceDays, 'ngày'))}
            helper='Khoảng thời gian xa nhất sinh viên có thể tạo lịch đặt phòng.'
          />
          <RuleItem
            label='Giảng viên được đặt trước'
            value={highlightNumbers(formatUnit(bookingConfig?.lecturerAdvanceDays, 'ngày'))}
            helper='Áp dụng cho lịch báo cáo, seminar, thesis và các buổi học thuật.'
          />
          <RuleItem
            label='Quản trị viên được đặt trước'
            value={highlightNumbers(formatUnit(bookingConfig?.adminAdvanceDays, 'ngày'))}
            helper='Giới hạn cao nhất khi quản trị viên hỗ trợ tạo hoặc điều phối lịch.'
          />
          </div>

          <div className='grid gap-4 md:grid-cols-2'>
          <RuleItem
            label='Hạn tạo booking của sinh viên'
            value={highlightNumbers(formatMinuteRule(bookingConfig?.studentMinMinutesToBook, 'Tạo booking'))}
          />
          <RuleItem
            label='Hạn tạo booking của giảng viên'
            value={highlightNumbers(formatMinuteRule(bookingConfig?.lecturerMinMinutesToBook, 'Tạo booking'))}
          />
          <RuleItem
            label='Hạn hủy booking'
            value={highlightNumbers(formatCancelRule(bookingConfig?.minMinutesBeforeStartToCancel))}
          />
          <RuleItem
            label='Hạn duyệt booking'
            value={highlightNumbers(formatMinuteRule(bookingConfig?.minMinutesBeforeStartToApprove, 'Duyệt booking'))}
          />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='border-b'>
          <SectionHeader
            icon={Clock}
            title='Quy định điểm danh'
            description='Các mốc này được dùng khi check-in, check-out và xác định vị trí hợp lệ trong phòng Lab.'
          />
        </CardHeader>

        <CardContent>
          <div className='grid gap-4 md:grid-cols-3'>
          <RuleItem
            label='Check-in sớm'
            value={highlightNumbers(formatUnit(attendanceConfig?.earlyCheckinMinutes, 'phút'))}
            helper='Được phép check-in trước giờ bắt đầu trong khoảng thời gian này.'
          />
          <RuleItem
            label='Check-in muộn'
            value={highlightNumbers(formatUnit(attendanceConfig?.lateCheckinMinutes, 'phút'))}
            helper='Quá mốc này hệ thống có thể ghi nhận là đi trễ hoặc không hợp lệ.'
          />
          <RuleItem
            label='Bán kính điểm danh'
            value={highlightNumbers(formatUnit(attendanceConfig?.labRadiusMeters, 'mét'))}
            helper='Khoảng cách tối đa so với vị trí phòng Lab để được phép điểm danh.'
          />
          <RuleItem
            label='Checkout sớm'
            value={highlightNumbers(formatUnit(attendanceConfig?.earlyCheckoutMinutes, 'phút'))}
          />
          <RuleItem
            label='Checkout muộn'
            value={highlightNumbers(formatUnit(attendanceConfig?.lateCheckoutMinutes, 'phút'))}
          />
          <div className='rounded-lg border bg-primary/5 p-5 text-foreground'>
            <div className='flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary'>
              <MapPin className='h-4 w-4' />
              Lưu ý vị trí
            </div>
            <p className='mt-2 text-sm leading-relaxed text-muted-foreground'>
              Khi điểm danh, hãy bật định vị và đứng trong phạm vi phòng Lab để hệ thống xác nhận chính xác.
            </p>
          </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
