import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { formatTime } from '@/utils/format'
import type { SlotResponse } from '@/schemas/slot.schema'
import { useNavigate } from 'react-router'
import { PATHS } from '@/constants/paths'
import { DialogBookingDetail } from '@/components/common/dialog-booking-detail'
import { DialogUpdateBooking } from '@/components/common/dialog-update-booking'
import { QUERY_KEYS } from '@/query-core'

import type { BookingResponse, SecureBookingResponse } from '@/schemas/booking.schema'

interface Props {
  weekDays: {
    name: string
    dateStr: string
    fullDate: Date
    isToday: boolean
  }[]
  slots: SlotResponse[]
  bookings: (BookingResponse | SecureBookingResponse)[]
  isLecturerView?: boolean
  onRefresh?: () => void
}

export const MyBookingScheduleTable = ({ weekDays, slots, bookings, isLecturerView, onRefresh }: Props) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedBooking, setSelectedBooking] = useState<BookingResponse | SecureBookingResponse | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)

  const calendarMap = useMemo(() => {
    const map = new Map<string, (BookingResponse | SecureBookingResponse)[]>()
    bookings.forEach((booking) => {
      booking.slots.forEach((slot) => {
        const key = `${booking.bookingDate}_${slot.slotId}`
        if (!map.has(key)) {
          map.set(key, [])
        }
        map.get(key)?.push(booking)
      })
    })
    return map
  }, [bookings])

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-50 border-yellow-400 text-yellow-800'
      case 'APPROVED':
        return 'bg-green-50 border-green-500 text-green-800'
      case 'REJECTED':
        return 'bg-red-50 border-red-500 text-red-800'
      case 'CANCELED':
      case 'SYSTEM_CANCELED':
        return 'bg-gray-100 border-gray-400 text-gray-800'
      default:
        return 'bg-white border-gray-200'
    }
  }

  const handleBookingClick = (bookingId: number) => {
    const booking = bookings.find((b) => b.bookingRequestId === bookingId)
    if (booking) {
      if (isLecturerView) {
        const detailPath = PATHS.LECTURER.BOOKING_DETAIL.replace(':id', booking.bookingRequestId.toString())
        navigate(detailPath)
        return
      }
      setSelectedBooking(booking)
      setIsDetailOpen(true)
    }
  }

  return (
    <div className='bg-white rounded-md shadow-sm border border-[#e5e7eb] overflow-hidden overflow-x-auto mb-6'>
      <table className='min-w-full divide-y divide-[#e5e7eb]'>
        <thead className='bg-[#153898] text-white'>
          <tr>
            <th className='px-4 py-5 text-center text-[13px] font-bold uppercase tracking-wider w-36 border-r border-[#153898]/30 sticky left-0 z-10 bg-[#153898]'>
              CA HỌC
            </th>
            {weekDays.map((day, i) => (
              <th
                key={i}
                className={`px-4 py-4 text-center min-w-[150px] transition-colors ${day.isToday ? 'bg-[#1e40af] ring-inset ring-2 ring-[#2563eb]/20' : ''}`}
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
          {slots.map((slot, si) => (
            <tr key={si} className='hover:bg-gray-50/50 transition-colors'>
              <td className='px-4 py-6 text-center border-r border-[#f3f4f6] bg-[#f9fafb] sticky left-0 z-10'>
                <div className='text-[13px] font-bold text-gray-700 uppercase mb-2'>{slot.slotName}</div>
                <div className='text-[11px] text-gray-500 font-mono font-bold'>
                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                </div>
              </td>
              {weekDays.map((day, di) => {
                const dateKey = format(day.fullDate, 'yyyy-MM-dd')
                const slotBookings = calendarMap.get(`${dateKey}_${slot.slotId}`) || []

                return (
                  <td key={di} className='p-2 border-r border-[#f3f4f6] min-h-[110px] align-top'>
                    <div className='flex flex-col gap-2 h-full'>
                      {slotBookings.length > 0 ? (
                        slotBookings.map((booking) => (
                          <div
                            key={booking.bookingRequestId}
                            onClick={() => handleBookingClick(booking.bookingRequestId)}
                            className={`p-2 rounded-md shadow-sm flex flex-col justify-center transition-all hover:shadow-md cursor-pointer border ${getStatusStyles(booking.status)}`}
                          >
                            <div className='font-bold text-[13px] mb-0.5'>{booking.roomName}</div>
                            <p className='text-[11px] line-clamp-2 italic opacity-80 leading-snug'>{booking.purpose}</p>
                            {isLecturerView && (
                              <div className='mt-1.5 pt-1.5 border-t border-current/10 flex items-center justify-between'>
                                <span className='text-[9px] font-black uppercase opacity-60'>
                                  #{booking.bookingRequestId}
                                </span>
                                <span className='text-[9px] font-bold truncate ml-2 max-w-[80px]'>
                                  {booking.requesterName}
                                </span>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className='h-full min-h-[60px]'></div>
                      )}
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <DialogBookingDetail
        booking={selectedBooking}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        isLecturerView={isLecturerView}
        onUpdate={(booking) => {
          setSelectedBooking(booking)
          setIsDetailOpen(false)
          setIsUpdateOpen(true)
        }}
        onCancel={() => {
          if (isLecturerView) {
            onRefresh?.()
          } else {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKING.MY })
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LAB_ROOM.ROOT })
          }
        }}
      />

      <DialogUpdateBooking
        booking={selectedBooking}
        open={isUpdateOpen}
        onOpenChange={setIsUpdateOpen}
        isLecturerView={isLecturerView}
      />
    </div>
  )
}
