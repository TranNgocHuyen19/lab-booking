import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  LogIn,
  LogOut,
  MapPin,
  Calendar,
  FileText,
  AlertCircle,
  Loader2,
  Search as SearchIcon,
  ChevronDown,
  Clock,
  User as UserIcon,
  UserCog,
  Pencil,
  Trash2,
  Check,
  XCircle,
  Cpu,
  Info,
  CheckCircle2,
  Users,
  ShieldCheck
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { ParticipantRoleLabels, RequestStatusLabels } from '@/constants/types'
import { deviceIconMap } from '@/utils/icon'
import { useGeolocation } from '@/hooks/use-geolocation'
import attendanceService from '@/services/attendance.service'
import { handleErrorApi } from '@/utils/error-handler'
import {
  useApproveBookingMutation,
  useRejectBookingMutation,
  useCancelBookingMutation,
  useAddParticipantsMutation,
  useBookingParticipantsBasicQuery
} from '@/queries/booking.queries'
import { useAttendanceStatusQuery, useBookingAttendanceQuery } from '@/queries/attendance.queries'
import { DialogAddAuditingParticipant } from '@/components/lecturer/booking/dialog-add-auditing-participant'
import { Link } from 'react-router-dom'
import { PATHS } from '@/constants/paths'
import type {
  BookingResponse,
  SecureBookingResponse,
  BookingDeviceResponse,
  BookingParticipantResponse
} from '@/schemas/booking.schema'
import { formatDuration, formatFullDateTime, formatDateFull, formatFullDateTimeCompact } from '@/utils/format'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

interface Props {
  booking: (BookingResponse | SecureBookingResponse) | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate?: (booking: BookingResponse | SecureBookingResponse) => void
  onCancel?: () => void
  isLecturerView?: boolean
}

export const DialogBookingDetail = ({
  booking: initialBooking,
  open,
  onOpenChange,
  onUpdate,
  onCancel,
  isLecturerView = false
}: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [localBooking, setLocalBooking] = useState<(BookingResponse | SecureBookingResponse) | null>(null)
  const [page, setPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [showNoteDialog, setShowNoteDialog] = useState(false)
  const [checkType, setCheckType] = useState<'IN' | 'OUT'>('IN')
  const [noteInput, setNoteInput] = useState('')
  const [cancelReason, setCancelReason] = useState('')
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const { loading: geoLoading, getCurrentPosition } = useGeolocation()

  const { data: status, refetch: refetchStatus } = useAttendanceStatusQuery(localBooking?.bookingRequestId || 0, {
    enabled: open && !!localBooking && localBooking.status === 'APPROVED'
  })

  const { data: attendances = [], refetch: refetchAttendances } = useBookingAttendanceQuery(
    localBooking?.bookingRequestId || 0,
    {
      enabled: open && !!localBooking && localBooking.status === 'APPROVED' && isLecturerView
    }
  )

  const needNoteForCheckIn = !!status?.needNoteForCheckIn
  const needNoteForCheckOut = !!status?.needNoteForCheckOut

  useEffect(() => {
    if (open && initialBooking) {
      setLocalBooking(initialBooking)
    }
  }, [open, initialBooking])

  const approveMutation = useApproveBookingMutation()
  const rejectMutation = useRejectBookingMutation()
  const cancelMutation = useCancelBookingMutation()
  const addParticipantsMutation = useAddParticipantsMutation()

  const isPersonalOrGroup = localBooking?.bookingType === 'PERSONAL' || localBooking?.bookingType === 'GROUP'

  const { data: participantsData, isLoading: isParticipantsLoading } = useBookingParticipantsBasicQuery(
    localBooking?.bookingRequestId || 0,
    { page: page + 1, size: 10, search: searchTerm },
    { enabled: open && !!localBooking && isPersonalOrGroup && !isLecturerView }
  )

  const fetchStatus = useCallback(async () => {
    refetchStatus()
    if (isLecturerView) {
      refetchAttendances()
    }
  }, [isLecturerView, refetchStatus, refetchAttendances])

  const handleCheckAction = async (type: 'IN' | 'OUT', note?: string) => {
    if (!localBooking) return

    const toastId = toast.loading('Đang xác định vị trí của bạn...')
    try {
      const position = await getCurrentPosition()
      const { latitude, longitude } = position.coords
      toast.dismiss(toastId)

      setIsSubmitting(true)

      if (type === 'IN') {
        await attendanceService.checkIn(localBooking.bookingRequestId, {
          latitude,
          longitude,
          note
        })
        toast.success('Điểm danh vào thành công!')
      } else {
        await attendanceService.checkOut(localBooking.bookingRequestId, {
          latitude,
          longitude,
          note
        })
        toast.success('Điểm danh ra thành công!')
      }

      await fetchStatus()
      setShowNoteDialog(false)
      setNoteInput('')
    } catch (error) {
      toast.dismiss(toastId)
      handleErrorApi({ error })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenNoteDialog = (type: 'IN' | 'OUT') => {
    setCheckType(type)
    setNoteInput('')
    setShowNoteDialog(true)
  }

  const handleSubmitWithNote = () => {
    handleCheckAction(checkType, noteInput)
  }

  const handleCancel = async () => {
    if (!localBooking) return

    try {
      setIsSubmitting(true)
      await cancelMutation.mutateAsync({
        id: localBooking.bookingRequestId,
        data: { cancelReason: cancelReason || undefined }
      })
      toast.success('Đã hủy yêu cầu đặt phòng thành công')
      setShowCancelDialog(false)
      onOpenChange(false)
      onCancel?.()
    } catch (error) {
      handleErrorApi({ error })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApprove = async () => {
    if (!localBooking) return
    if (!confirm('Bạn có chắc chắn muốn duyệt đơn đăng ký này không?')) return

    try {
      await approveMutation.mutateAsync({
        id: localBooking.bookingRequestId,
        data: { responseNote: rejectReason || undefined }
      })
      toast.success('Đã duyệt đơn đăng ký thành công')
      setRejectReason('')
      onOpenChange(false)
      onCancel?.()
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  const handleReject = async () => {
    if (!localBooking) return
    if (!rejectReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối')
      return
    }
    try {
      await rejectMutation.mutateAsync({
        id: localBooking.bookingRequestId,
        data: { responseNote: rejectReason }
      })
      toast.success('Đã từ chối đơn đăng ký thành công')
      onOpenChange(false)
      onCancel?.()
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  const handleAddParticipant = async (p: { username: string; role: string }) => {
    if (!localBooking) return
    try {
      const response = await addParticipantsMutation.mutateAsync({
        id: localBooking.bookingRequestId,
        participants: [p]
      })
      if (response.data.data) {
        setLocalBooking(response.data.data)
      }
      toast.success('Đã thêm thành viên mới thành công')
      fetchStatus()
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  if (!localBooking) return null

  const booking = localBooking

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'APPROVED':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'REJECTED':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'CANCELED':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'SYSTEM_CANCELED':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusLabel = (status: string) => {
    return RequestStatusLabels[status as keyof typeof RequestStatusLabels] || status
  }

  const secureBooking = isLecturerView ? (booking as SecureBookingResponse) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-6xl w-[96vw] h-[92vh] flex flex-col p-0 overflow-hidden'>
        <DialogHeader className='p-6 pb-2 border-b'>
          <div className='flex justify-between items-center pr-8'>
            <div className='flex items-center gap-3'>
              <div>
                <DialogTitle className='text-2xl font-bold text-[#153898]'>
                  {isLecturerView ? 'BÁO CÁO CHI TIẾT ĐẶT PHÒNG' : 'CHI TIẾT LỊCH ĐẶT PHÒNG'}
                </DialogTitle>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              {status?.hasCheckedOut ? (
                <Badge className='bg-orange-100 text-orange-700 border-orange-200 font-bold px-3 py-1 text-xs'>
                  Đã kết thúc
                </Badge>
              ) : status?.hasCheckedIn ? (
                <Badge className='bg-green-500 text-white font-bold px-3 py-1 text-xs animate-pulse'>
                  Đang sử dụng
                </Badge>
              ) : null}
              <Badge className={`${getStatusColor(booking.status)} font-bold px-3 py-1 text-xs`}>
                {getStatusLabel(booking.status)}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className='flex-1 overflow-hidden'>
          <div className='grid grid-cols-12 h-full'>
            <div className='col-span-12 md:col-span-4 border-r bg-gray-50/50 flex flex-col h-full overflow-y-auto overflow-x-hidden'>
              <div className='p-6 space-y-6'>
                {isLecturerView && secureBooking && (
                  <div className='space-y-4'>
                    <div className='flex items-center gap-2 text-[#153898] mb-1'>
                      <UserCog className='h-5 w-5' />
                      <h4 className='text-base font-bold uppercase tracking-wider text-gray-900'>Thông tin quản trị</h4>
                    </div>
                    <div className='grid grid-cols-1 gap-4 bg-white p-4 rounded-xl border shadow-sm'>
                      <div className='flex items-center gap-3'>
                        <div className='w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 border'>
                          {secureBooking.createdBy?.substring(0, 1).toUpperCase() || 'U'}
                        </div>
                        <div className='flex flex-col'>
                          <span className='text-xs text-gray-400 font-bold uppercase'>Người tạo</span>
                          <span className='text-sm font-bold text-gray-700'>{secureBooking.requesterName}</span>
                        </div>
                      </div>
                      <div className='flex items-center gap-3'>
                        <div className='w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500'>
                          <Clock className='h-5 w-5' />
                        </div>
                        <div className='flex flex-col'>
                          <span className='text-xs text-gray-400 font-bold uppercase'>Thời điểm tạo</span>
                          <span className='text-xs font-medium text-gray-600'>
                            {formatFullDateTimeCompact(secureBooking.createdAt)}
                          </span>
                        </div>
                      </div>
                      {secureBooking.modifiedBy && (
                        <div className='pt-2 border-t border-dashed space-y-3'>
                          <div className='flex items-center gap-3'>
                            <div className='w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-xs font-medium text-blue-600 border border-blue-100'>
                              {secureBooking.modifiedBy?.substring(0, 1).toUpperCase() || 'U'}
                            </div>
                            <div className='flex flex-col'>
                              <span className='text-xs text-gray-400 font-bold uppercase'>Cập nhật bởi</span>
                              <span className='text-sm font-bold text-gray-700'>{secureBooking.modifiedBy}</span>
                            </div>
                          </div>
                          <div className='flex items-center gap-3'>
                            <div className='w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500'>
                              <Clock className='h-5 w-5' />
                            </div>
                            <div className='flex flex-col'>
                              <span className='text-xs text-gray-400 font-medium uppercase'>Cập nhật lúc</span>
                              <span className='text-xs font-medium text-gray-600'>
                                {secureBooking.modifiedAt && formatFullDateTimeCompact(secureBooking.modifiedAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className='space-y-6'>
                  <div className='flex items-center gap-2 text-[#153898] mb-2'>
                    <Info className='h-5 w-5' />
                    <h4 className='text-base font-bold uppercase tracking-wider text-gray-900'>Chi tiết lịch đặt</h4>
                  </div>

                  <div className='relative pl-3 space-y-8 before:absolute before:left-[23px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 before:content-[""]'>
                    <div className='relative flex gap-4 items-start translate-x-[-11px]'>
                      <div className='z-10 p-2 rounded-full bg-blue-50 border-2 border-white shadow-sm ring-4 ring-gray-50/50'>
                        <MapPin className='h-5 w-5 text-[#153898]' />
                      </div>
                      <div className='pt-1'>
                        <p className='text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5'>
                          Địa điểm
                        </p>
                        <p className='text-sm font-bold text-gray-900 leading-tight'>{booking.roomName}</p>
                        <p className='text-sm font-medium text-gray-500'>Toà {booking.building}</p>
                      </div>
                    </div>

                    <div className='relative flex gap-4 items-start translate-x-[-11px]'>
                      <div className='z-10 p-2 rounded-full bg-blue-50 border-2 border-white shadow-sm ring-4 ring-gray-50/50'>
                        <Calendar className='h-5 w-5 text-[#153898]' />
                      </div>
                      <div className='pt-1'>
                        <p className='text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5'>
                          Ngày đặt
                        </p>
                        <p className='text-sm font-bold text-gray-900 capitalize'>
                          {formatDateFull(booking.bookingDate)}
                        </p>
                      </div>
                    </div>

                    {/* Thời gian */}
                    <div className='relative flex gap-4 items-start translate-x-[-11px]'>
                      <div className='z-10 p-2 rounded-full bg-blue-50 border-2 border-white shadow-sm ring-4 ring-gray-50/50'>
                        <Clock className='h-5 w-5 text-[#153898]' />
                      </div>
                      <div className='pt-1'>
                        <p className='text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-2'>
                          Thời gian
                        </p>
                        <div className='flex flex-wrap gap-2'>
                          {booking.slots.map((slot) => (
                            <Badge
                              key={slot.slotId}
                              variant='secondary'
                              className='bg-blue-100/50 text-[#153898] font-bold text-sm py-1 px-3 border-blue-200'
                            >
                              {slot.slotName} ({slot.startTime.substring(0, 5)}-{slot.endTime.substring(0, 5)})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Mục đích */}
                    <div className='relative flex gap-4 items-start translate-x-[-11px]'>
                      <div className='z-10 p-2 rounded-full bg-blue-50 border-2 border-white shadow-sm ring-4 ring-gray-50/50'>
                        <FileText className='h-5 w-5 text-[#153898]' />
                      </div>
                      <div className='pt-1'>
                        <p className='text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5'>
                          Mục đích
                        </p>
                        <p className='text-sm font-semibold text-gray-700 leading-snug italic bg-slate-100/50 p-3 rounded-lg border border-dashed'>
                          "{booking.purpose}"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {booking.devices && booking.devices.length > 0 && (
                  <div className='space-y-4 pt-4'>
                    <Separator className='opacity-50' />
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2 text-[#153898]'>
                        <Cpu className='h-5 w-5' />
                        <h4 className='text-base font-bold uppercase tracking-wider text-gray-900'>
                          Danh sách thiết bị
                        </h4>
                      </div>
                      <Badge className='bg-slate-200 text-slate-700 hover:bg-slate-200 font-bold px-2 h-6'>
                        {booking.devices.length}
                      </Badge>
                    </div>

                    <div className='bg-white rounded-xl border border-slate-100 divide-y divide-slate-50 overflow-hidden shadow-sm'>
                      {booking.devices.map((device: BookingDeviceResponse, idx) => {
                        const iconName = (device.icon || 'default') as keyof typeof deviceIconMap
                        const IconComponent = deviceIconMap[iconName] || deviceIconMap.default
                        return (
                          <div
                            key={idx}
                            className='flex items-center justify-between p-3.5 hover:bg-slate-50/50 transition-colors'
                          >
                            <div className='flex items-center gap-3'>
                              <div className='w-8 h-8 rounded-lg bg-blue-50/50 flex items-center justify-center'>
                                <IconComponent className='h-4 w-4 text-[#153898]' />
                              </div>
                              <span className='text-sm font-bold text-gray-700'>{device.deviceName}</span>
                            </div>
                            <div className='flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md font-mono font-bold text-[#153898]'>
                              <span className='text-[10px] opacity-60'>x</span>
                              <span className='text-sm'>{device.quantity}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className='col-span-12 md:col-span-8 flex flex-col h-full bg-white'>
              <ScrollArea className='flex-1 h-full'>
                <div className='p-6 space-y-8'>
                  {booking.status === 'APPROVED' && status && (
                    <div className='space-y-4'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2 text-[#153898]'>
                          <CheckCircle2 className='h-5 w-5' />
                          <h4 className='text-base font-bold uppercase tracking-tight'>Tình trạng điểm danh</h4>
                        </div>
                      </div>

                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        <div className='relative rounded-xl border-2 p-4 bg-white shadow-sm transition-all hover:border-[#153898]/30'>
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                              <div className='p-1.5 rounded-lg bg-blue-50 text-[#153898]'>
                                <LogIn className='h-5 w-5' />
                              </div>
                              <span className='text-sm font-bold text-gray-500 uppercase tracking-tighter'>
                                Check-in
                              </span>
                            </div>
                            {status.hasCheckedIn &&
                            status.actualLateCheckinMinutes &&
                            status.actualLateCheckinMinutes > 0 ? (
                              <Badge variant='destructive' className='text-xs font-bold px-2 py-0.5'>
                                Trễ {formatDuration(status.actualLateCheckinMinutes)}
                              </Badge>
                            ) : !status.hasCheckedIn &&
                              status.calculatedLateCheckinMinutes &&
                              status.calculatedLateCheckinMinutes > 0 ? (
                              <Badge variant='destructive' className='text-xs font-bold px-2 py-0.5'>
                                Trễ {formatDuration(status.calculatedLateCheckinMinutes)}
                              </Badge>
                            ) : null}
                          </div>

                          <div className='mt-3 text-sm font-bold text-gray-900'>
                            {status.hasCheckedIn && status.checkinAt ? (
                              <span className='text-green-600'>{formatFullDateTime(status.checkinAt)}</span>
                            ) : (
                              <span className='text-gray-400 italic font-normal'>Chưa check-in</span>
                            )}
                          </div>

                          {status.checkinNote && (
                            <div className='mt-2 rounded-lg bg-gray-50 border border-gray-100 p-2 text-xs text-gray-600 italic'>
                              "{status.checkinNote}"
                            </div>
                          )}
                        </div>

                        <div className='relative rounded-xl border-2 p-4 bg-white shadow-sm transition-all hover:border-[#153898]/30'>
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                              <div className='p-1.5 rounded-lg bg-orange-50 text-orange-600'>
                                <LogOut className='h-5 w-5' />
                              </div>
                              <span className='text-sm font-bold text-gray-500 uppercase tracking-tighter'>
                                Check-out
                              </span>
                            </div>
                            {status.hasCheckedOut && status.actualEarlyCheckoutMinutes ? (
                              <Badge className='text-xs font-bold px-2 py-0.5 bg-amber-500 hover:bg-amber-600'>
                                Sớm {formatDuration(status.actualEarlyCheckoutMinutes)}
                              </Badge>
                            ) : status.hasCheckedOut && status.actualLateCheckoutMinutes ? (
                              <Badge variant='destructive' className='text-xs font-bold px-2 py-0.5'>
                                Trễ {formatDuration(status.actualLateCheckoutMinutes)}
                              </Badge>
                            ) : !status.hasCheckedOut && status.calculatedEarlyCheckoutMinutes ? (
                              <Badge variant='secondary' className='text-xs font-bold px-2 py-0.5'>
                                Sẽ sớm {formatDuration(status.calculatedEarlyCheckoutMinutes)}
                              </Badge>
                            ) : !status.hasCheckedOut && status.calculatedLateCheckoutMinutes ? (
                              <Badge variant='secondary' className='text-xs font-bold px-2 py-0.5'>
                                Sẽ trễ {formatDuration(status.calculatedLateCheckoutMinutes)}
                              </Badge>
                            ) : null}
                          </div>

                          <div className='mt-3 text-sm font-bold text-gray-900'>
                            {status.hasCheckedOut && status.checkoutAt ? (
                              <span className='text-blue-600'>{formatFullDateTime(status.checkoutAt)}</span>
                            ) : (
                              <span className='text-gray-400 italic font-normal'>Chưa check-out</span>
                            )}
                          </div>

                          {status.checkoutNote && (
                            <div className='mt-2 rounded-lg bg-gray-50 border border-gray-100 p-2 text-xs text-gray-600 italic'>
                              "{status.checkoutNote}"
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Summary Notes (Lecturer View Only) */}
                      {isLecturerView && attendances.some((a) => a.checkinNote || a.checkoutNote) && (
                        <div className='rounded-xl bg-amber-50/50 border border-amber-100 p-4 space-y-3'>
                          <h5 className='text-sm font-bold text-amber-700 uppercase tracking-wider flex items-center gap-2'>
                            <FileText className='h-5 w-5' /> Ghi chú từ các thành viên
                          </h5>
                          <div className='grid grid-cols-1 gap-2'>
                            {attendances
                              .filter((a) => a.checkinNote || a.checkoutNote)
                              .map((a, idx) => (
                                <div key={idx} className='bg-white/70 p-3 rounded-lg border border-amber-100/50'>
                                  <div className='flex items-center gap-2 mb-1'>
                                    <div className='w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center text-xs font-black text-amber-700'>
                                      {a.userFullName?.charAt(0)}
                                    </div>
                                    <span className='text-sm font-bold text-amber-800'>{a.userFullName}</span>
                                  </div>
                                  <div className='space-y-1 pl-6'>
                                    {a.checkinNote && (
                                      <p className='text-sm text-amber-900/80'>
                                        <span className='font-bold opacity-60'>Vào:</span> {a.checkinNote}
                                      </p>
                                    )}
                                    {a.checkoutNote && (
                                      <p className='text-sm text-amber-900/80'>
                                        <span className='font-bold opacity-60'>Ra:</span> {a.checkoutNote}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Section 2: Participants */}
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between sticky top-0 bg-white z-10 pb-4 border-b mb-4'>
                      <div className='flex items-center gap-2 text-[#153898]'>
                        <Users className='h-6 w-6' />
                        <h4 className='text-base font-bold uppercase tracking-tight'>
                          Thành viên ({booking.participantCount || 0})
                        </h4>
                      </div>

                      <div className='flex items-center gap-3'>
                        <div className='relative w-40'>
                          <SearchIcon className='absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                          <Input
                            placeholder='Tìm...'
                            className='pl-8 h-9 text-sm bg-gray-50 border-none'
                            value={searchTerm}
                            onChange={(e) => {
                              setSearchTerm(e.target.value)
                              setPage(0)
                            }}
                          />
                        </div>
                        {isLecturerView && booking.bookingType === 'THESIS' && (
                          <DialogAddAuditingParticipant currentParticipants={[]} onAdd={handleAddParticipant} />
                        )}
                        {isLecturerView && (
                          <Link
                            to={PATHS.LECTURER.BOOKING_DETAIL.replace(':id', booking.bookingRequestId.toString())}
                            className='text-sm font-bold text-[#153898] hover:underline flex items-center gap-1'
                          >
                            Chi tiết
                            <ChevronDown className='h-4 w-4 -rotate-90' />
                          </Link>
                        )}
                      </div>
                    </div>

                    <div className='border rounded-xl overflow-hidden shadow-sm'>
                      <div className='max-h-[300px] overflow-auto'>
                        <table className='w-full text-sm text-left'>
                          <thead className='bg-white sticky top-0 z-20 shadow-sm'>
                            <tr>
                              <th className='px-4 py-3 font-bold text-gray-500 uppercase tracking-tighter'>
                                Thành viên
                              </th>
                              <th className='px-4 py-3 font-bold text-gray-500 uppercase tracking-tighter'>Vai trò</th>
                            </tr>
                          </thead>
                          <tbody className='divide-y'>
                            {isParticipantsLoading ? (
                              <tr>
                                <td colSpan={2} className='px-4 py-8 text-center'>
                                  <Loader2 className='h-5 w-5 animate-spin mx-auto text-primary opacity-50' />
                                </td>
                              </tr>
                            ) : participantsData?.data?.length ? (
                              participantsData.data.map((p: BookingParticipantResponse) => (
                                <tr key={p.username} className='hover:bg-blue-50/30 transition-colors'>
                                  <td className='px-4 py-3'>
                                    <div className='flex items-center gap-3'>
                                      <div className='w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-[#153898] border shadow-sm'>
                                        {p.fullName?.charAt(0) || p.username.charAt(0).toUpperCase()}
                                      </div>
                                      <div>
                                        <p className='font-bold text-gray-800 text-base'>{p.fullName}</p>
                                        <p className='text-xs text-gray-400 font-mono'>{p.username}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className='px-4 py-3 font-medium'>
                                    <Badge
                                      variant='outline'
                                      className='font-bold text-sm px-2 py-0 border-gray-200 bg-gray-50'
                                    >
                                      {ParticipantRoleLabels[p.role as keyof typeof ParticipantRoleLabels]}
                                    </Badge>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={2} className='px-4 py-6 text-center text-gray-400 italic'>
                                  Không có dữ liệu thành viên
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Reason for Rejection/Cancellation/Response */}
                  {(booking.cancelReason ||
                    booking.responseNote ||
                    (isLecturerView && booking.status === 'PENDING')) && (
                    <div className='pt-4 border-t border-dashed space-y-4'>
                      {/* Hiển thị lý do hủy từ người yêu cầu */}
                      {booking.cancelReason && (
                        <div className='bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-start gap-3'>
                          <AlertCircle className='h-5 w-5 text-orange-600 mt-0.5' />
                          <div className='flex-1'>
                            <p className='text-base font-bold text-orange-700'>Lý do hủy (Người đặt)</p>
                            <p className='text-base text-orange-600 mt-1'>{booking.cancelReason}</p>
                          </div>
                        </div>
                      )}

                      {/* Hiển thị phản hồi từ người duyệt */}
                      {booking.responseNote && (
                        <div
                          className={cn(
                            'p-4 rounded-xl flex items-start gap-3 border',
                            booking.status === 'REJECTED' || booking.status === 'SYSTEM_CANCELED'
                              ? 'bg-red-50 border-red-100'
                              : 'bg-blue-50 border-blue-100'
                          )}
                        >
                          <AlertCircle
                            className={cn(
                              'h-5 w-5 mt-0.5',
                              booking.status === 'REJECTED' || booking.status === 'SYSTEM_CANCELED'
                                ? 'text-red-600'
                                : 'text-blue-600'
                            )}
                          />
                          <div className='flex-1'>
                            <p
                              className={cn(
                                'text-base font-bold',
                                booking.status === 'REJECTED' || booking.status === 'SYSTEM_CANCELED'
                                  ? 'text-red-700'
                                  : 'text-blue-700'
                              )}
                            >
                              {booking.status === 'REJECTED' || booking.status === 'SYSTEM_CANCELED'
                                ? 'Lý do từ chối / Hủy hệ thống'
                                : 'Ghi chú phản hồi (Duyệt)'}
                            </p>
                            <p
                              className={cn(
                                'text-base mt-1',
                                booking.status === 'REJECTED' || booking.status === 'SYSTEM_CANCELED'
                                  ? 'text-red-600'
                                  : 'text-blue-600'
                              )}
                            >
                              {booking.responseNote}
                            </p>
                            {booking.responseBy && (
                              <div className='mt-2 flex items-center gap-4 text-xs font-medium text-gray-500'>
                                <span className='flex items-center gap-1.5'>
                                  <ShieldCheck className='h-3.5 w-3.5' />
                                  Bởi: {booking.responseBy?.fullName} ({booking.responseBy?.username})
                                </span>
                                {booking.responseDate && (
                                  <span className='flex items-center gap-1.5'>
                                    <Calendar className='h-3.5 w-3.5' />
                                    Lúc: {formatFullDateTime(booking.responseDate)}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {isLecturerView && booking.status === 'PENDING' && (
                        <div className='space-y-2'>
                          <Label className='text-sm font-bold text-gray-700 flex items-center gap-2'>
                            <FileText className='h-4 w-4 text-[#153898]' />
                            Ghi chú phản hồi (bắt buộc khi từ chối)
                          </Label>
                          <Textarea
                            placeholder='Vui lòng nhập lý do nếu bạn muốn từ chối yêu cầu này...'
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className='min-h-[100px] text-base rounded-xl border-gray-200 focus:ring-[#153898]/10 focus:border-[#153898] transition-all resize-none'
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>

        <DialogFooter className='p-4 border-t bg-gray-50/50 flex flex-row items-center justify-between sm:justify-between'>
          <div className='hidden sm:flex items-center gap-2'>
            <UserIcon className='size-4 text-gray-400' />
            <span className='text-xs font-bold text-gray-400'>
              Người tạo:{' '}
              <span className='text-gray-600 font-bold'>
                {isLecturerView ? secureBooking?.requesterName : booking.requesterName}
              </span>
            </span>
          </div>

          <div className='flex gap-2 w-full sm:w-auto'>
            {booking.status === 'APPROVED' && status && (
              <>
                {(status.canCheckIn || status.hasCheckedIn) && (
                  <Button
                    className='font-bold gap-2 flex-1 sm:flex-none py-2 h-10 px-6 text-sm bg-[#153898] hover:bg-blue-800 shadow-sm'
                    disabled={status.hasCheckedIn || isSubmitting || geoLoading}
                    onClick={() => {
                      setCheckType('IN')
                      if (needNoteForCheckIn) {
                        handleOpenNoteDialog('IN')
                      } else {
                        handleCheckAction('IN')
                      }
                    }}
                  >
                    {(isSubmitting || geoLoading) && checkType === 'IN' ? (
                      <Loader2 className='size-4 animate-spin' />
                    ) : (
                      <LogIn className='size-4' />
                    )}
                    {status.hasCheckedIn ? 'Đã check-in' : 'Điểm danh vào'}
                  </Button>
                )}
                {(status.canCheckOut || status.hasCheckedOut) && (
                  <Button
                    variant='outline'
                    className='font-bold gap-2 flex-1 sm:flex-none py-2 h-10 px-6 text-sm border-2'
                    disabled={!status.hasCheckedIn || status.hasCheckedOut || isSubmitting || geoLoading}
                    onClick={() => {
                      setCheckType('OUT')
                      if (needNoteForCheckOut) {
                        handleOpenNoteDialog('OUT')
                      } else {
                        handleCheckAction('OUT')
                      }
                    }}
                  >
                    {(isSubmitting || geoLoading) && checkType === 'OUT' ? (
                      <Loader2 className='size-4 animate-spin' />
                    ) : (
                      <LogOut className='size-4' />
                    )}
                    {status.hasCheckedOut ? 'Đã check-out' : 'Điểm danh ra'}
                  </Button>
                )}
              </>
            )}

            {isLecturerView
              ? booking.status === 'PENDING' && (
                  <div className='flex gap-2 flex-1 sm:flex-none'>
                    <Button
                      className='bg-[#153898] hover:bg-blue-800 text-white font-bold gap-2 flex-1 sm:flex-none'
                      onClick={handleApprove}
                      disabled={approveMutation.isPending}
                    >
                      <Check className='h-4 w-4' />
                      Chấp nhận
                    </Button>
                    <Button
                      variant='secondary'
                      className='bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold gap-2 flex-1 sm:flex-none'
                      onClick={handleReject}
                      disabled={rejectMutation.isPending}
                    >
                      <XCircle className='h-4 w-4' />
                      Từ chối
                    </Button>
                  </div>
                )
              : booking.isAllowedEditing && (
                  <div className='flex gap-2 flex-1 sm:flex-none'>
                    <Button
                      className='bg-[#153898] hover:bg-blue-800 text-white font-bold gap-2 flex-1 sm:flex-none'
                      onClick={() => onUpdate?.(booking)}
                    >
                      <Pencil className='h-4 w-4' />
                      Cập nhật
                    </Button>
                    {booking.status === 'PENDING' && (
                      <Button
                        variant='secondary'
                        className='bg-red-50 hover:bg-red-100 text-red-600 border-red-200 font-bold gap-2 flex-1 sm:flex-none'
                        onClick={() => setShowCancelDialog(true)}
                        disabled={isSubmitting}
                      >
                        <Trash2 className='h-4 w-4' />
                        Hủy lịch
                      </Button>
                    )}
                  </div>
                )}
          </div>
        </DialogFooter>
      </DialogContent>

      {/* Dialog nhập ghi chú */}
      {(() => {
        const isNoteRequired =
          (checkType === 'IN' && needNoteForCheckIn) || (checkType === 'OUT' && needNoteForCheckOut)

        return (
          <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
            <DialogContent className='sm:max-w-[450px]'>
              <DialogHeader>
                <DialogTitle className='text-lg font-bold flex items-center gap-2'>
                  <Pencil className='h-5 w-5 text-[#153898]' />
                  {checkType === 'IN' ? 'Ghi chú điểm danh vào' : 'Ghi chú điểm danh ra'}
                </DialogTitle>
              </DialogHeader>

              <div className='space-y-4 py-4'>
                <div className='p-3 bg-amber-50 border border-amber-100 rounded-xl'>
                  <p className='text-xs text-amber-700 leading-relaxed font-medium'>
                    {isNoteRequired
                      ? checkType === 'IN'
                        ? '⚠️ Bạn đang điểm danh vào trễ so với quy định. Vui lòng nhập lý do cụ thể để được xem xét.'
                        : '⚠️ Bạn đang điểm danh ra trễ so với quy định. Vui lòng nhập lý do cụ thể để được xem xét.'
                      : '✍️ Bạn có thể nhập ghi chú bổ sung cho buổi sử dụng phòng này (không bắt buộc).'}
                  </p>
                </div>

                <div className='space-y-2'>
                  <Label className='text-sm font-bold text-gray-700'>
                    Nội dung ghi chú {isNoteRequired && <span className='text-red-500'>*</span>}
                  </Label>
                  <Textarea
                    placeholder='Nhập lý do hoặc thông tin bổ sung tại đây...'
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    maxLength={500}
                    className='min-h-[120px] focus:ring-[#153898]/10'
                  />
                  <p className='text-sm text-gray-400 text-right font-medium'>{noteInput.length}/500 ký tự</p>
                </div>
              </div>

              <DialogFooter className='gap-2'>
                <Button variant='outline' onClick={() => setShowNoteDialog(false)} className='font-bold'>
                  Hủy bỏ
                </Button>

                <Button
                  onClick={handleSubmitWithNote}
                  disabled={isSubmitting || geoLoading || (isNoteRequired && !noteInput.trim())}
                  className='bg-[#153898] hover:bg-blue-800 font-bold'
                >
                  {isSubmitting ? <Loader2 className='h-5 w-5 animate-spin mr-2' /> : 'Xác nhận điểm danh'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )
      })()}
      {/* Dialog xác nhận hủy lịch */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className='sm:max-w-[450px]'>
          <DialogHeader>
            <DialogTitle className='text-lg font-bold flex items-center gap-2 text-red-600'>
              <AlertCircle className='h-5 w-5' />
              Xác nhận hủy đặt phòng
            </DialogTitle>
          </DialogHeader>

          <div className='space-y-4 py-4'>
            <div className='p-3 bg-red-50 border border-red-100 rounded-xl'>
              <p className='text-xs text-red-700 leading-relaxed font-medium'>
                Hành động này không thể hoàn tác. Bạn có chắc chắn muốn hủy yêu cầu đặt phòng này?
              </p>
            </div>

            <div className='space-y-2'>
              <Label className='text-sm font-bold text-gray-700'>Lý do hủy (không bắt buộc)</Label>
              <Textarea
                placeholder='Nhập lý do hủy tại đây...'
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                maxLength={500}
                className='min-h-[100px] focus:ring-red-500/10'
              />
              <p className='text-sm text-gray-400 text-right font-medium'>{cancelReason.length}/500 ký tự</p>
            </div>
          </div>

          <DialogFooter className='gap-2'>
            <Button variant='outline' onClick={() => setShowCancelDialog(false)} className='font-bold'>
              Quay lại
            </Button>

            <Button
              onClick={handleCancel}
              disabled={isSubmitting}
              className='bg-red-600 hover:bg-red-700 text-white font-bold'
            >
              {isSubmitting ? <Loader2 className='h-5 w-5 animate-spin mr-2' /> : 'Xác nhận hủy'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
