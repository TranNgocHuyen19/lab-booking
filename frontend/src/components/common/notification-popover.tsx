import { useMemo, type KeyboardEvent, type MouseEvent } from 'react'
import { useNavigate } from 'react-router'
import {
  Bell,
  BellRing,
  CalendarClock,
  CheckCircle2,
  Clock,
  Info,
  Loader2,
  UserPlus,
  XCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { PATHS } from '@/constants/paths'
import { Role } from '@/constants/types'
import type { UserResponse } from '@/schemas/user.schema'
import type { NotificationResponse, NotificationType } from '@/schemas/notification.schema'
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
  useUnreadNotificationCountQuery
} from '@/queries/notification.queries'
import { useResolveParticipantConflictMutation } from '@/queries/booking.queries'
import { toast } from 'sonner'

type NotificationMetadata = {
  roomName?: string
  building?: string
  bookingDate?: string
  slots?: string[] | string
  slotName?: string
  startTime?: string
  endTime?: string
  bookingType?: string
  status?: string
  conflictingBookingRequestId?: number | null
}

const notificationIconMap: Record<NotificationType, typeof Info> = {
  BOOKING_CREATED: CalendarClock,
  BOOKING_APPROVED: CheckCircle2,
  BOOKING_REJECTED: XCircle,
  BOOKING_CANCELED: XCircle,
  BOOKING_CANCELLED_BY_THESIS: CalendarClock,
  PARTICIPANT_CONFLICT_REQUIRED: BellRing,
  PARTICIPANT_CONFLICT_RESOLVED: CheckCircle2,
  THESIS_PARTICIPANT_ADDED: UserPlus
}

const notificationToneMap: Record<NotificationType, string> = {
  BOOKING_CREATED: 'bg-blue-50 text-blue-700 border-blue-100',
  BOOKING_APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  BOOKING_REJECTED: 'bg-red-50 text-red-700 border-red-100',
  BOOKING_CANCELED: 'bg-gray-50 text-gray-600 border-gray-100',
  BOOKING_CANCELLED_BY_THESIS: 'bg-amber-50 text-amber-700 border-amber-100',
  PARTICIPANT_CONFLICT_REQUIRED: 'bg-orange-50 text-orange-700 border-orange-100',
  PARTICIPANT_CONFLICT_RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  THESIS_PARTICIPANT_ADDED: 'bg-indigo-50 text-indigo-700 border-indigo-100'
}

const notificationLabelMap: Record<NotificationType, string> = {
  BOOKING_CREATED: 'Tạo lịch',
  BOOKING_APPROVED: 'Đã duyệt',
  BOOKING_REJECTED: 'Từ chối',
  BOOKING_CANCELED: 'Đã hủy',
  BOOKING_CANCELLED_BY_THESIS: 'Ưu tiên luận văn',
  PARTICIPANT_CONFLICT_REQUIRED: 'Cần xử lý',
  PARTICIPANT_CONFLICT_RESOLVED: 'Đã xử lý',
  THESIS_PARTICIPANT_ADDED: 'Luận văn'
}

const parseMetadata = (metadata?: string | null): NotificationMetadata | null => {
  if (!metadata) return null
  try {
    return JSON.parse(metadata) as NotificationMetadata
  } catch {
    return null
  }
}

const formatDateTime = (value?: string | null) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const buildBookingLink = (user: UserResponse, bookingId: number) => {
  if (user.role === Role.ADMIN) {
    return PATHS.ADMIN.APPROVALS.BOOKING_DETAIL.replace(':id', String(bookingId))
  }

  if (user.role === Role.LECTURER || user.role === Role.LAB_MANAGER) {
    return PATHS.LECTURER.BOOKING_DETAIL.replace(':id', String(bookingId))
  }

  return PATHS.STUDENT.SCHEDULE
}

interface NotificationPopoverProps {
  user?: UserResponse | null
  className?: string
  buttonClassName?: string
}

export function NotificationPopover({ user, className, buttonClassName }: NotificationPopoverProps) {
  const navigate = useNavigate()
  const enabled = Boolean(user)
  const { data: notificationsPage, isLoading } = useNotificationsQuery({ page: 1, limit: 10 }, { enabled })
  const { data: unreadCount } = useUnreadNotificationCountQuery({ enabled })
  const markReadMutation = useMarkNotificationReadMutation()
  const markAllReadMutation = useMarkAllNotificationsReadMutation()
  const resolveConflictMutation = useResolveParticipantConflictMutation()

  const notifications = notificationsPage?.data ?? []
  const count = unreadCount?.unreadCount ?? 0
  const visibleCount = count > 99 ? '99+' : String(count)

  const hasUnread = useMemo(() => notifications.some((notification) => !notification.read), [notifications])

  if (!user) return null

  const markNotificationRead = async (notification: NotificationResponse) => {
    if (!notification.read) {
      await markReadMutation.mutateAsync(notification.notificationId)
    }
  }

  const handleNotificationClick = async (notification: NotificationResponse) => {
    await markNotificationRead(notification)

    if (notification.relatedBookingRequestId) {
      navigate(buildBookingLink(user, notification.relatedBookingRequestId))
    }
  }

  const handleNotificationKeyDown = (event: KeyboardEvent<HTMLDivElement>, notification: NotificationResponse) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }

    event.preventDefault()
    void handleNotificationClick(notification)
  }

  const handleResolveConflict = async (
    event: MouseEvent<HTMLButtonElement>,
    notification: NotificationResponse,
    action: 'KEEP_EXISTING_BOOKING' | 'SWITCH_TO_NEW_BOOKING',
    conflictingBookingRequestId?: number | null
  ) => {
    event.stopPropagation()

    if (!notification.relatedParticipantId) {
      toast.error('Không tìm thấy thành viên cần xử lý trùng lịch.')
      return
    }

    await resolveConflictMutation.mutateAsync({
      participantId: notification.relatedParticipantId,
      data: {
        action,
        conflictingBookingRequestId
      }
    })
    await markNotificationRead(notification)
    toast.success(action === 'SWITCH_TO_NEW_BOOKING' ? 'Đã chuyển sang booking nhóm' : 'Đã giữ lịch cũ')
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'relative flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition-all hover:bg-gray-200',
            buttonClassName
          )}
          aria-label='Thông báo'
        >
          <Bell className='h-5 w-5' />
          {count > 0 && (
            <span className='absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white'>
              {visibleCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align='end' className={cn('w-[min(96vw,500px)] p-0 overflow-hidden', className)}>
        <div className='flex items-center justify-between px-5 py-4'>
          <div>
            <h3 className='text-base font-bold text-gray-900'>Thông báo</h3>
            <p className='text-sm text-gray-500'>{count > 0 ? `${count} thông báo chưa đọc` : 'Không có thông báo mới'}</p>
          </div>
          <Button
            variant='ghost'
            size='sm'
            disabled={!hasUnread || markAllReadMutation.isPending}
            onClick={() => markAllReadMutation.mutate(undefined)}
            className='h-9 px-3 text-sm text-primary'
          >
            Đọc tất cả
          </Button>
        </div>

        <Separator />

        <ScrollArea className='h-[520px]'>
          {isLoading ? (
            <div className='flex h-40 items-center justify-center text-gray-500'>
              <Loader2 className='h-5 w-5 animate-spin' />
            </div>
          ) : notifications.length === 0 ? (
            <div className='flex h-40 flex-col items-center justify-center gap-2 px-6 text-center'>
              <Bell className='h-8 w-8 text-gray-300' />
              <p className='text-sm font-medium text-gray-700'>Chưa có thông báo</p>
              <p className='text-xs text-gray-500'>Các cập nhật đặt phòng sẽ xuất hiện tại đây.</p>
            </div>
          ) : (
            <div className='divide-y divide-gray-100'>
              {notifications.map((notification) => {
                const Icon = notificationIconMap[notification.type] ?? Info
                const metadata = parseMetadata(notification.metadata)
                const slots = metadata?.slotName || (Array.isArray(metadata?.slots) ? metadata?.slots.join(', ') : metadata?.slots)
                const canResolveConflict =
                  notification.type === 'PARTICIPANT_CONFLICT_REQUIRED' && Boolean(notification.relatedParticipantId)
                const isResolving = resolveConflictMutation.isPending

                return (
                  <div
                    key={notification.notificationId}
                    role='button'
                    tabIndex={0}
                    className={cn(
                      'w-full cursor-pointer px-5 py-4 text-left transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/30',
                      !notification.read && 'bg-blue-50/50'
                    )}
                    onClick={() => handleNotificationClick(notification)}
                    onKeyDown={(event) => handleNotificationKeyDown(event, notification)}
                  >
                    <div className='flex gap-4'>
                      <div
                        className={cn(
                          'mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border',
                          notificationToneMap[notification.type]
                        )}
                      >
                        <Icon className='h-5 w-5' />
                      </div>

                      <div className='min-w-0 flex-1'>
                        <div className='flex items-start justify-between gap-2'>
                          <p className='line-clamp-2 text-base font-semibold text-gray-900'>{notification.title}</p>
                          {!notification.read && <span className='mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600' />}
                        </div>
                        <p className='mt-1.5 line-clamp-3 text-sm leading-6 text-gray-600'>{notification.message}</p>

                        {(metadata?.roomName || metadata?.bookingDate || slots) && (
                          <div className='mt-3 flex flex-wrap gap-2'>
                            {metadata?.roomName && (
                              <Badge variant='outline' className='rounded-md px-2 py-0.5 text-xs font-medium'>
                                {metadata.roomName}
                              </Badge>
                            )}
                            {metadata?.bookingDate && (
                              <Badge variant='outline' className='rounded-md px-2 py-0.5 text-xs font-medium'>
                                {metadata.bookingDate}
                              </Badge>
                            )}
                            {slots && (
                              <Badge variant='outline' className='rounded-md px-2 py-0.5 text-xs font-medium'>
                                {slots}
                              </Badge>
                            )}
                          </div>
                        )}

                        {canResolveConflict && (
                          <div className='mt-3 grid grid-cols-2 gap-2'>
                            <Button
                              type='button'
                              variant='outline'
                              disabled={isResolving}
                              onClick={(event) =>
                                handleResolveConflict(
                                  event,
                                  notification,
                                  'KEEP_EXISTING_BOOKING',
                                  metadata?.conflictingBookingRequestId
                                )
                              }
                              className='h-9 rounded-lg border-amber-200 bg-white text-xs font-bold text-amber-700 hover:bg-amber-50 hover:text-amber-800'
                            >
                              Giữ lịch cũ
                            </Button>
                            <Button
                              type='button'
                              disabled={isResolving}
                              onClick={(event) =>
                                handleResolveConflict(
                                  event,
                                  notification,
                                  'SWITCH_TO_NEW_BOOKING',
                                  metadata?.conflictingBookingRequestId
                                )
                              }
                              className='h-9 rounded-lg bg-primary text-xs font-bold text-white hover:bg-primary/90'
                            >
                              Chuyển sang nhóm
                            </Button>
                          </div>
                        )}

                        <div className='mt-2 flex items-center justify-between gap-2'>
                          <span className='text-xs font-medium text-gray-400'>{formatDateTime(notification.createdAt)}</span>
                          <Badge variant='secondary-soft' className='rounded-md text-xs'>
                            {notificationLabelMap[notification.type]}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>

        <Separator />

        <div className='flex items-center justify-center gap-2 px-4 py-3 text-xs text-gray-500'>
          <Clock className='h-3.5 w-3.5' />
          Tự động cập nhật định kỳ
        </div>
      </PopoverContent>
    </Popover>
  )
}
