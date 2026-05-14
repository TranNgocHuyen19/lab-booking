import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { Role } from '@/constants/types'
import {
  Calendar,
  MapPin,
  FileText,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Check,
  XCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Ban
} from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Input } from '@/components/ui/input'
import { RequestStatus, RequestStatusLabels, ParticipantRoleLabels } from '@/constants/types'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  useApproveBookingMutation,
  useRejectBookingMutation,
  useSystemCancelBookingMutation,
  useBookingByIdAdminQuery,
  useBookingParticipantsQuery
} from '@/queries/booking.queries'
import { PATHS } from '@/constants/paths'
import { cn } from '@/lib/utils'
import { DialogApprove } from '@/components/common/dialog-approve'
import { DialogReject } from '@/components/common/dialog-reject'
import { BOOKING_REJECTION_REASONS } from '@/constants/rejection-reasons'
import { Card, CardContent } from '@/components/ui/card'
import { handleErrorApi } from '@/utils/error-handler'

const AdminBookingDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = user?.role === Role.ADMIN

  useEffect(() => {
    if (user && !isAdmin) {
      navigate(PATHS.HOME, { replace: true })
    }
  }, [user, isAdmin, navigate])

  const bookingId = Number(id)

  const {
    data: booking,
    isLoading,
    isError
  } = useBookingByIdAdminQuery(bookingId, {
    enabled: !!bookingId && isAdmin
  })

  const [showParticipants, setShowParticipants] = useState(true)
  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [systemCancelOpen, setSystemCancelOpen] = useState(false)

  // Pagination and Search state
  const [page, setPage] = useState(0)
  const [pageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search term
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

  const approveMutation = useApproveBookingMutation()
  const rejectMutation = useRejectBookingMutation()
  const systemCancelMutation = useSystemCancelBookingMutation()

  const handleApprove = async (note: string) => {
    if (!booking) return

    try {
      await approveMutation.mutateAsync({
        id: booking.bookingRequestId,
        data: { responseNote: note || undefined }
      })
      toast.success('Đã duyệt đơn đăng ký thành công')
      setApproveOpen(false)
    } catch (error: unknown) {
      handleErrorApi({ error })
    }
  }

  const handleReject = async (reason: string) => {
    if (!booking) return
    try {
      await rejectMutation.mutateAsync({
        id: booking.bookingRequestId,
        data: { responseNote: reason }
      })
      toast.success('Đã từ chối đơn đăng ký thành công')
      setRejectOpen(false)
    } catch (error: unknown) {
      handleErrorApi({ error })
    }
  }

  const handleSystemCancel = async (reason: string) => {
    if (!booking) return

    try {
      await systemCancelMutation.mutateAsync({
        id: booking.bookingRequestId,
        data: { responseNote: reason }
      })
      toast.success('Đã hủy đơn bởi hệ thống thành công')
      setSystemCancelOpen(false)
    } catch (error: unknown) {
      handleErrorApi({ error })
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
      case 'SYSTEM_CANCELED':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusLabel = (status: string) => {
    return RequestStatusLabels[status as keyof typeof RequestStatusLabels] || status
  }

  const canApproveReject = booking.status === 'PENDING'
  const canSystemCancel = booking.status === 'APPROVED'

  return (
    <div className='w-full'>
      <div className='mb-8'>
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
          <div className='flex flex-col gap-1'>
            <div className='flex items-center gap-4'>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => navigate(-1)}
                className='rounded-full h-10 w-10 hover:bg-white transition-colors'
              >
                <ChevronLeft className='h-6 w-6' />
              </Button>
              <h1 className='text-2xl font-black tracking-tight text-[#153898] uppercase'>
                Quản trị - Chi tiết đặt phòng
              </h1>
              <Badge
                className={cn(
                  'font-bold h-7 px-4 rounded-full ml-2 hidden md:inline-flex border',
                  getStatusColor(booking.status)
                )}
              >
                {getStatusLabel(booking.status)}
              </Badge>
            </div>
            <p className='text-gray-500 font-medium ml-14'>
              Admin xem và xử lý đơn đăng ký đặt phòng Lab trên toàn hệ thống
            </p>
          </div>
          <div className='text-right hidden md:block'>
            <p className='text-[10px] uppercase font-bold text-gray-400'>ID Yêu cầu</p>
            <p className='text-lg font-mono font-bold text-gray-700'>#{booking.bookingRequestId}</p>
          </div>
        </div>
      </div>

      <Card className='border-none shadow-sm rounded-xl overflow-hidden'>
        <div className='md:hidden p-4 bg-white border-b border-gray-100 flex justify-between items-center'>
          <Badge className={cn('font-bold h-7 px-4 rounded-full border', getStatusColor(booking.status))}>
            {getStatusLabel(booking.status)}
          </Badge>
          <span className='text-sm font-mono font-bold text-gray-500'>#{booking.bookingRequestId}</span>
        </div>

        <CardContent className='p-6 space-y-8'>
          {/* 1. THÔNG TIN CHI TIẾT ĐẶT PHÒNG */}
          <section className='space-y-8'>
            <div className='flex items-center gap-2 text-[#153898] pb-2 border-b border-gray-100 mb-6'>
              <span className='font-black text-lg uppercase'>1. THÔNG TIN CHI TIẾT ĐẶT PHÒNG</span>
            </div>

            {/* Thông tin phòng & Mục đích */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-100'>
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

            {/* Ca học & Thiết bị */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-10'>
              <div className='space-y-4'>
                <h4 className='font-bold text-gray-700 flex items-center gap-2'>
                  <span className='w-1.5 h-1.5 rounded-full bg-[#153898]'></span>
                  Thời gian chi tiết
                </h4>
                <div className='flex flex-wrap gap-2'>
                  {booking.slots.map((slot) => (
                    <div
                      key={slot.slotId}
                      className='bg-white border-2 border-[#153898]/10 px-4 py-2 rounded-xl flex flex-col items-center shadow-sm'
                    >
                      <span className='text-[#153898] font-bold text-sm'>{slot.slotName}</span>
                      <span className='text-xs text-gray-500 font-mono'>
                        {slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {booking.devices && booking.devices.length > 0 && (
                <div className='space-y-4'>
                  <h4 className='font-bold text-gray-700 flex items-center gap-2'>
                    <span className='w-1.5 h-1.5 rounded-full bg-[#153898]'></span>
                    Thiết bị đi kèm
                  </h4>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                    {booking.devices.map((device, idx: number) => (
                      <div
                        key={idx}
                        className='flex justify-between items-center bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100 transition-all'
                      >
                        <span className='text-sm font-medium text-gray-700'>{device.deviceName}</span>
                        <Badge variant='outline' className='font-bold bg-white text-[#153898] rounded-xl'>
                          x{device.quantity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 2. DANH SÁCH THÀNH VIÊN */}
          <section className='space-y-6 pt-4'>
            <div className='flex items-center gap-2 text-[#153898] pb-2 border-b border-gray-100 mb-6'>
              <span className='font-black text-lg uppercase'>2. DANH SÁCH THÀNH VIÊN THAM GIA</span>
            </div>

            <div className='space-y-4'>
              <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                <div className='flex items-center gap-2'>
                  <h4 className='font-bold text-gray-700 flex items-center gap-2 text-lg'>
                    Thành viên tham gia
                    <Badge className='bg-[#153898]/10 text-[#153898] hover:bg-[#153898]/10 border-none font-bold'>
                      {booking.participantCount || 0}
                    </Badge>
                  </h4>
                  {isParticipantsLoading && <Loader2 className='h-4 w-4 animate-spin text-gray-400' />}
                </div>
                <div className='flex items-center gap-2'>
                  <div className='relative w-full sm:w-64'>
                    <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                    <Input
                      placeholder='Tìm kiếm...'
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className='pl-9 h-10 rounded-xl border-gray-200 focus:ring-blue-100 focus:border-blue-400'
                    />
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-10 text-[#153898] hover:text-blue-700 hover:bg-blue-50 font-bold gap-1 px-4'
                    onClick={() => setShowParticipants(!showParticipants)}
                  >
                    {showParticipants ? <ChevronUp className='h-4 w-4' /> : <ChevronDown className='h-4 w-4' />}
                    {showParticipants ? 'Ẩn danh sách' : 'Hiện danh sách'}
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
                          <th className='px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[15%]'>
                            Mã số
                          </th>
                          <th className='px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[35%]'>
                            Họ tên
                          </th>
                          <th className='px-4 py-3 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[15%]'>
                            Vai trò
                          </th>
                          <th className='px-4 py-3 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[15%]'>
                            Vào
                          </th>
                          <th className='px-4 py-3 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[15%]'>
                            Ra
                          </th>
                        </tr>
                      </thead>
                      <tbody className='bg-white divide-y divide-gray-100'>
                        {participantsData?.data.map((person, idx) => {
                          const stt = page * pageSize + idx + 1
                          return (
                            <tr key={person.username} className='hover:bg-gray-50/80 transition-colors'>
                              <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-500 font-medium text-center'>
                                {stt}
                              </td>
                              <td className='px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-900'>
                                {person.username}
                              </td>
                              <td className='px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-700'>
                                {person.fullName || '—'}
                              </td>
                              <td className='px-4 py-4 whitespace-nowrap text-center text-[11px] font-bold text-gray-600 uppercase'>
                                <span className='bg-slate-100 px-2 py-0.5 rounded'>
                                  {ParticipantRoleLabels[person.role as keyof typeof ParticipantRoleLabels] ||
                                    person.role}
                                </span>
                              </td>
                              <td className='px-4 py-4 whitespace-nowrap text-center'>
                                {person.checkinAt ? (
                                  <div className='flex flex-col items-center'>
                                    <span className='text-sm font-bold text-[#153898]'>
                                      {format(new Date(person.checkinAt), 'HH:mm')}
                                    </span>
                                    {person.checkinStatus === 'LATE' && person.lateCheckinMinutes && (
                                      <span className='text-[10px] text-red-500 mt-0.5 font-bold uppercase italic'>
                                        Trễ {person.lateCheckinMinutes}p
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className='text-gray-300 text-xs'>—</span>
                                )}
                              </td>
                              <td className='px-4 py-4 whitespace-nowrap text-center'>
                                {person.checkoutAt ? (
                                  <div className='flex flex-col items-center'>
                                    <span className='text-sm font-bold text-[#153898]'>
                                      {format(new Date(person.checkoutAt), 'HH:mm')}
                                    </span>
                                    {person.checkoutStatus === 'LEFT_EARLY' && person.earlyCheckoutMinutes && (
                                      <span className='text-[10px] text-orange-500 mt-0.5 font-bold uppercase italic'>
                                        Sớm {person.earlyCheckoutMinutes}p
                                      </span>
                                    )}
                                    {person.checkoutStatus === 'LATE_CHECKOUT' && person.lateCheckoutMinutes && (
                                      <span className='text-[10px] text-red-500 mt-0.5 font-bold uppercase italic'>
                                        Trễ {person.lateCheckoutMinutes}p
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className='text-gray-300 text-xs'>—</span>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                        {(!participantsData || participantsData.data.length === 0) && !isParticipantsLoading && (
                          <tr>
                            <td colSpan={6} className='px-4 py-12 text-center text-gray-400 italic'>
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
                      <div className='text-xs font-bold text-gray-400 uppercase tracking-widest'>
                        Trang {participantsData.page + 1} / {participantsData.totalPages}
                      </div>
                      <div className='flex gap-1'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => setPage((p) => Math.max(0, p - 1))}
                          disabled={participantsData.page === 0}
                          className='h-9 w-9 p-0 rounded-xl'
                        >
                          <ChevronLeft className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => setPage((p) => Math.min(participantsData.totalPages - 1, p + 1))}
                          disabled={participantsData.page === participantsData.totalPages - 1}
                          className='h-9 w-9 p-0 rounded-xl'
                        >
                          <ChevronRight className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* 3. Thông tin phê duyệt */}
          {booking.status !== RequestStatus.PENDING && (
            <section className='space-y-6 pt-6 border-t border-gray-100'>
              <div className='flex items-center gap-2 text-[#153898] pb-2 border-b border-gray-100 mb-6'>
                <span className='font-black text-lg uppercase'>
                  3. {booking.status === RequestStatus.APPROVED ? 'Thông tin phê duyệt' : 'Thông tin từ chối / hủy'}
                </span>
              </div>

              <div className='space-y-4'>
                <Label className='text-md font-semibold text-gray-700 uppercase'>
                  {booking.status === RequestStatus.APPROVED ? 'Ghi chú phê duyệt:' : 'Lý do từ chối / hủy:'}
                </Label>
                <div className='p-6 bg-gray-50 rounded-xl min-h-[100px] whitespace-pre-wrap transition-all cursor-default text-gray-700 font-medium text-lg border border-gray-100'>
                  {booking.responseNote || 'Không có ghi chú.'}
                </div>
              </div>

              {booking.responseBy && (
                <div className='pt-4 flex items-center gap-2 text-sm font-semibold text-gray-500 italic justify-end'>
                  <span>Được xử lý bởi</span>
                  <span className='underline underline-offset-2 capitalize text-gray-700 font-bold'>
                    {booking.responseBy.fullName || 'Hệ thống'}
                  </span>
                  <span>vào lúc</span>
                  <span className='text-gray-700 font-bold'>
                    {booking.responseDate ? format(new Date(booking.responseDate), 'HH:mm:ss dd/MM/yyyy') : '—'}
                  </span>
                </div>
              )}
            </section>
          )}
        </CardContent>

        <div className='px-8 py-6 bg-gray-50/30 border-t border-gray-100 flex flex-wrap gap-3 justify-end'>
          <Button variant='cancel' onClick={() => navigate(-1)}>
            Quay lại
          </Button>

          {canApproveReject && (
            <div className='flex gap-2'>
              <Button variant='approve' onClick={() => setApproveOpen(true)} disabled={approveMutation.isPending}>
                {approveMutation.isPending ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <Check className='h-4 w-4' />
                )}
                Chấp nhận
              </Button>
              <Button variant='reject' onClick={() => setRejectOpen(true)} disabled={rejectMutation.isPending}>
                {rejectMutation.isPending ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <XCircle className='h-4 w-4' />
                )}
                Từ chối
              </Button>
            </div>
          )}

          {canSystemCancel && (
            <Button
              variant='warning'
              className='h-11 px-6 rounded-xl flex gap-2 font-bold'
              onClick={() => setSystemCancelOpen(true)}
              disabled={systemCancelMutation.isPending}
            >
              {systemCancelMutation.isPending ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <Ban className='h-4 w-4' />
              )}
              Hủy đơn (Hệ thống)
            </Button>
          )}
        </div>
      </Card>

      <DialogApprove
        open={approveOpen}
        onOpenChange={setApproveOpen}
        onConfirm={handleApprove}
        title='Phê duyệt đơn đăng ký'
        isLoading={approveMutation.isPending}
      />

      <DialogReject
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        onConfirm={handleReject}
        title='Từ chối đơn đăng ký'
        reasons={BOOKING_REJECTION_REASONS}
        isLoading={rejectMutation.isPending}
      />

      <DialogReject
        open={systemCancelOpen}
        onOpenChange={setSystemCancelOpen}
        onConfirm={handleSystemCancel}
        title='Hủy đơn bởi hệ thống'
        confirmLabel='Xác nhận hủy hệ thống'
        confirmVariant='warning'
        reasons={[
          'Hủy theo yêu cầu của phòng quản trị',
          'Sự cố phòng Lab ngoài ý muốn',
          'Trùng lịch ưu tiên đột xuất',
          'Hủy do vi phạm quy định sử dụng',
          'Khác'
        ]}
        description='Việc hủy bởi hệ thống sẽ thông báo đến người sử dụng và giải phóng phòng ngay lập tức.'
        isLoading={systemCancelMutation.isPending}
      />
    </div>
  )
}

export default AdminBookingDetailPage
