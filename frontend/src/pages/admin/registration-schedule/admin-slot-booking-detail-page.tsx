import React, { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import {
  Clock,
  Users,
  User,
  CheckCircle,
  XCircle,
  Search,
  GraduationCap,
  Loader2,
  Box,
  ChevronLeft,
  Info
} from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import {
  useSlotBookingDetailQuery,
  useSlotBookingDetailParticipantsQuery,
  useApproveBookingMutation,
  useRejectBookingMutation,
  useBulkApproveBookingsMutation,
  useBulkRejectBookingsMutation
} from '@/queries/booking.queries'
import { BookingType, RequestStatus, BookingTypeLabels, RequestStatusLabels } from '@/constants/types'
import { deviceIconMap } from '@/utils/icon'
import { PATHS } from '@/constants/paths'

import { ParticipantsTable } from '@/components/admin/registration-schedule/participants-table'
import { ThesisSidebarItem } from '@/components/admin/registration-schedule/thesis-sidebar-item'
import { GroupSidebarItem } from '@/components/admin/registration-schedule/group-sidebar-item'
import { AggregatedPersonalItem } from '@/components/admin/registration-schedule/aggregated-personal-item'
import { AggregatedRequestsView } from '@/components/admin/registration-schedule/aggregated-requests-view'
import { DialogApprove } from '@/components/common/dialog-approve'
import { DialogReject } from '@/components/common/dialog-reject'
import { toast } from 'sonner'
import { handleErrorApi } from '@/utils/error-handler'

const AdminSlotBookingDetailPage = () => {
  const { roomId, slotId, date } = useParams<{ roomId: string; slotId: string; date: string }>()
  const navigate = useNavigate()

  const labRoomId = roomId ? parseInt(roomId, 10) : undefined
  const slotIdNum = slotId ? parseInt(slotId, 10) : undefined
  const bookingDate = date

  const { data: slotDetail, isLoading: isLoadingDetail } = useSlotBookingDetailQuery(
    { labRoomId: labRoomId!, slotId: slotIdNum!, bookingDate: bookingDate! },
    { enabled: !!labRoomId && !!slotIdNum && !!bookingDate }
  )

  const approveMutation = useApproveBookingMutation()
  const rejectMutation = useRejectBookingMutation()
  const bulkApproveMutation = useBulkApproveBookingsMutation()
  const bulkRejectMutation = useBulkRejectBookingsMutation()

  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [actionIds, setActionIds] = useState<number[]>([])
  const [isBulk, setIsBulk] = useState(false)

  const onApprove = (id: number) => {
    setActionIds([id])
    setIsBulk(false)
    setApproveDialogOpen(true)
  }

  const onBulkApprove = (ids: number[]) => {
    setActionIds(ids)
    setIsBulk(true)
    setApproveDialogOpen(true)
  }

  const onReject = (id: number) => {
    setActionIds([id])
    setIsBulk(false)
    setRejectDialogOpen(true)
  }

  const handleApproveConfirm = async (note: string) => {
    if (actionIds.length === 0) return
    try {
      if (actionIds.length === 1 && !isBulk) {
        await approveMutation.mutateAsync({ id: actionIds[0], data: { responseNote: note || undefined } })
      } else {
        await bulkApproveMutation.mutateAsync({ requestIds: actionIds, data: { responseNote: note || undefined } })
      }
      toast.success('Đã duyệt yêu cầu thành công')
      setApproveDialogOpen(false)
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  const handleRejectConfirm = async (reason: string) => {
    if (actionIds.length === 0) return
    try {
      if (actionIds.length === 1 && !isBulk) {
        await rejectMutation.mutateAsync({ id: actionIds[0], data: { responseNote: reason } })
      } else {
        await bulkRejectMutation.mutateAsync({ requestIds: actionIds, data: { responseNote: reason } })
      }
      toast.success('Đã từ chối yêu cầu thành công')
      setRejectDialogOpen(false)
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  const roomData = useMemo(
    () => ({
      name: slotDetail?.roomName || 'Phòng Lab',
      capacity: slotDetail?.roomCapacity || 40
    }),
    [slotDetail]
  )

  const slotData = useMemo(
    () => ({
      name: slotDetail?.slotName || 'Ca',
      date: slotDetail?.bookingDate || bookingDate || '',
      startTime: slotDetail?.startTime || '',
      endTime: slotDetail?.endTime || ''
    }),
    [slotDetail, bookingDate]
  )

  const bookings = useMemo(() => slotDetail?.bookings || [], [slotDetail])

  const [selectedId, setSelectedId] = useState<number | string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const selectedBookingId = typeof selectedId === 'number' ? selectedId : null
  const { data: participants, isLoading: isLoadingParticipants } = useSlotBookingDetailParticipantsQuery(
    selectedBookingId!,
    { enabled: !!selectedBookingId }
  )

  React.useEffect(() => {
    if (!selectedId && bookings.length > 0) {
      const approvedBooking = bookings.find((b) => b.status === RequestStatus.APPROVED)
      if (approvedBooking) {
        if (approvedBooking.bookingType === BookingType.PERSONAL) {
          setSelectedId('APPROVED_PERSONAL_GROUP')
        } else {
          setSelectedId(approvedBooking.bookingRequestId)
        }
        return
      }

      const firstBooking = bookings[0]
      if (firstBooking.bookingType === BookingType.PERSONAL) {
        setSelectedId(
          firstBooking.status === RequestStatus.APPROVED ? 'APPROVED_PERSONAL_GROUP' : 'PENDING_PERSONAL_GROUP'
        )
      } else {
        setSelectedId(firstBooking.bookingRequestId)
      }
    }
  }, [selectedId, bookings])

  const handleOpenApprove = (id: number, type: string) => {
    if (type === BookingType.THESIS) {
      if (confirm('⚠️ CẢNH BÁO: Duyệt yêu cầu Khóa Luận (Thesis) sẽ chiếm trọn phòng.')) {
        onApprove(id)
      }
    } else {
      onApprove(id)
    }
  }

  const { stats, sidebarItems, personalGroupData } = useMemo(() => {
    const filtered = bookings.filter((b) => {
      if (
        searchTerm &&
        !b.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !b.purpose.toLowerCase().includes(searchTerm.toLowerCase())
      )
        return false
      return true
    })

    const allActiveList = filtered.filter(
      (b) => b.status === RequestStatus.APPROVED || b.status === RequestStatus.PENDING
    )
    const approvedList = filtered.filter((b) => b.status === RequestStatus.APPROVED)
    const pendingList = filtered.filter((b) => b.status === RequestStatus.PENDING)

    const approvedThesis = approvedList.filter((b) => b.bookingType === BookingType.THESIS)
    const approvedGroups = approvedList.filter((b) => b.bookingType === BookingType.GROUP)
    const approvedPersonal = approvedList.filter((b) => b.bookingType === BookingType.PERSONAL)
    const pendingPersonal = pendingList.filter((b) => b.bookingType === BookingType.PERSONAL)
    const pendingOthers = pendingList.filter((b) => b.bookingType !== BookingType.PERSONAL)

    const rejectedList = filtered.filter(
      (b) =>
        b.status === RequestStatus.REJECTED ||
        b.status === RequestStatus.CANCELED ||
        b.status === RequestStatus.SYSTEM_CANCELED
    )

    const occupied = allActiveList.reduce((acc, cur) => acc + (cur.participantCount || 0), 0)
    const available = (roomData.capacity || 40) - occupied

    let statusColor = 'text-[#22c55e]',
      statusText = `Còn trống ${available} chỗ`

    if (approvedThesis.length > 0 || pendingOthers.some((b) => b.bookingType === BookingType.THESIS)) {
      statusColor = 'text-purple-600'
      statusText = 'Có lịch khóa luận'
    } else if (available <= 0) {
      statusColor = 'text-destructive'
      statusText = 'Đã hết chỗ'
    }

    return {
      stats: {
        available,
        statusColor,
        statusText,
        capacity: roomData.capacity || 40,
        currentOccupants: occupied
      },
      sidebarItems: {
        approvedThesis,
        approvedGroups,
        approvedPersonal,
        pendingOthers,
        pendingPersonal,
        rejectedList
      },
      personalGroupData: { approved: approvedPersonal, pending: pendingPersonal }
    }
  }, [bookings, roomData, searchTerm])

  const selectedBooking = bookings.find((b) => b.bookingRequestId === Number(selectedId))

  if (isLoadingDetail) {
    return (
      <div className='flex-1 flex items-center justify-center min-h-[60vh]'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
        <span className='ml-3 text-gray-500 font-medium'>Đang tải dữ liệu...</span>
      </div>
    )
  }

  return (
    <div className='w-full space-y-6 font-sans antialiased text-[#333]'>
      {/* Header */}
      <div className='mb-2'>
        <div className='flex flex-col md:flex-row md:items-end justify-between gap-6'>
          <div className='flex flex-col gap-1'>
            <div className='flex items-center gap-4'>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => navigate(PATHS.ADMIN.REGISTRATION_SCHEDULE)}
                className='rounded-full h-10 w-10 hover:bg-white shrink-0'
              >
                <ChevronLeft className='h-6 w-6' />
              </Button>
              <div className='flex flex-col'>
                <div className='flex items-center gap-3'>
                  <h1 className='text-3xl font-black tracking-tight text-primary uppercase'>
                    {roomData.name} — {slotData.name}
                  </h1>
                  <Badge variant='secondary' className='h-5 px-2 text-[10px] font-black uppercase'>
                    {slotData.date}
                  </Badge>
                </div>
              </div>
            </div>
            <div className='flex items-center gap-4 ml-14 text-gray-500 font-bold'>
              <div className='flex items-center gap-1.5'>
                <Clock className='h-4 w-4' />
                <span className='text-sm uppercase tracking-tight'>
                  {slotData.startTime} - {slotData.endTime}
                </span>
              </div>
              <div className='flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full border border-gray-100'>
                <Info className='h-4 w-4 text-primary shrink-0' />
                <span className={`text-xs uppercase tracking-tighter ${stats.statusColor}`}>
                  {stats.statusText} ({stats.currentOccupants}/{stats.capacity})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='flex gap-6 min-h-[70vh]'>
        {/* Sidebar */}
        <div className='w-80 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col'>
          <div className='p-4 border-b border-gray-100'>
            <div className='relative'>
              <Search className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
              <Input
                placeholder='Tìm kiếm...'
                className='pl-10 h-10'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <ScrollArea className='flex-1 p-4'>
            <Accordion type='multiple' defaultValue={['approved', 'pending']} className='w-full'>
              <AccordionItem value='approved' className='border-none'>
                <AccordionTrigger className='hover:no-underline py-3'>
                  <div className='flex items-center justify-between w-full pr-2'>
                    <h3 className='text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5'>
                      <CheckCircle size={14} className='text-green-600' /> ĐÃ DUYỆT
                    </h3>
                    <Badge variant='success-soft' className='h-5 text-xs px-2'>
                      {sidebarItems.approvedThesis.length +
                        sidebarItems.approvedGroups.length +
                        sidebarItems.approvedPersonal.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className='pt-2 pb-4'>
                  <div className='space-y-2'>
                    {sidebarItems.approvedThesis.map((b) => (
                      <ThesisSidebarItem
                        key={b.bookingRequestId}
                        booking={b}
                        isSelected={selectedId === b.bookingRequestId}
                        onClick={() => setSelectedId(b.bookingRequestId)}
                      />
                    ))}
                    {sidebarItems.approvedGroups.map((b) => (
                      <GroupSidebarItem
                        key={b.bookingRequestId}
                        booking={b}
                        isSelected={selectedId === b.bookingRequestId}
                        onClick={() => setSelectedId(b.bookingRequestId)}
                      />
                    ))}
                    {sidebarItems.approvedPersonal.length > 0 && (
                      <AggregatedPersonalItem
                        count={sidebarItems.approvedPersonal.length}
                        isSelected={selectedId === 'APPROVED_PERSONAL_GROUP'}
                        onClick={() => setSelectedId('APPROVED_PERSONAL_GROUP')}
                      />
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value='pending' className='border-none'>
                <AccordionTrigger className='hover:no-underline py-3'>
                  <div className='flex items-center justify-between w-full pr-2'>
                    <h3 className='text-xs font-black text-gray-500 uppercase tracking-wider flex items-center gap-1.5'>
                      <Clock size={14} className='text-yellow-500' /> CHỜ DUYỆT
                    </h3>
                    <Badge variant='warning-soft' className='h-5 text-xs px-2'>
                      {sidebarItems.pendingOthers.length + sidebarItems.pendingPersonal.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className='pt-2 pb-4'>
                  <div className='space-y-2'>
                    {sidebarItems.pendingOthers.map((b) =>
                      b.bookingType === BookingType.THESIS ? (
                        <ThesisSidebarItem
                          key={b.bookingRequestId}
                          booking={b}
                          isSelected={selectedId === b.bookingRequestId}
                          onClick={() => setSelectedId(b.bookingRequestId)}
                        />
                      ) : (
                        <GroupSidebarItem
                          key={b.bookingRequestId}
                          booking={b}
                          isSelected={selectedId === b.bookingRequestId}
                          onClick={() => setSelectedId(b.bookingRequestId)}
                        />
                      )
                    )}
                    {sidebarItems.pendingPersonal.length > 0 && (
                      <AggregatedPersonalItem
                        count={sidebarItems.pendingPersonal.length}
                        isSelected={selectedId === 'PENDING_PERSONAL_GROUP'}
                        onClick={() => setSelectedId('PENDING_PERSONAL_GROUP')}
                      />
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {sidebarItems.rejectedList.length > 0 && (
                <AccordionItem value='history' className='border-none'>
                  <AccordionTrigger className='hover:no-underline py-3'>
                    <div className='flex items-center justify-between w-full pr-2'>
                      <h3 className='text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5'>
                        <XCircle size={14} className='text-gray-400' /> LỊCH SỬ
                      </h3>
                      <Badge variant='outline' className='h-5 text-xs px-2'>
                        {sidebarItems.rejectedList.length}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className='pt-2 pb-4'>
                    <div className='space-y-2 opacity-70 grayscale-[0.5]'>
                      {sidebarItems.rejectedList.map((b) =>
                        b.bookingType === BookingType.THESIS ? (
                          <ThesisSidebarItem
                            key={b.bookingRequestId}
                            booking={b}
                            isSelected={selectedId === b.bookingRequestId}
                            onClick={() => setSelectedId(b.bookingRequestId)}
                          />
                        ) : (
                          <GroupSidebarItem
                            key={b.bookingRequestId}
                            booking={b}
                            isSelected={selectedId === b.bookingRequestId}
                            onClick={() => setSelectedId(b.bookingRequestId)}
                          />
                        )
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </ScrollArea>
        </div>

        {/* Main Panel */}
        <div className='flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden'>
          {selectedId === 'APPROVED_PERSONAL_GROUP' ? (
            <AggregatedRequestsView
              title='Sinh viên tự học (Đã duyệt)'
              requests={personalGroupData.approved}
              onApprove={onApprove}
              onReject={onReject}
              isApprovedMode={true}
            />
          ) : selectedId === 'PENDING_PERSONAL_GROUP' ? (
            <AggregatedRequestsView
              title='Yêu cầu cá nhân (Chờ duyệt)'
              requests={personalGroupData.pending}
              onApprove={onApprove}
              onReject={onReject}
              onBulkApprove={onBulkApprove}
            />
          ) : selectedBooking ? (
            <div className='flex flex-col h-full'>
              <div className='px-8 py-6 border-b border-gray-100 bg-gray-50/50 shrink-0'>
                <div className='flex justify-between items-start'>
                  <div>
                    <div className='flex items-center gap-2 mb-2'>
                      <Badge variant={selectedBooking.status.toLowerCase() as BadgeVariant} className='text-xs'>
                        {RequestStatusLabels[selectedBooking.status as keyof typeof RequestStatusLabels] ||
                          selectedBooking.status}
                      </Badge>
                      <Badge
                        variant={
                          (selectedBooking.bookingType === BookingType.GROUP
                            ? 'research'
                            : selectedBooking.bookingType.toLowerCase()) as BadgeVariant
                        }
                        className='text-xs'
                      >
                        {BookingTypeLabels[selectedBooking.bookingType as keyof typeof BookingTypeLabels] ||
                          selectedBooking.bookingType}
                      </Badge>
                    </div>
                    <h2 className='text-2xl font-bold text-primary leading-tight mb-1'>
                      {selectedBooking.groupName || selectedBooking.purpose}
                    </h2>
                    {selectedBooking.groupName && (
                      <div className='text-sm text-gray-500 mb-2 font-medium italic'>
                        Mục đích: {selectedBooking.purpose}
                      </div>
                    )}

                    <div className='flex flex-wrap items-center gap-y-3 gap-x-8 text-sm text-gray-600 mt-3'>
                      {selectedBooking.leaderName && (
                        <div className='flex items-center gap-2.5'>
                          <GraduationCap size={18} className='text-primary' />
                          <span className='font-bold uppercase text-xs text-gray-500'>GVHD:</span>
                          <span className='font-semibold text-gray-900'>
                            {selectedBooking.leaderName}{' '}
                            {selectedBooking.leaderUsername && (
                              <span className='text-gray-400 font-mono text-sm'>
                                ({selectedBooking.leaderUsername})
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                      <div className='flex items-center gap-2.5'>
                        <User size={18} />
                        <span className='font-bold uppercase text-xs text-gray-500'>Người đăng ký:</span>
                        <span className='font-semibold text-gray-900'>
                          {selectedBooking.requesterName}{' '}
                          {selectedBooking.requesterUsername && (
                            <span className='text-gray-400 font-mono text-sm'>
                              ({selectedBooking.requesterUsername})
                            </span>
                          )}
                        </span>
                      </div>
                      <div className='flex items-center gap-2.5'>
                        <Users size={18} className='text-primary' />
                        <span className='font-semibold text-gray-900'>
                          {selectedBooking.participantCount} thành viên
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedBooking.status === RequestStatus.PENDING && (
                    <div className='flex gap-2'>
                      <Button variant='reject' onClick={() => onReject(selectedBooking.bookingRequestId)}>
                        <XCircle size={16} className='mr-2' /> Từ chối
                      </Button>
                      <Button
                        variant='approve'
                        onClick={() => handleOpenApprove(selectedBooking.bookingRequestId, selectedBooking.bookingType)}
                      >
                        <CheckCircle size={16} className='mr-2' /> Duyệt ngay
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <ScrollArea className='flex-1 p-8'>
                <div className='w-full space-y-8 pb-10'>
                  <section>
                    <div className='flex items-center gap-2 mb-3'>
                      <Users className='text-primary h-5 w-5' />
                      <h3 className='font-bold text-gray-800 text-sm uppercase tracking-wide'>
                        Danh sách thành viên ({selectedBooking.participantCount})
                      </h3>
                    </div>
                    <ParticipantsTable participants={participants} isLoading={isLoadingParticipants} />
                  </section>

                  {selectedBooking.devices && selectedBooking.devices.length > 0 && (
                    <section>
                      <div className='flex items-center gap-2 mb-3'>
                        <Box className='text-primary h-5 w-5' />
                        <h3 className='font-bold text-gray-800 text-sm uppercase tracking-wide'>
                          Thiết bị đã thuê ({selectedBooking.devices.length})
                        </h3>
                      </div>
                      <div className='border rounded-lg overflow-hidden bg-white shadow-sm'>
                        <table className='w-full text-sm text-left'>
                          <thead className='bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-xs font-bold'>
                            <tr>
                              <th className='px-6 py-4'>STT</th>
                              <th className='px-6 py-4'>Thiết bị</th>
                              <th className='px-6 py-4'>Loại</th>
                              <th className='px-6 py-4 text-center'>Số lượng</th>
                            </tr>
                          </thead>
                          <tbody className='divide-y divide-gray-50'>
                            {selectedBooking.devices.map((device, idx) => {
                              const iconName = (device.icon || 'default') as keyof typeof deviceIconMap
                              const IconComponent = deviceIconMap[iconName] || deviceIconMap.default
                              return (
                                <tr key={device.deviceId} className='hover:bg-blue-50/50 transition-colors'>
                                  <td className='px-6 py-4 font-medium text-gray-500 w-16 text-center text-sm'>
                                    {idx + 1}
                                  </td>
                                  <td className='px-6 py-4 font-bold text-gray-700 text-sm'>
                                    <div className='flex items-center gap-3'>
                                      <div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center'>
                                        <IconComponent className='h-4 w-4 text-primary' />
                                      </div>
                                      {device.deviceName}
                                    </div>
                                  </td>
                                  <td className='px-6 py-4 text-gray-600 text-sm'>{device.deviceType || 'N/A'}</td>
                                  <td className='px-6 py-4 text-center'>
                                    <Badge variant='secondary' className='text-xs px-2.5 h-6'>
                                      x{device.quantity}
                                    </Badge>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  )}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className='flex-1 flex items-center justify-center text-gray-400'>
              <div className='text-center'>
                <Users className='h-16 w-16 mx-auto mb-4 opacity-30' />
                <p className='font-medium'>Chọn một yêu cầu để xem chi tiết</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <DialogApprove
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
        onConfirm={handleApproveConfirm}
        title={isBulk ? 'Xác nhận duyệt tất cả' : 'Xác nhận duyệt yêu cầu'}
        description={isBulk ? `Bạn có chắc chắn muốn duyệt tất cả ${actionIds.length} yêu cầu này?` : undefined}
        isLoading={approveMutation.isPending || bulkApproveMutation.isPending}
      />

      <DialogReject
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        onConfirm={handleRejectConfirm}
        title={isBulk ? 'Xác nhận từ chối tất cả' : 'Xác nhận từ chối yêu cầu'}
        description={isBulk ? `Vui lòng cho biết lý do từ chối ${actionIds.length} yêu cầu này.` : undefined}
        isLoading={rejectMutation.isPending || bulkRejectMutation.isPending}
        reasons={[
          'Phòng đã được đặt cho mục đích khác',
          'Số lượng thành viên không phù hợp',
          'Thông tin đăng ký chưa rõ ràng'
        ]}
      />
    </div>
  )
}

export default AdminSlotBookingDetailPage
