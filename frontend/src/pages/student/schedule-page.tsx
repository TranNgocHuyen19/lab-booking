import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { LayoutGrid, Calendar as CalendarIcon } from 'lucide-react'
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, parseISO } from 'date-fns'
import { useLabRoomsQuery, useLabRoomByIdQuery } from '@/queries/lab-room.queries'
import { useSlotsQuery } from '@/queries/slot.queries'
import { useWeekScheduleQuery } from '@/queries/lab-room-schedule.queries'
import { useMyBookingsQuery } from '@/queries/booking.queries'
import { useJoinedGroupsQuery } from '@/queries/research-group.queries'
import { RoomStatusOptions, BookingStatusOptions } from '@/constants/types'

import { useAuth } from '@/hooks/use-auth'
import { LoginRequiredDialog } from '@/components/common/dialog-login-required'
import { LabRoomScheduleTable } from '@/components/common/labroom-schedule-table'
import { MyBookingScheduleTable } from '@/components/common/booking-schedule-table'
import { ScheduleHeader } from '@/components/common/schedule-header'
import { StudentBookingForm } from '@/components/student/booking-registration-form'
import type { BookingDeviceResponse } from '@/schemas/booking.schema'
import type { LabRoomDeviceResponse } from '@/schemas/lab-room-device.schema'

const StudentSchedulePage = () => {
  const { isAuthenticated, user: currentUser } = useAuth()
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<'VIEW_ROOMS' | 'MY_BOOKINGS'>('VIEW_ROOMS')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [searchKeyword, setSearchKeyword] = useState(searchParams.get('search') || '')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [selectedRoom, setSelectedRoom] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [showLoginDialog, setShowLoginDialog] = useState(false)

  // Booking Selection State
  const [selection, setSelection] = useState<{ roomId: number; date: string; slotIds: number[] } | null>(null)

  // Hooks for room name
  const { data: currentRoom } = useLabRoomByIdQuery(selection?.roomId || 0)

  const handleSlotSelect = (roomId: number, date: string, slotId: number) => {
    setSelection((prev) => {
      if (prev?.roomId !== roomId || prev?.date !== date) {
        return { roomId, date, slotIds: [slotId] }
      }
      const newSlots = prev.slotIds.includes(slotId)
        ? prev.slotIds.filter((id) => id !== slotId)
        : [...prev.slotIds, slotId]

      if (newSlots.length === 0) return null
      return { ...prev, slotIds: newSlots }
    })
  }

  const handleCancelBooking = () => {
    setSelection(null)
  }

  const handleSuccessBooking = () => {
    setSelection(null)
  }

  const { data: labRoomsData, isLoading: isLoadingRoomsList } = useLabRoomsQuery({ limit: 50 })
  const { data: slotsData, isLoading: isLoadingSlots } = useSlotsQuery({ limit: 50 })
  const { data: scheduleRes, isLoading: isLoadingSchedule } = useWeekScheduleQuery({
    date: format(currentDate, 'yyyy-MM-dd')
  })
  const { data: myBookings = [], isLoading: isLoadingMyBookings } = useMyBookingsQuery({
    enabled: activeTab === 'MY_BOOKINGS' && isAuthenticated
  })

  const labRoomsList = useMemo(() => labRoomsData?.data?.data || [], [labRoomsData])
  const slots = useMemo(() => slotsData?.data?.data || [], [slotsData])
  const scheduleData = useMemo(() => scheduleRes, [scheduleRes])

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 })
    return Array.from({ length: 7 }).map((_, i) => {
      const date = addDays(start, i)
      return {
        name: i === 6 ? 'CN' : `Thứ ${i + 2}`,
        dateStr: format(date, 'dd/MM'),
        fullDate: date,
        isToday: isSameDay(date, new Date())
      }
    })
  }, [currentDate])

  const handlePrevWeek = () => setCurrentDate((prev) => subWeeks(prev, 1))
  const handleNextWeek = () => setCurrentDate((prev) => addWeeks(prev, 1))
  const handleToday = () => setCurrentDate(new Date())
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setCurrentDate(parseISO(e.target.value))
    }
  }

  const filteredRooms = useMemo(() => {
    if (!scheduleData?.rooms) return []
    return scheduleData.rooms.filter((room) => {
      if (searchKeyword) {
        const matchesRoom = room.roomName.toLowerCase().includes(searchKeyword.toLowerCase())
        const matchesDevice = room.devices?.some((d: LabRoomDeviceResponse) =>
          d?.device?.deviceName?.toLowerCase().includes(searchKeyword.toLowerCase())
        )
        if (!matchesRoom && !matchesDevice) return false
      }
      if (selectedRoom && room.labRoomId.toString() !== selectedRoom) {
        return false
      }
      return true
    })
  }, [scheduleData, searchKeyword, selectedRoom])

  const filteredSlots = useMemo(() => {
    if (!selectedSlot) return slots
    return slots.filter((slot) => slot.slotId.toString() === selectedSlot)
  }, [slots, selectedSlot])

  const handleClearFilters = () => {
    setSearchKeyword('')
    setSelectedSlot('')
    setSelectedRoom('')
    setSelectedStatus('')
  }

  const filteredMyBookings = useMemo(() => {
    return myBookings.filter((booking) => {
      if (searchKeyword) {
        const matchesRoom = booking.roomName.toLowerCase().includes(searchKeyword.toLowerCase())
        const matchesDevice = booking.devices?.some((d: BookingDeviceResponse) =>
          d?.deviceName?.toLowerCase().includes(searchKeyword.toLowerCase())
        )
        if (!matchesRoom && !matchesDevice) return false
      }
      if (selectedStatus && booking.status !== selectedStatus) {
        return false
      }
      if (selectedRoom && booking.labRoomId.toString() !== selectedRoom) {
        return false
      }
      if (selectedSlot) {
        const hasSlot = booking.slots.some((s) => s.slotId.toString() === selectedSlot)
        if (!hasSlot) return false
      }
      return true
    })
  }, [myBookings, searchKeyword, selectedStatus, selectedRoom, selectedSlot])

  const statusOptions = useMemo(() => {
    const options = activeTab === 'VIEW_ROOMS' ? RoomStatusOptions : BookingStatusOptions
    return options.filter((opt) => opt.value !== '')
  }, [activeTab])

  const isLoading =
    isLoadingRoomsList || isLoadingSlots || isLoadingSchedule || (activeTab === 'MY_BOOKINGS' && isLoadingMyBookings)

  const { data: joinedGroups = [] } = useJoinedGroupsQuery(isAuthenticated)

  return (
    <>
      <div className='w-full px-6 md:px-20 lg:px-40 py-8 space-y-6 font-sans antialiased text-[#333]'>
        <ScheduleHeader
          tabs={[
            { id: 'VIEW_ROOMS', label: 'Lịch phòng Lab', icon: LayoutGrid },
            { id: 'MY_BOOKINGS', label: 'Lịch cá nhân', icon: CalendarIcon, requiresAuth: true }
          ]}
          activeTab={activeTab}
          setActiveTab={(tab) => setActiveTab(tab as 'VIEW_ROOMS' | 'MY_BOOKINGS')}
          isAuthenticated={isAuthenticated}
          setShowLoginDialog={setShowLoginDialog}
          currentDate={currentDate}
          handleDateChange={handleDateChange}
          handlePrevWeek={handlePrevWeek}
          handleNextWeek={handleNextWeek}
          handleToday={handleToday}
          searchKeyword={searchKeyword}
          setSearchKeyword={setSearchKeyword}
          selectedSlot={selectedSlot}
          setSelectedSlot={setSelectedSlot}
          selectedRoom={selectedRoom}
          setSelectedRoom={setSelectedRoom}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          slots={slots}
          labRoomsList={labRoomsList}
          statusOptions={statusOptions}
          handleClearFilters={handleClearFilters}
        />

        <div className='flex flex-col lg:flex-row gap-6 items-start'>
          <div className='flex-1 min-w-0 space-y-6 w-full'>
            {isLoading ? (
              <div className='bg-white rounded-md shadow-sm border border-[#e5e7eb] p-12 text-center'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#153898] mx-auto mb-4'></div>
                <p className='text-gray-500 font-medium'>Đang tải dữ liệu...</p>
              </div>
            ) : activeTab === 'VIEW_ROOMS' ? (
              <LabRoomScheduleTable
                weekDays={weekDays}
                filteredRooms={filteredRooms}
                filteredSlots={filteredSlots}
                selectedStatus={selectedStatus}
                isAuthenticated={isAuthenticated}
                setShowLoginDialog={setShowLoginDialog}
                selection={selection}
                onSlotSelect={handleSlotSelect}
              />
            ) : (
              <MyBookingScheduleTable weekDays={weekDays} slots={filteredSlots} bookings={filteredMyBookings} />
            )}

            <div className='flex flex-wrap items-center gap-8 text-[15px] text-gray-700 bg-white p-5 rounded-md border border-[#e5e7eb] shadow-sm'>
              <div className='font-bold text-[#1f2937] mr-2 uppercase tracking-tight'>Chú thích:</div>
              {activeTab === 'VIEW_ROOMS' ? (
                <>
                  {[
                    { color: 'bg-[#f0f9ff] border-[#dbeafe]', label: 'Trống (Có thể đăng ký)' },
                    { color: 'bg-[#fffbeb] border-[#fef3c7]', label: 'Còn chỗ' },
                    { color: 'bg-[#fef2f2] border-[#fecaca]', label: 'Hết chỗ' },
                    { color: 'bg-[#f3f4f6] border-[#e5e7eb]', label: 'Đã kết thúc / Ngày nghỉ' }
                  ].map((item, i) => (
                    <div key={i} className='flex items-center gap-2'>
                      <span className={`w-5 h-5 rounded-sm border ${item.color}`}></span>
                      <span className='font-bold'>{item.label}</span>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {[
                    { color: 'bg-yellow-50 border-yellow-400', label: 'Đang chờ' },
                    { color: 'bg-green-50 border-green-500', label: 'Đã xác nhận' },
                    { color: 'bg-gray-100 border-gray-400', label: 'Đã hủy / Bị từ chối' }
                  ].map((item, i) => (
                    <div key={i} className='flex items-center gap-2'>
                      <span className={`w-5 h-5 rounded-sm border shadow-sm ${item.color}`}></span>
                      <span className='font-bold'>{item.label}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {activeTab === 'VIEW_ROOMS' && selection && (
            <div className='w-full lg:w-[480px] shrink-0 lg:sticky lg:top-8 animate-in fade-in slide-in-from-right-4 duration-500'>
              <StudentBookingForm
                selection={selection}
                currentUser={currentUser}
                joinedGroups={joinedGroups}
                slots={slots}
                currentRoomName={currentRoom?.roomName || ''}
                onCancel={handleCancelBooking}
                onSuccess={handleSuccessBooking}
              />
            </div>
          )}
        </div>
      </div>

      <LoginRequiredDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </>
  )
}

export default StudentSchedulePage
