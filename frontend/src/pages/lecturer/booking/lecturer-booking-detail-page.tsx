import { useState, useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks/use-auth'
import { Role } from '@/constants/types'
import {
  Calendar,
  MapPin,
  FileText,
  AlertCircle,
  Pencil,
  LogIn,
  LogOut,
  Trash2,
  Loader2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Check,
  XCircle,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Input } from '@/components/ui/input'
import type { SecureBookingResponse, BookingDeviceResponse, ParticipantDetailResponse } from '@/schemas/booking.schema'
import { RequestStatusLabels, ParticipantRoleLabels } from '@/constants/types'
import { formatDuration, formatFullDateTime } from '@/utils/format'
import { useGeolocation } from '@/hooks/use-geolocation'
import attendanceService from '@/services/attendance.service'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import {
  useApproveBookingMutation,
  useRejectBookingMutation,
  useCancelBookingMutation,
  useAddParticipantsMutation,
  useBookingByIdAdminQuery,
  useBookingByIdQuery,
  useBookingParticipantsQuery,
  useBookingParticipantUsernamesQuery
} from '@/queries/booking.queries'
import { useAttendanceStatusQuery } from '@/queries/attendance.queries'
import { QUERY_KEYS } from '@/query-core'
import { DialogAddAuditingParticipant } from '@/components/lecturer/booking/dialog-add-auditing-participant'
import { DialogUpdateBooking } from '@/components/common/dialog-update-booking'
import { StudentBreadcrumb } from '@/components/common/student-breadcrumb'
import { PATHS } from '@/constants/paths'

const BookingDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isLecturerOrAdmin = user?.role === Role.LECTURER || user?.role === Role.ADMIN

  useEffect(() => {
    if (user && !isLecturerOrAdmin) {
      navigate(PATHS.HOME, { replace: true })
    }
  }, [user, isLecturerOrAdmin, navigate])

  const bookingId = Number(id)

  const adminQuery = useBookingByIdAdminQuery(bookingId, {
    enabled: !!bookingId && isLecturerOrAdmin
  })

  const studentQuery = useBookingByIdQuery(bookingId, {
    enabled: !!bookingId && !isLecturerOrAdmin
  })

  const { data: initialBooking, isLoading, isError } = isLecturerOrAdmin ? adminQuery : studentQuery

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showParticipants, setShowParticipants] = useState(true)
  const [rejectReason, setRejectReason] = useState('')
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const { loading: geoLoading, getCurrentPosition } = useGeolocation()

  const [showNoteDialog, setShowNoteDialog] = useState(false)
  const [checkType, setCheckType] = useState<'IN' | 'OUT'>('IN')
  const [noteInput, setNoteInput] = useState('')

  const booking = initialBooking

  const { data: excludedUsernames = [] } = useBookingParticipantUsernamesQuery(bookingId, {
    enabled: !!bookingId && isLecturerOrAdmin && booking?.bookingType === 'THESIS'
  })

  const queryClient = useQueryClient()
  const approveMutation = useApproveBookingMutation()
  const rejectMutation = useRejectBookingMutation()
  const cancelMutation = useCancelBookingMutation()
  const addParticipantsMutation = useAddParticipantsMutation()

  const [page, setPage] = useState(0)
  const [pageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPage(0)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const { data: participantsData, isLoading: isParticipantsLoading } = useBookingParticipantsQuery(
    bookingId,
    { page, size: pageSize, search: debouncedSearch },
    { enabled: !!bookingId && showParticipants }
  )

  const { data: status, refetch: refetchStatus } = useAttendanceStatusQuery(bookingId, {
    enabled: !!bookingId && !!booking && booking.status === 'APPROVED'
  })

  // Keep fetchStatus as a wrapper for refetchStatus to minimize logic changes elsewhere
  const fetchStatus = useCallback(async () => {
    refetchStatus()
  }, [refetchStatus])

  const needNoteForCheckIn = !!status?.needNoteForCheckIn
  const needNoteForCheckOut = !!status?.needNoteForCheckOut

  const handleCheckAction = async (type: 'IN' | 'OUT', note?: string) => {
    if (!booking) return
    try {
      const position = await getCurrentPosition()
      const { latitude, longitude } = position.coords

      setIsSubmitting(true)
      if (type === 'IN') {
        await attendanceService.checkIn(booking.bookingRequestId, { latitude, longitude, note })
        toast.success('Điểm danh vào thành công!')
      } else {
        await attendanceService.checkOut(booking.bookingRequestId, { latitude, longitude, note })
        toast.success('Điểm danh ra thành công!')
      }
      await fetchStatus()
      setShowNoteDialog(false)
      setNoteInput('')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ATTENDANCE.BY_BOOKING(bookingId) })
    } catch (error: unknown) {
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Vui lòng cấp quyền truy cập vị trí để điểm danh.')
            break
          case error.TIMEOUT:
            toast.error('Quá thời gian lấy vị trí. Hãy thử lại.')
            break
          default:
            toast.error('Không thể xác định vị trí hiện tại.')
        }
      } else {
        if (typeof error === 'object' && error !== null && 'response' in error) {
          const err = error as { response: { data: { message: string } } }
          toast.error(err.response?.data?.message || 'Lỗi hệ thống')
        } else {
          toast.error('Lỗi hệ thống')
        }
      }
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
    handleCheckAction(checkType, noteInput || undefined)
  }

  const handleCancel = async () => {
    if (!booking) return

    try {
      setIsSubmitting(true)
      await cancelMutation.mutateAsync({
        id: booking.bookingRequestId,
        data: { cancelReason: cancelReason || undefined }
      })
      toast.success('Đã hủy yêu cầu đặt phòng thành công')
      setShowCancelDialog(false)
      navigate(-1)
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const err = error as { response: { data: { message: string } } }
        toast.error(err.response?.data?.message || 'Lỗi khi hủy yêu cầu')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApprove = async () => {
    if (!booking) return

    try {
      await approveMutation.mutateAsync({
        id: booking.bookingRequestId,
        data: { responseNote: rejectReason || undefined }
      })
      toast.success('Đã duyệt đơn đăng ký thành công')
      setRejectReason('')
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const err = error as { response: { data: { message: string } } }
        toast.error(err.response?.data?.message || 'Lỗi khi duyệt đơn')
      }
    }
  }

  const handleReject = async () => {
    if (!booking) return
    if (!rejectReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối')
      return
    }
    try {
      await rejectMutation.mutateAsync({
        id: booking.bookingRequestId,
        data: { responseNote: rejectReason }
      })
      toast.success('Đã từ chối đơn đăng ký thành công')
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const err = error as { response: { data: { message: string } } }
        toast.error(err.response?.data?.message || 'Lỗi khi từ chối đơn')
      }
    }
  }

  const handleAddParticipant = async (p: { username: string; role: string }) => {
    if (!booking) return
    try {
      await addParticipantsMutation.mutateAsync({
        id: booking.bookingRequestId,
        participants: [p]
      })
      toast.success('Đã thêm thành viên mới thành công')
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const err = error as { response: { data: { message: string } } }
        toast.error(err.response?.data?.message || 'Lỗi khi thêm thành viên')
      }
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <Loader2 className='h-8 w-8 animate-spin text-[#153898]' />
      </div>
    )
  }

  if (isError) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[60vh] gap-4'>
        <div className='bg-red-50 p-4 rounded-full'>
          <AlertCircle className='h-12 w-12 text-red-500' />
        </div>
        <h2 className='text-2xl font-bold text-gray-900'>Không tìm thấy thông tin</h2>
        <p className='text-gray-500'>Yêu cầu đặt phòng không tồn tại hoặc bạn không có quyền truy cập</p>
        <Button onClick={() => navigate(-1)} variant='outline'>
          Quay lại
        </Button>
      </div>
    )
  }

  if (!booking) return null

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
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusLabel = (status: string) => {
    return RequestStatusLabels[status as keyof typeof RequestStatusLabels] || status
  }

  return (
    <div className='space-y-6'>
      <StudentBreadcrumb
        items={[
          {
            label: isLecturerOrAdmin ? 'Lịch' : 'Lịch cá nhân',
            href: isLecturerOrAdmin ? PATHS.LECTURER.BOOKINGS : PATHS.STUDENT.SCHEDULE
          },
          { label: 'Chi tiết đặt phòng' }
        ]}
        className='mb-6'
      />

      <div className='bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden'>
        <div className='p-8 bg-gray-50/10 border-b border-gray-100'>
          <div className='flex justify-between items-start'>
            <h1 className='text-2xl font-bold text-[#153898] flex items-center gap-2'>
              {isLecturerOrAdmin ? (
                <>
                  <ShieldCheck className='h-7 w-7' />
                  CHI TIẾT ĐẶT PHÒNG - BÁO CÁO
                </>
              ) : (
                'CHI TIẾT LỊCH ĐẶT PHÒNG'
              )}
            </h1>
            <div className='flex gap-2'>
              {status?.hasCheckedOut ? (
                <Badge className='bg-orange-100 text-orange-700 border-orange-200 font-bold px-3 py-1 text-sm'>
                  Đã kết thúc
                </Badge>
              ) : status?.hasCheckedIn ? (
                <Badge className='bg-green-100 text-green-700 border-green-200 font-bold px-3 py-1 text-sm'>
                  Đang sử dụng
                </Badge>
              ) : null}
              <Badge className={`${getStatusColor(booking.status)} font-bold px-3 py-1 text-sm`}>
                {getStatusLabel(booking.status)}
              </Badge>
            </div>
          </div>
        </div>

        <div className='p-8 space-y-10'>
          {/* Lịch sử Audit */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6 border-b border-gray-100 pb-6'>
            <div className='flex flex-col gap-1'>
              <span className='text-[10px] uppercase font-bold text-gray-400'>Người tạo</span>
              <div className='flex items-center gap-2'>
                <div className='w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600'>
                  {booking.requesterName?.substring(0, 1).toUpperCase() || 'U'}
                </div>
                <span className='text-sm font-bold text-gray-700'>{booking.requesterName}</span>
              </div>
            </div>
            <div className='flex flex-col gap-1'>
              <span className='text-[10px] uppercase font-bold text-gray-400'>Thời điểm tạo</span>
              <div className='text-sm font-bold text-gray-600'>
                {format(new Date(booking.createdAt), 'HH:mm - dd/MM/yyyy')}
              </div>
            </div>
            {isLecturerOrAdmin && 'modifiedBy' in booking && (booking as SecureBookingResponse).modifiedBy && (
              <>
                <div className='flex flex-col gap-1'>
                  <span className='text-[10px] uppercase font-bold text-gray-400'>Cập nhật bởi</span>
                  <div className='flex items-center gap-2 text-sm font-bold text-gray-700'>
                    <div className='w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600'>
                      {(booking as SecureBookingResponse).modifiedBy?.substring(0, 1).toUpperCase() || 'U'}
                    </div>
                    {(booking as SecureBookingResponse).modifiedBy}
                  </div>
                </div>
                <div className='flex flex-col gap-1'>
                  <span className='text-[10px] uppercase font-bold text-gray-400'>Thời điểm cập nhật</span>
                  <div className='text-sm font-bold text-gray-600'>
                    {(booking as SecureBookingResponse).modifiedAt &&
                      format(new Date((booking as SecureBookingResponse).modifiedAt as string), 'HH:mm - dd/MM/yyyy')}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Thông tin phòng & Mục đích */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100'>
            <div className='flex items-center gap-3 text-gray-600'>
              <MapPin className='h-5 w-5 text-[#153898]' />
              <div>
                <p className='text-sm font-medium opacity-70'>Phòng Lab</p>
                <p className='font-bold text-gray-900'>
                  {booking.roomName} - Toà {booking.building}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-3 text-gray-600'>
              <Calendar className='h-5 w-5 text-[#153898]' />
              <div>
                <p className='text-sm font-medium opacity-70'>Ngày đặt</p>
                <p className='font-bold text-gray-900 capitalize'>
                  {format(new Date(booking.bookingDate), 'eeee, dd/MM/yyyy', { locale: vi })}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-3 text-gray-600'>
              <FileText className='h-5 w-5 text-[#153898] mt-1' />
              <div>
                <p className='text-sm font-medium opacity-70'>Mục đích sử dụng</p>
                <p className='font-semibold text-gray-900 leading-relaxed italic line-clamp-2'>"{booking.purpose}"</p>
              </div>
            </div>
          </div>

          {/* Ca học */}
          <div className='space-y-3'>
            <h4 className='font-bold text-gray-700'>Thời gian chi tiết</h4>
            <div className='flex flex-wrap gap-2'>
              {booking.slots.map((slot: { slotId: number; slotName: string; startTime: string; endTime: string }) => (
                <div
                  key={slot.slotId}
                  className='bg-white border-2 border-[#153898]/10 px-4 py-2 rounded-lg flex flex-col items-center'
                >
                  <span className='text-[#153898] font-bold text-sm'>{slot.slotName}</span>
                  <span className='text-xs text-gray-500 font-mono'>
                    {slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Thiết bị */}
          {booking.devices && booking.devices.length > 0 && (
            <div className='space-y-3'>
              <h4 className='font-bold text-gray-700'>Thiết thiết bị đi kèm</h4>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
                {booking.devices.map((device: BookingDeviceResponse, idx: number) => (
                  <div
                    key={idx}
                    className='flex justify-between items-center bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-100 transition-all'
                  >
                    <span className='text-sm font-medium text-gray-700'>{device.deviceName}</span>
                    <Badge variant='outline' className='font-bold bg-white text-[#153898]'>
                      x{device.quantity}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {booking.status === 'APPROVED' && status && (
            <div className='space-y-3'>
              <h4 className='font-bold text-gray-700'>Trạng thái điểm danh của bạn</h4>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='relative rounded-xl border-2 p-4 bg-white shadow-sm transition-all hover:border-[#153898]/30'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <div className='p-1.5 rounded-lg bg-blue-50 text-[#153898]'>
                        <LogIn className='h-5 w-5' />
                      </div>
                      <span className='text-sm font-bold text-gray-500 uppercase tracking-tighter'>Check-in</span>
                    </div>
                    {status.hasCheckedIn && status.actualLateCheckinMinutes && status.actualLateCheckinMinutes > 0 ? (
                      <Badge variant='destructive' className='text-xs font-bold px-2 py-0.5'>
                        Trễ {formatDuration(status.actualLateCheckinMinutes)}
                      </Badge>
                    ) : !status.hasCheckedIn &&
                      status.calculatedLateCheckinMinutes &&
                      status.calculatedLateCheckinMinutes > 0 ? (
                      <Badge variant='destructive' className='text-xs font-bold px-2 py-0.5'>
                        Sẽ trễ {formatDuration(status.calculatedLateCheckinMinutes)}
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

                {/* CHECK-OUT */}
                <div className='relative rounded-xl border-2 p-4 bg-white shadow-sm transition-all hover:border-[#153898]/30'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <div className='p-1.5 rounded-lg bg-orange-50 text-orange-600'>
                        <LogOut className='h-5 w-5' />
                      </div>
                      <span className='text-sm font-bold text-gray-500 uppercase tracking-tighter'>Check-out</span>
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
            </div>
          )}

          {/* Người tham gia */}
          <div className='space-y-4'>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
              <div className='flex items-center gap-2'>
                <h4 className='font-bold text-gray-700'>Thành viên tham gia ({booking.participantCount || 0})</h4>
                {isParticipantsLoading && <Loader2 className='h-4 w-4 animate-spin text-gray-400' />}
              </div>
              <div className='flex items-center gap-2'>
                <div className='relative w-full sm:w-64'>
                  <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                  <Input
                    placeholder='Tìm kiếm...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='pl-9 h-9 rounded-lg border-gray-200 focus:ring-blue-100 focus:border-blue-400'
                  />
                </div>
                {isLecturerOrAdmin && booking.bookingType === 'THESIS' && (
                  <DialogAddAuditingParticipant
                    currentParticipants={[]}
                    excludedUsernames={excludedUsernames}
                    onAdd={handleAddParticipant}
                  />
                )}
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-9 text-[#153898] hover:text-blue-700 hover:bg-blue-50 font-bold gap-1'
                  onClick={() => setShowParticipants(!showParticipants)}
                >
                  {showParticipants ? (
                    <>
                      <ChevronUp className='h-4 w-4' />
                      Ẩn danh sách
                    </>
                  ) : (
                    <>
                      <ChevronDown className='h-4 w-4' />
                      Hiện danh sách
                    </>
                  )}
                </Button>
              </div>
            </div>

            {showParticipants && (
              <div className='space-y-4 animate-in fade-in slide-in-from-top-2 duration-200'>
                <div className='bg-white border rounded-xl overflow-hidden shadow-sm'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-[#f8f9fa]'>
                      <tr>
                        <th className='px-4 py-3 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[5%]'>
                          STT
                        </th>
                        <th className='px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[12%]'>
                          Mã số
                        </th>
                        <th className='px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[20%]'>
                          Họ tên
                        </th>
                        <th className='px-4 py-3 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[10%]'>
                          Vai trò
                        </th>
                        <th className='px-4 py-3 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[10%]'>
                          Vào
                        </th>
                        <th className='px-4 py-3 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[10%]'>
                          Ra
                        </th>
                        <th className='px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[33%]'>
                          Ghi chú
                        </th>
                      </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-100'>
                      {participantsData?.data.map((person: ParticipantDetailResponse, idx: number) => {
                        const stt = page * pageSize + idx + 1
                        return (
                          <tr key={person.username} className='hover:bg-gray-50/80 transition-colors'>
                            <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-medium text-center'>
                              {stt}
                            </td>
                            <td className='px-4 py-3 whitespace-nowrap text-sm font-bold'>{person.username}</td>
                            <td className='px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900'>
                              {person.fullName || '—'}
                            </td>
                            <td className='px-4 py-3 whitespace-nowrap text-center text-xs font-medium text-gray-600'>
                              {ParticipantRoleLabels[person.role as keyof typeof ParticipantRoleLabels] || person.role}
                            </td>
                            <td className='px-4 py-3 whitespace-nowrap text-center'>
                              {person.checkinAt ? (
                                <div className='flex flex-col items-center gap-0.5'>
                                  <span className='text-sm font-bold text-green-600'>
                                    {format(new Date(person.checkinAt), 'HH:mm')}
                                  </span>
                                  {person.checkinStatus === 'LATE' && person.lateCheckinMinutes && (
                                    <Badge variant='destructive' className='text-[9px] px-1.5 py-0 h-4'>
                                      Trễ {formatDuration(person.lateCheckinMinutes)}
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <span className='text-gray-300 text-xs'>—</span>
                              )}
                            </td>
                            <td className='px-4 py-3 whitespace-nowrap text-center'>
                              {person.checkoutAt ? (
                                <div className='flex flex-col items-center gap-0.5'>
                                  <span className='text-sm font-bold text-blue-600'>
                                    {format(new Date(person.checkoutAt), 'HH:mm')}
                                  </span>
                                  {person.checkoutStatus === 'LEFT_EARLY' && person.earlyCheckoutMinutes && (
                                    <Badge className='text-[9px] px-1.5 py-0 h-4 bg-amber-500 hover:bg-amber-600'>
                                      Sớm {formatDuration(person.earlyCheckoutMinutes)}
                                    </Badge>
                                  )}
                                  {person.checkoutStatus === 'LATE_CHECKOUT' && person.lateCheckoutMinutes && (
                                    <Badge variant='destructive' className='text-[9px] px-1.5 py-0 h-4'>
                                      Trễ {formatDuration(person.lateCheckoutMinutes)}
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <span className='text-gray-300 text-xs'>—</span>
                              )}
                            </td>
                            <td className='px-4 py-3 text-xs text-gray-600'>
                              {person.checkinNote || person.checkoutNote ? (
                                <div className='space-y-1.5'>
                                  {person.checkinNote && (
                                    <div className='flex items-start gap-1.5'>
                                      <Badge
                                        variant='outline'
                                        className='text-[9px] px-1.5 py-0 h-4 bg-green-50 text-green-700 border-green-200 shrink-0'
                                      >
                                        Vào
                                      </Badge>
                                      <span className='italic line-clamp-2 text-gray-600'>"{person.checkinNote}"</span>
                                    </div>
                                  )}
                                  {person.checkoutNote && (
                                    <div className='flex items-start gap-1.5'>
                                      <Badge
                                        variant='outline'
                                        className='text-[9px] px-1.5 py-0 h-4 bg-blue-50 text-blue-700 border-blue-200 shrink-0'
                                      >
                                        Ra
                                      </Badge>
                                      <span className='italic line-clamp-2 text-gray-600'>"{person.checkoutNote}"</span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className='text-gray-300'>—</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                      {(!participantsData || participantsData.data.length === 0) && !isParticipantsLoading && (
                        <tr>
                          <td colSpan={7} className='px-4 py-8 text-center text-gray-500 italic'>
                            Không tìm thấy thành viên nào
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {participantsData && participantsData.totalPages > 1 && (
                  <div className='flex items-center justify-between px-2 py-4 border-t border-gray-100 bg-gray-50/30 rounded-b-xl'>
                    <div className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                      Trang {participantsData.page + 1} / {participantsData.totalPages}
                    </div>
                    <div className='flex gap-1'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={participantsData.page === 0}
                        className='h-8 w-8 p-0'
                      >
                        <ChevronLeft className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setPage((p) => Math.min(participantsData.totalPages - 1, p + 1))}
                        disabled={participantsData.page === participantsData.totalPages - 1}
                        className='h-8 w-8 p-0'
                      >
                        <ChevronRight className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {
            <div className='border-t border-gray-100 space-y-6'>
              {booking.responseNote && (
                <div className='bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3'>
                  <AlertCircle
                    className={`h-5 w-5 ${booking.status === 'REJECTED' ? 'text-red-600' : 'text-blue-600'} mt-0.5`}
                  />
                  <div className='flex-1'>
                    <p
                      className={`text-sm font-bold ${booking.status === 'REJECTED' ? 'text-red-700' : 'text-blue-700'}`}
                    >
                      {booking.status === 'REJECTED' ? 'Lý do từ chối' : 'Ghi chú phản hồi'}
                    </p>
                    <p className={`text-sm ${booking.status === 'REJECTED' ? 'text-red-600' : 'text-blue-600'} mt-1`}>
                      {booking.responseNote}
                    </p>
                    {(booking as SecureBookingResponse).responseBy && (
                      <div className='mt-2 flex items-center gap-4 text-[11px] font-medium text-gray-500'>
                        <span className='flex items-center gap-1.5'>
                          <ShieldCheck className='h-3 w-3' />
                          Bởi: {(booking as SecureBookingResponse).responseBy?.fullName} (
                          {(booking as SecureBookingResponse).responseBy?.username})
                        </span>
                        {booking.responseDate && (
                          <span className='flex items-center gap-1.5'>
                            <Calendar className='h-3 w-3' />
                            Lúc: {formatFullDateTime(booking.responseDate)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {isLecturerOrAdmin && booking.status === 'PENDING' && (
                <div className='space-y-2'>
                  <Label className='text-sm font-bold text-gray-700 flex items-center gap-2'>
                    <FileText className='h-4 w-4 text-[#153898]' />
                    Ghi chú phản hồi (bắt buộc khi từ chối)
                  </Label>
                  <Textarea
                    placeholder='Vui lòng nhập lý do nếu bạn muốn từ chối yêu cầu này...'
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className='min-h-[100px] rounded-xl border-gray-200 focus:ring-[#153898]/10 focus:border-[#153898] transition-all resize-none placeholder:italic placeholder:font-normal'
                  />
                </div>
              )}
            </div>
          }
        </div>

        <div className='p-8 bg-gray-50/10 border-t border-gray-100 flex flex-wrap gap-2 justify-end'>
          {booking.status === 'APPROVED' && status && (
            <>
              {(status.canCheckIn || status.hasCheckedIn) && (
                <Button
                  className='font-bold gap-2'
                  onClick={() => {
                    setCheckType('IN')
                    if (needNoteForCheckIn) {
                      handleOpenNoteDialog('IN')
                    } else {
                      handleCheckAction('IN')
                    }
                  }}
                  disabled={status.hasCheckedIn || isSubmitting || geoLoading}
                >
                  {(isSubmitting || geoLoading) && checkType === 'IN' ? (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  ) : (
                    <LogIn className='h-4 w-4' />
                  )}
                  {status.hasCheckedIn ? 'Đã check-in' : 'Điểm danh vào'}
                </Button>
              )}
              {(status.canCheckOut || status.hasCheckedOut) && (
                <Button
                  variant='outline'
                  className='font-bold gap-2'
                  onClick={() => {
                    setCheckType('OUT')
                    if (needNoteForCheckOut) {
                      handleOpenNoteDialog('OUT')
                    } else {
                      handleCheckAction('OUT')
                    }
                  }}
                  disabled={!status.hasCheckedIn || status.hasCheckedOut || isSubmitting || geoLoading}
                >
                  {(isSubmitting || geoLoading) && checkType === 'OUT' ? (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  ) : (
                    <LogOut className='h-4 w-4' />
                  )}
                  {status.hasCheckedOut ? 'Đã check-out' : 'Điểm danh ra'}
                </Button>
              )}
            </>
          )}

          {isLecturerOrAdmin && booking.status === 'PENDING' && (
            <div className='flex gap-2'>
              <Button
                className='bg-[#153898] hover:bg-blue-800 text-white font-bold gap-2'
                onClick={handleApprove}
                disabled={approveMutation.isPending}
              >
                <Check className='h-4 w-4' />
                Chấp nhận
              </Button>
              <Button
                variant='secondary'
                className='bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold gap-2'
                onClick={handleReject}
                disabled={rejectMutation.isPending}
              >
                <XCircle className='h-4 w-4' />
                Từ chối
              </Button>
            </div>
          )}

          {booking.isAllowedEditing && (
            <div className='flex gap-2'>
              <Button
                className='bg-[#153898] hover:bg-blue-800 text-white font-bold gap-2'
                onClick={() => setIsUpdateOpen(true)}
              >
                <Pencil className='h-4 w-4' />
                Cập nhật yêu cầu
              </Button>
              {booking.status === 'PENDING' && (
                <Button
                  variant='destructive'
                  className='font-bold gap-2'
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
      </div>

      <DialogUpdateBooking booking={booking} open={isUpdateOpen} onOpenChange={setIsUpdateOpen} isLecturerView={true} />

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
                <div className='p-3 bg-amber-50 border border-amber-100 rounded-lg'>
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
                    className='min-h-[100px] resize-none border-gray-200 focus:ring-blue-100 focus:border-blue-400'
                  />
                  <div className='text-[10px] text-gray-400 text-right font-mono'>{noteInput.length}/500 ký tự</div>
                </div>
              </div>

              <DialogFooter>
                <Button variant='outline' onClick={() => setShowNoteDialog(false)} className='font-bold'>
                  Hủy bỏ
                </Button>
                <Button
                  onClick={handleSubmitWithNote}
                  disabled={isSubmitting || (isNoteRequired && !noteInput.trim())}
                  className='bg-[#153898] hover:bg-blue-800 text-white font-bold gap-2'
                >
                  {isSubmitting ? (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  ) : checkType === 'IN' ? (
                    <LogIn className='h-4 w-4' />
                  ) : (
                    <LogOut className='h-4 w-4' />
                  )}
                  Xác nhận điểm danh
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
            <div className='p-3 bg-red-50 border border-red-100 rounded-lg'>
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
    </div>
  )
}

export default BookingDetailPage
