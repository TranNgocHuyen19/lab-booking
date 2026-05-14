import { Clock, GraduationCap, User, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { BookingType, BookingTypeLabels, RequestStatus } from '@/constants/types'
import type { SlotBookingDetailItem } from '@/schemas/booking.schema'

interface GroupSidebarItemProps {
  booking: SlotBookingDetailItem
  isSelected: boolean
  onClick: () => void
}

export const GroupSidebarItem = ({ booking, isSelected, onClick }: GroupSidebarItemProps) => {
  const isPending = booking.status === RequestStatus.PENDING
  const borderColor = isSelected
    ? 'border-[#153898] ring-1 ring-[#153898] bg-blue-50'
    : isPending
      ? 'border-yellow-300 bg-yellow-50/30'
      : 'border-blue-100 bg-white hover:border-blue-300'

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-xl border transition-all mb-3 relative group overflow-hidden ${borderColor} shadow-sm`}
    >
      <div className={`absolute top-0 left-0 w-1 h-full ${isPending ? 'bg-yellow-500' : 'bg-[#153898]'}`}></div>

      <div className='pl-3'>
        <div className='flex justify-between items-start mb-1'>
          <Badge variant='research' className='text-[9px] px-1.5 h-4'>
            {BookingTypeLabels[BookingType.GROUP]}
          </Badge>
          {isPending && <Clock size={12} className='text-yellow-600' />}
        </div>

        <h4
          className={`font-bold text-sm line-clamp-1 leading-tight mb-1 mt-1 ${isSelected ? 'text-[#153898]' : 'text-gray-700'}`}
          title={booking.groupName || booking.purpose}
        >
          {booking.groupName || booking.purpose}
        </h4>

        {booking.leaderName && (
          <div className='flex items-center gap-1.5 text-gray-500 text-xs mb-2'>
            <GraduationCap size={14} className='text-primary' />
            <span className='font-bold uppercase text-[10px]'>GVHD:</span>
            <span className='truncate text-gray-700'>
              {booking.leaderName} {booking.leaderUsername && `(${booking.leaderUsername})`}
            </span>
          </div>
        )}

        <div className='flex items-center justify-between text-sm'>
          <div className='flex items-center gap-1.5 text-gray-500 text-xs'>
            <User size={14} />
            <span className='truncate max-w-[150px]'>
              {booking.requesterName} {booking.requesterUsername && `(${booking.requesterUsername})`}
            </span>
          </div>
          <div className='flex items-center gap-1 text-[#153898] font-bold bg-blue-50 px-2 py-1 rounded-full text-xs'>
            <Users size={12} /> {booking.participantCount}
          </div>
        </div>
      </div>
    </button>
  )
}
