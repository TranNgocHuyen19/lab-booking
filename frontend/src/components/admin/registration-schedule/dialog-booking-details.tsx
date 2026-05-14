import React, { useMemo, useState } from 'react'
import {
  Calendar,
  Clock,
  Building,
  Users,
  User,
  CheckCircle,
  XCircle,
  Search,
  GraduationCap,
  Loader2,
  Box
} from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import {
  useSlotBookingDetailQuery,
  useSlotBookingDetailParticipantsQuery,
  useApproveBookingMutation,
  useRejectBookingMutation
} from '@/queries/booking.queries'
import { BookingType, RequestStatus, BookingTypeLabels, RequestStatusLabels } from '@/constants/types'
import { deviceIconMap } from '@/utils/icon'

import { ParticipantsTable } from './participants-table'
import { ThesisSidebarItem } from './thesis-sidebar-item'
import { GroupSidebarItem } from './group-sidebar-item'
import { AggregatedPersonalItem } from './aggregated-personal-item'
import { AggregatedRequestsView } from './aggregated-requests-view'

interface Props {
  isOpen: boolean
  onClose: () => void
  labRoomId?: number
  slotId?: number
  bookingDate?: string
}

export const DialogBookingDetails = ({ isOpen, onClose, labRoomId, slotId, bookingDate }: Props) => {
  const { data: slotDetail, isLoading: isLoadingDetail } = useSlotBookingDetailQuery(
    { labRoomId: labRoomId!, slotId: slotId!, bookingDate: bookingDate! },
    { enabled: isOpen && !!labRoomId && !!slotId && !!bookingDate }
  )

  const approveMutation = useApproveBookingMutation()
  const rejectMutation = useRejectBookingMutation()

  const onApprove = (id: number) => approveMutation.mutate({ id })
  const onReject = (id: number) => rejectMutation.mutate({ id, data: { responseNote: 'Từ chối bởi Admin' } })

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
    if (isOpen && !selectedId && bookings.length > 0) {
      if (bookings.some((b) => b.status === RequestStatus.APPROVED)) {
        setSelectedId(bookings.find((b) => b.status === RequestStatus.APPROVED)?.bookingRequestId || null)
      } else {
        setSelectedId(bookings[0].bookingRequestId)
      }
    }
  }, [isOpen, selectedId, bookings])

  const handleApprove = (id: number, type: string) => {
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

    const available =
      (roomData.capacity || 40) - approvedList.reduce((acc, cur) => acc + (cur.participantCount || 0), 0)
    let statusColor = 'text-[#22c55e]',
      statusText = `Còn trống ${available} chỗ`
    if (approvedThesis.length > 0) {
      statusColor = 'text-purple-600'
      statusText = 'Đang bảo vệ khóa luận (KÍN)'
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
        currentOccupants: (roomData.capacity || 40) - available
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

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className='rounded-xl max-w-[95vw] lg:max-w-7xl p-0 overflow-hidden flex flex-col h-[90vh]'>
        {isLoadingDetail ? (
          <div className='flex-1 flex items-center justify-center'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
            <span className='ml-3 text-gray-500 font-medium'>Đang tải dữ liệu...</span>
          </div>
        ) : (
          <>
            <DialogHeader className='px-6 py-4 border-b border-gray-100 bg-gray-50/50 space-y-0 shrink-0 flex-row items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div className='bg-white p-2 rounded-xl border shadow-sm'>
                  <Building className='h-6 w-6 text-primary' />
                </div>
                <div>
                  <DialogTitle className='text-lg font-bold text-gray-800 flex items-center gap-2'>
                    {roomData.name} <span className='text-gray-300 font-light'>&mdash;</span> {slotData.name}
                  </DialogTitle>
                  <div className='flex items-center gap-3 text-xs text-gray-500 font-medium mt-1'>
                    <span className='flex items-center gap-1.5'>
                      <Calendar className='h-3.5 w-3.5' /> {slotData.date}
                    </span>
                    <span className='flex items-center gap-1.5'>
                      <Clock className='h-3.5 w-3.5' /> {slotData.startTime} - {slotData.endTime}
                    </span>
                  </div>
                </div>
              </div>

              <div className='flex items-center gap-3 bg-white pl-4 pr-1 py-1 rounded-full border border-gray-200 shadow-sm'>
                <div className='text-right mr-2'>
                  <div className='text-[10px] text-gray-400 font-bold uppercase'>Sức chứa</div>
                  <div className={`text-xs font-bold ${stats.statusColor}`}>{stats.statusText}</div>
                </div>
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border-2 ${stats.available <= 0 ? 'border-destructive bg-red-50 text-destructive' : 'border-green-500 bg-green-50 text-primary'}`}
                >
                  {stats.currentOccupants}/{stats.capacity}
                </div>
              </div>
            </DialogHeader>

            <div className='flex flex-1 overflow-hidden bg-[#f8f9fa]'>
              <div className='w-1/3 max-w-sm border-r border-gray-200 bg-white flex flex-col'>
                <div className='p-3 border-b border-gray-100 bg-white flex gap-2'>
                  <div className='relative flex-1'>
                    <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-gray-400' />
                    <Input
                      placeholder='Tìm kiếm...'
                      className='pl-8 h-9 text-xs'
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <ScrollArea className='flex-1'>
                  <Accordion type='multiple' defaultValue={['approved', 'pending']} className='w-full'>
                    <AccordionItem value='approved' className='border-none px-3'>
                      <AccordionTrigger className='hover:no-underline py-4'>
                        <div className='flex items-center justify-between w-full pr-2'>
                          <h3 className='text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5'>
                            <CheckCircle size={14} className='text-green-600' /> ĐÃ DUYỆT / HOẠT ĐỘNG
                          </h3>
                          <Badge
                            variant='success-soft'
                            className='h-4 text-[10px] px-1.5 min-w-[20px] flex justify-center'
                          >
                            {sidebarItems.approvedThesis.length +
                              sidebarItems.approvedGroups.length +
                              sidebarItems.approvedPersonal.length}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className='pt-1 pb-4'>
                        <div className='space-y-1'>
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

                    <AccordionItem value='pending' className='border-none px-3'>
                      <AccordionTrigger className='hover:no-underline py-4'>
                        <div className='flex items-center justify-between w-full pr-2'>
                          <h3 className='text-xs font-black text-gray-500 uppercase tracking-wider flex items-center gap-1.5'>
                            <Clock size={14} className='text-yellow-500' /> YÊU CẦU CHỜ XỬ LÝ
                          </h3>
                          <Badge
                            variant='warning-soft'
                            className='h-4 text-[10px] px-1.5 min-w-[20px] flex justify-center'
                          >
                            {sidebarItems.pendingOthers.length + sidebarItems.pendingPersonal.length}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className='pt-1 pb-4'>
                        <div className='space-y-1'>
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
                      <AccordionItem value='history' className='border-none px-3'>
                        <AccordionTrigger className='hover:no-underline py-4'>
                          <div className='flex items-center justify-between w-full pr-2'>
                            <h3 className='text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5'>
                              <XCircle size={14} className='text-gray-400' /> LỊCH SỬ / TỪ CHỐI
                            </h3>
                            <Badge
                              variant='outline'
                              className='h-4 text-[10px] px-1.5 min-w-[20px] flex justify-center'
                            >
                              {sidebarItems.rejectedList.length}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className='pt-1 pb-4'>
                          <div className='space-y-1 opacity-70 grayscale-[0.5]'>
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

              <div className='flex-1 flex flex-col bg-gray-50/50 overflow-hidden'>
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
                  />
                ) : selectedBooking ? (
                  <div className='flex flex-col h-full animate-in fade-in duration-200'>
                    <div className='px-8 py-6 border-b border-gray-100 bg-white shadow-sm shrink-0'>
                      <div className='flex justify-between items-start mb-4'>
                        <div>
                          <div className='flex items-center gap-2 mb-2'>
                            <Badge variant={selectedBooking.status.toLowerCase() as BadgeVariant} className='text-xs'>
                              {RequestStatusLabels[selectedBooking.status as keyof typeof RequestStatusLabels] ||
                                selectedBooking.status}
                            </Badge>
                            <Badge
                              variant={selectedBooking.bookingType.toLowerCase() as BadgeVariant}
                              className='text-xs'
                            >
                              {BookingTypeLabels[selectedBooking.bookingType as keyof typeof BookingTypeLabels] ||
                                selectedBooking.bookingType}
                            </Badge>
                          </div>
                          <h2 className='text-xl font-bold text-primary leading-tight mb-1'>
                            {selectedBooking.groupName || selectedBooking.purpose}
                          </h2>
                          {selectedBooking.groupName && (
                            <div className='text-sm text-gray-500 mb-2 font-medium italic'>
                              Mục đích: {selectedBooking.purpose}
                            </div>
                          )}

                          <div className='flex flex-wrap items-center gap-y-3 gap-x-8 text-sm text-gray-600 mt-2'>
                            {selectedBooking.leaderName && (
                              <div className='flex items-center gap-2.5'>
                                <GraduationCap size={18} className='text-primary' />
                                <span className='font-bold uppercase text-xs text-gray-500'>GVHD:</span>
                                <span className='font-semibold text-gray-900 text-base'>
                                  {selectedBooking.leaderName}{' '}
                                  {selectedBooking.leaderUsername && (
                                    <span className='text-gray-400 font-mono text-sm ml-1'>
                                      ({selectedBooking.leaderUsername})
                                    </span>
                                  )}
                                </span>
                              </div>
                            )}
                            <div className='flex items-center gap-2.5'>
                              <User size={18} />
                              <span className='font-bold uppercase text-xs text-gray-500'>Người đăng ký:</span>
                              <span className='font-semibold text-gray-900 text-base'>
                                {selectedBooking.requesterName}{' '}
                                {selectedBooking.requesterUsername && (
                                  <span className='text-gray-400 font-mono text-sm ml-1'>
                                    ({selectedBooking.requesterUsername})
                                  </span>
                                )}
                              </span>
                            </div>
                            <div className='flex items-center gap-2.5'>
                              <Users size={18} className='text-primary' />
                              <span className='font-semibold text-gray-900 text-base'>
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
                              onClick={() =>
                                handleApprove(selectedBooking.bookingRequestId, selectedBooking.bookingType)
                              }
                            >
                              <CheckCircle size={16} className='mr-2' /> Duyệt ngay
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <ScrollArea className='flex-1 p-8'>
                      <div className='max-w-4xl space-y-8 pb-10'>
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
                                        <td className='px-6 py-4 text-gray-600 text-sm'>
                                          {device.deviceType || 'N/A'}
                                        </td>
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
                ) : null}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
