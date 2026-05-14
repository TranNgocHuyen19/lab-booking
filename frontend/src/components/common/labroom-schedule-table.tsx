import React from 'react'
import { Laptop } from 'lucide-react'
import { format } from 'date-fns'
import { RoomStatus, type RoomStatusType } from '@/constants/types'
import { formatTime } from '@/utils/format'
import { deviceIconMap } from '@/utils/icon'
import type { LabRoomDeviceResponse } from '@/schemas/lab-room-device.schema'
import { PATHS } from '@/constants/paths'
import type { SlotResponse } from '@/schemas/slot.schema'
import { useNavigate } from 'react-router'
import type {
  RoomScheduleResponse,
  DayScheduleResponse,
  SlotScheduleResponse
} from '@/schemas/lab-room-schedule.schema'

interface Selection {
  roomId: number
  date: string
  slotIds: number[]
}

interface Props {
  weekDays: {
    name: string
    dateStr: string
    fullDate: Date
    isToday: boolean
  }[]
  filteredSlots: SlotResponse[]
  filteredRooms: RoomScheduleResponse[]
  selectedStatus: string
  isAuthenticated: boolean
  setShowLoginDialog: (open: boolean) => void
  bookingPath?: string
  isLecturerView?: boolean
  isAdminView?: boolean
  selection?: Selection | null
  onSlotSelect?: (roomId: number, date: string, slotId: number) => void
}

export const LabRoomScheduleTable = ({
  weekDays,
  filteredSlots,
  filteredRooms,
  selectedStatus,
  isAuthenticated,
  setShowLoginDialog,
  bookingPath,
  isLecturerView = false,
  isAdminView = false,
  selection,
  onSlotSelect
}: Props) => {
  const navigate = useNavigate()

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-[#f0f9ff] text-[#1d4ed8] border-[#dbeafe] hover:bg-[#e0f2fe]'
      case 'OCCUPIED':
        return 'bg-[#fffbeb] text-[#b45309] border-[#fef3c7]'
      case 'FULL':
        return 'bg-[#fef2f2] text-[#991b1b] border-[#fecaca]'
      case 'EXPIRED':
      case 'CLOSED':
        return 'bg-[#f3f4f6] text-[#9ca3af] border-[#e5e7eb]'
      default:
        return 'bg-white border-[#e5e7eb]'
    }
  }

  const getStatusLabel = (status: string) => {
    return RoomStatus[status as RoomStatusType] || status
  }

  const getRoomIcon = () => {
    return Laptop
  }

  return (
    <div className='bg-white rounded-md shadow-sm border border-[#e5e7eb] overflow-hidden overflow-x-auto mb-6'>
      <table className='min-w-full divide-y divide-[#e5e7eb]'>
        <thead className='bg-[#153898] text-white'>
          <tr>
            <th className='px-6 py-5 text-center text-[13px] font-bold uppercase tracking-wider w-40 border-r border-[#153898]/30 sticky left-0 z-10 bg-[#153898]'>
              Phòng
            </th>
            <th className='px-4 py-5 text-center text-[13px] font-bold uppercase tracking-wider w-36 border-r border-[#153898]/30'>
              Thời gian
            </th>
            {weekDays.map((day, i) => (
              <th
                key={i}
                className={`px-4 py-4 text-center min-w-[120px] transition-colors ${day.isToday ? 'bg-[#1e40af] ring-inset ring-2 ring-[#2563eb]/20' : ''}`}
              >
                <div
                  className={`text-[12px] uppercase tracking-wide mb-1 ${day.isToday ? 'text-blue-200 font-bold opacity-100' : 'opacity-80'}`}
                >
                  {day.name}
                </div>
                <div className='text-[16px] font-bold'>{day.dateStr}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className='bg-white divide-y divide-[#f3f4f6]'>
          {filteredRooms.map((room, ri) => (
            <React.Fragment key={ri}>
              {filteredSlots.map((slot, si) => (
                <tr key={si} className='hover:bg-gray-50/80 transition-colors'>
                  {si === 0 && (
                    <td
                      rowSpan={filteredSlots.length}
                      className='px-6 py-6 whitespace-nowrap bg-[#f9fafb] border-r border-[#e5e7eb] align-middle sticky left-0 z-10 border-b border-[#e5e7eb]'
                    >
                      <div className='flex flex-col items-center'>
                        <div className='w-14 h-14 rounded-full bg-[#eff6ff] flex items-center justify-center text-[#153898] mb-3 border border-[#dbeafe]'>
                          {React.createElement(getRoomIcon(), { className: 'h-8 w-8' })}
                        </div>
                        <div className='text-xl font-bold text-[#1f2937]'>{room.roomName}</div>
                        <div className='text-[13px] text-gray-500 mt-2 bg-white px-3 py-1 rounded border border-[#e5e7eb] font-bold shadow-sm'>
                          {room.capacity} chỗ
                        </div>
                        {room.devices && room.devices.length > 0 && (
                          <div className='w-full mt-3 pt-3 border-t border-[#e5e7eb]'>
                            <div className='flex flex-wrap justify-center gap-2'>
                              {room.devices.slice(0, 6).map((deviceItem: LabRoomDeviceResponse, idx: number) => {
                                const iconName = (deviceItem.device.icon || 'default') as keyof typeof deviceIconMap
                                const IconComponent = deviceIconMap[iconName] || deviceIconMap.default
                                return (
                                  <div
                                    key={idx}
                                    className='flex items-center gap-1 bg-gray-100 hover:bg-[#eff6ff] text-gray-600 hover:text-[#153898] px-2 py-1 rounded-full text-[11px] font-semibold transition-colors'
                                    title={deviceItem.device.deviceName}
                                  >
                                    <IconComponent className='h-3.5 w-3.5' />
                                    <span>{deviceItem.quantity}</span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  )}
                  <td className='px-4 py-4 text-center border-r border-[#f3f4f6] border-b border-[#f3f4f6]'>
                    <div className='text-[13px] font-bold text-gray-700 uppercase mb-2'>{slot.slotName}</div>
                    <div className='text-[11px] text-gray-600 font-mono font-bold bg-[#f3f4f6] inline-block px-2 py-1 rounded border border-gray-200'>
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </div>
                  </td>
                  {weekDays.map((day, sti) => {
                    const dateStr = format(day.fullDate, 'yyyy-MM-dd')
                    const daySchedule = room.schedule.find((ds: DayScheduleResponse) => ds.date === dateStr)
                    const slotInfo = daySchedule?.slots.find((s: SlotScheduleResponse) => s.slotId === slot.slotId)

                    const status = slotInfo?.status || 'CLOSED'
                    const participantCount = slotInfo?.participantCount || 0
                    const roomCapacity = slotInfo?.roomCapacity || room.capacity
                    const pendingCount = slotInfo?.pendingCount || 0
                    const capacityData = status === 'CLOSED' ? '' : `${participantCount}/${roomCapacity}`
                    const isExpired = status === 'EXPIRED'

                    const isClickable = isAdminView
                      ? status !== 'CLOSED'
                      : status === 'AVAILABLE' || status === 'OCCUPIED'

                    const isSelected =
                      selection?.roomId === room.labRoomId &&
                      selection?.date === dateStr &&
                      selection?.slotIds.includes(slot.slotId)

                    if (selectedStatus && selectedStatus !== status) {
                      return (
                        <td
                          key={sti}
                          className={`p-1 border-b border-[#f3f4f6] border-r border-[#f9fafb] last:border-0 ${day.isToday ? 'bg-[#eff6ff]/40' : ''}`}
                        ></td>
                      )
                    }

                    const handleSlotClick = () => {
                      if (!isClickable) return

                      if (!isAuthenticated) {
                        setShowLoginDialog(true)
                        return
                      }

                      if (
                        isLecturerView &&
                        status === 'OCCUPIED' &&
                        slotInfo?.bookingRequestIds &&
                        slotInfo.bookingRequestIds.length > 0
                      ) {
                        const bookingId = slotInfo.bookingRequestIds[0]
                        navigate(PATHS.LECTURER.BOOKING_DETAIL.replace(':id', bookingId.toString()))
                        return
                      }

                      if (onSlotSelect) {
                        onSlotSelect(room.labRoomId, dateStr, slot.slotId)
                        return
                      }

                      navigate(`${bookingPath}?roomId=${room.labRoomId}&slotId=${slot.slotId}&date=${dateStr}`)
                    }

                    return (
                      <td
                        key={sti}
                        className={`p-1 border-b border-[#f3f4f6] border-r border-[#f9fafb] last:border-0 ${day.isToday ? 'bg-[#eff6ff]/40' : ''}`}
                      >
                        <div
                          onClick={handleSlotClick}
                          className={`rounded-md py-3 px-2 text-[13px] font-bold text-center transition-all h-[75px] flex items-center justify-center flex-col border shadow-sm relative ${getStatusClasses(status)} ${isClickable ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : 'cursor-not-allowed opacity-70'} ${isSelected ? 'ring-2 ring-blue-600 ring-offset-1 border-blue-600 z-10 bg-blue-50' : 'border-transparent'} ${isExpired ? 'opacity-50 grayscale-[30%]' : ''}`}
                        >
                          {isAdminView && pendingCount > 0 && (
                            <span
                              className='absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center text-[10px] bg-yellow-400 text-yellow-900 rounded-full font-black shadow-sm border border-yellow-500'
                              title={`${pendingCount} đơn chờ duyệt`}
                            >
                              {pendingCount}
                            </span>
                          )}
                          <span className='uppercase tracking-tight leading-tight'>{getStatusLabel(status)}</span>
                          {capacityData && (
                            <span className='text-[12px] opacity-70 mt-1 font-bold'>{capacityData}</span>
                          )}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
              {ri !== filteredRooms.length - 1 && (
                <tr className='bg-[#f3f4f6]/50 h-3'>
                  <td colSpan={filteredSlots.length + 2} className='border-y border-[#e5e7eb]'></td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}
