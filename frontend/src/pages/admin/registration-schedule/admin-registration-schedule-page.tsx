import { useState, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router'
import { LayoutGrid } from 'lucide-react'
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, parseISO } from 'date-fns'
import { useLabRoomsQuery } from '@/queries/lab-room.queries'
import { useSlotsQuery } from '@/queries/slot.queries'
import { useAdminWeekScheduleQuery } from '@/queries/lab-room-schedule.queries'
import { RoomStatusOptions } from '@/constants/types'
import { useAuth } from '@/hooks/use-auth'
import { LabRoomScheduleTable } from '@/components/common/labroom-schedule-table'
import { ScheduleHeader } from '@/components/common/schedule-header'
import type { LabRoomDeviceResponse } from '@/schemas/lab-room-device.schema'
import { PATHS } from '@/constants/paths'

const AdminRegistrationSchedulePage = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [searchKeyword, setSearchKeyword] = useState(searchParams.get('search') || '')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [selectedRoom, setSelectedRoom] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')

  const handleSlotSelect = (roomId: number, date: string, slotId: number) => {
    // Navigate to detail page
    const path = PATHS.ADMIN.SLOT_BOOKING_DETAIL.replace(':roomId', roomId.toString())
      .replace(':slotId', slotId.toString())
      .replace(':date', date)
    navigate(path)
  }

  const { data: labRoomsData, isLoading: isLoadingRoomsList } = useLabRoomsQuery({ limit: 50 })
  const { data: slotsData, isLoading: isLoadingSlots } = useSlotsQuery({ limit: 50 })
  const { data: scheduleRes, isLoading: isLoadingSchedule } = useAdminWeekScheduleQuery({
    date: format(currentDate, 'yyyy-MM-dd')
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

  const statusOptions = useMemo(() => {
    return RoomStatusOptions.filter((opt) => opt.value !== '')
  }, [])

  const isLoading = isLoadingRoomsList || isLoadingSlots || isLoadingSchedule

  return (
    <div className='w-full space-y-6 font-sans antialiased text-[#333]'>
      <ScheduleHeader
        tabs={[{ id: 'VIEW_ROOMS', label: 'Lịch Đăng Ký Phòng Lab', icon: LayoutGrid }]}
        activeTab='VIEW_ROOMS'
        setActiveTab={() => {}}
        isAuthenticated={isAuthenticated}
        setShowLoginDialog={() => {}}
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
          ) : (
            <LabRoomScheduleTable
              weekDays={weekDays}
              filteredRooms={filteredRooms}
              filteredSlots={filteredSlots}
              selectedStatus={selectedStatus}
              isAuthenticated={isAuthenticated}
              setShowLoginDialog={() => {}}
              isAdminView={true}
              onSlotSelect={handleSlotSelect}
            />
          )}

          <div className='flex flex-wrap items-center gap-8 text-[15px] text-gray-700 bg-white p-5 rounded-md border border-[#e5e7eb] shadow-sm'>
            <div className='font-bold text-[#1f2937] mr-2 uppercase tracking-tight'>Chú thích:</div>
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminRegistrationSchedulePage
