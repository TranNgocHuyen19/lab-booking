import React, { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { LayoutGrid, Calendar as CalendarIcon, User } from 'lucide-react'
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, parseISO } from 'date-fns'
import { useLabRoomsQuery, useLabRoomByIdQuery } from '@/queries/lab-room.queries'
import { useSlotsQuery } from '@/queries/slot.queries'
import { useWeekScheduleQuery } from '@/queries/lab-room-schedule.queries'
import { useMyBookingsQuery, useMyGroupBookingsQuery } from '@/queries/booking.queries'
import { useManagedResearchGroupsQuery } from '@/queries/research-group.queries'
import { RoomStatusOptions, BookingStatusOptions } from '@/constants/types'
import { useAuth } from '@/hooks/use-auth'
import { LoginRequiredDialog } from '@/components/common/dialog-login-required'
import { LabRoomScheduleTable } from '@/components/common/labroom-schedule-table'
import { MyBookingScheduleTable } from '@/components/common/booking-schedule-table'
import { ScheduleHeader } from '@/components/common/schedule-header'
import { useQueryClient } from '@tanstack/react-query'
import { LecturerBookingForm } from '@/components/lecturer/booking-registration-form'
import { QUERY_KEYS } from '@/query-core'
import type { LabRoomDeviceResponse } from '@/schemas/lab-room-device.schema'
import type { BookingDeviceResponse, BookingResponse } from '@/schemas/booking.schema'
import type { SlotResponse } from '@/schemas/slot.schema'
import type { LabRoomResponse } from '@/schemas/lab-room.schema'

const LecturerSchedulePage = () => {
  const { isAuthenticated, user: currentUser } = useAuth()
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<'VIEW_ROOMS' | 'GROUP_BOOKINGS' | 'PERSONAL_BOOKINGS'>('VIEW_ROOMS')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [searchKeyword, setSearchKeyword] = useState(searchParams.get('search') || '')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [selectedRoom, setSelectedRoom] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const queryClient = useQueryClient()

  // Booking Selection State
  const [selection, setSelection] = useState<{ roomId: number; date: string; slotIds: number[] } | null>(null)

  // Hooks for room name (need to pass to form)
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

  const searchParam = searchParams.get('search') || ''
  const [prevSearchParam, setPrevSearchParam] = useState(searchParam)
  if (searchParam !== prevSearchParam) {
    setPrevSearchParam(searchParam)
    setSearchKeyword(searchParam)
  }

  const { data: labRoomsData, isLoading: isLoadingRoomsList } = useLabRoomsQuery({ limit: 50 })
  const { data: slotsData, isLoading: isLoadingSlots } = useSlotsQuery({ limit: 50 })
  const { data: scheduleRes, isLoading: isLoadingSchedule } = useWeekScheduleQuery({
    date: format(currentDate, 'yyyy-MM-dd')
  })
  const { data: myBookings = [], isLoading: isLoadingMyBookings } = useMyBookingsQuery({
    enabled: activeTab === 'PERSONAL_BOOKINGS' && isAuthenticated
  })
  const { data: myGroupBookings = [], isLoading: isLoadingGroupBookings } = useMyGroupBookingsQuery({
    enabled: activeTab === 'GROUP_BOOKINGS' && isAuthenticated
  })
  const { data: managedGroupsRes, isLoading: isLoadingManagedGroups } = useManagedResearchGroupsQuery(
    { page: 1, limit: 100 },
    isAuthenticated
  )
  const managedGroups = useMemo(() => managedGroupsRes?.data?.data || [], [managedGroupsRes])

  const labRoomsList = useMemo(() => (labRoomsData?.data?.data || []) as LabRoomResponse[], [labRoomsData])
  const slots = useMemo(() => (slotsData?.data?.data || []) as SlotResponse[], [slotsData])
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

  const filteredPersonalBookings = useMemo(() => {
    return myBookings.filter((booking: BookingResponse) => {
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

  const filteredGroupBookings = useMemo(() => {
    return myGroupBookings.filter((booking: BookingResponse) => {
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
  }, [myGroupBookings, searchKeyword, selectedStatus, selectedRoom, selectedSlot])

  const statusOptions = useMemo(() => {
    const options = activeTab === 'VIEW_ROOMS' ? RoomStatusOptions : BookingStatusOptions
    return options.filter((opt) => opt.value !== '')
  }, [activeTab])

  const isLoading =
    isLoadingRoomsList ||
    isLoadingSlots ||
    isLoadingSchedule ||
    isLoadingManagedGroups ||
    (activeTab === 'PERSONAL_BOOKINGS' && isLoadingMyBookings) ||
    (activeTab === 'GROUP_BOOKINGS' && isLoadingGroupBookings)

  return (
    <>
      <div className='space-y-6'>
        {isLoading ? (
          <div className='bg-white rounded-md shadow-sm border border-[#e5e7eb] p-12 text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#153898] mx-auto mb-4'></div>
            <p className='text-gray-500 font-medium'>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            <div className='mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6'>
              <div className='flex flex-col gap-2'>
                <h1 className='text-3xl font-black tracking-tight text-primary uppercase'>Lịch phòng Lab</h1>
                <p className='text-gray-500 font-medium'>
                  Quản lý và đăng ký lịch sử dụng phòng thực hành cho cá nhân và nhóm nghiên cứu.
                </p>
              </div>
            </div>

            <ScheduleHeader
              tabs={[
                { id: 'VIEW_ROOMS', label: 'Lịch phòng Lab', icon: LayoutGrid },
                { id: 'GROUP_BOOKINGS', label: 'Lịch của nhóm nghiên cứu', icon: CalendarIcon, requiresAuth: true },
                { id: 'PERSONAL_BOOKINGS', label: 'Lịch cá nhân', icon: User, requiresAuth: true }
              ]}
              activeTab={activeTab}
              setActiveTab={(tab) => setActiveTab(tab as 'VIEW_ROOMS' | 'GROUP_BOOKINGS' | 'PERSONAL_BOOKINGS')}
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
                {activeTab === 'VIEW_ROOMS' ? (
                  <LabRoomScheduleTable
                    weekDays={weekDays}
                    filteredSlots={filteredSlots}
                    filteredRooms={filteredRooms}
                    selectedStatus={selectedStatus}
                    isAuthenticated={isAuthenticated}
                    setShowLoginDialog={setShowLoginDialog}
                    onSlotSelect={handleSlotSelect}
                    selection={selection}
                  />
                ) : activeTab === 'GROUP_BOOKINGS' ? (
                  <MyBookingScheduleTable
                    weekDays={weekDays}
                    slots={filteredSlots}
                    bookings={filteredGroupBookings}
                    isLecturerView={true}
                    onRefresh={() => {
                      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKING.MY_GROUPS })
                      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LAB_ROOM.ROOT })
                    }}
                  />
                ) : (
                  <MyBookingScheduleTable
                    weekDays={weekDays}
                    slots={filteredSlots}
                    bookings={filteredPersonalBookings}
                    isLecturerView={true}
                    onRefresh={() => {
                      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKING.MY })
                      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LAB_ROOM.ROOT })
                    }}
                  />
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
                  <LecturerBookingForm
                    selection={selection}
                    currentUser={currentUser}
                    managedGroups={managedGroups}
                    slots={slots}
                    currentRoomName={currentRoom?.roomName || ''}
                    onCancel={handleCancelBooking}
                    onSuccess={handleSuccessBooking}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <LoginRequiredDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </>
  )
}

export default LecturerSchedulePage
