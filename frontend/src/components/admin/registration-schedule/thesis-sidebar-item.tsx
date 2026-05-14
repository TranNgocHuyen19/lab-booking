import { ArrowRight, GraduationCap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { BookingType, BookingTypeLabels, RequestStatus } from '@/constants/types'
import type { SlotBookingDetailItem } from '@/schemas/booking.schema'

interface ThesisSidebarItemProps {
  booking: SlotBookingDetailItem
  isSelected: boolean
  onClick: () => void
}

export const ThesisSidebarItem = ({ booking, isSelected, onClick }: ThesisSidebarItemProps) => {
  const isPending = booking.status === RequestStatus.PENDING
  const borderColor = isSelected
    ? 'border-purple-600 ring-1 ring-purple-600 bg-purple-50'
    : isPending
      ? 'border-purple-300 bg-purple-50/30'
      : 'border-purple-200 bg-purple-50/10 hover:border-purple-400'

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-xl border transition-all mb-3 relative group overflow-hidden ${borderColor}`}
    >
      <div className='absolute top-0 left-0 w-1.5 h-full bg-purple-600'></div>

      <div className='pl-3'>
        <div className='flex justify-between items-start mb-1'>
          <Badge variant='thesis' className='text-[9px] px-1.5 h-4'>
            {BookingTypeLabels[BookingType.THESIS]}
          </Badge>
          {isPending && <span className='text-[10px] font-bold text-purple-600 animate-pulse'>⏳ Chờ duyệt</span>}
        </div>

        <h4 className='font-bold text-sm text-gray-800 line-clamp-2 leading-tight mb-2 mt-1' title={booking.purpose}>
          {booking.purpose}
        </h4>

        <div className='flex items-center gap-2 text-sm text-gray-600'>
          <GraduationCap size={16} className='text-purple-500' />
          <span className='font-medium text-xs uppercase text-gray-500'>GVHD:</span>
          <span className='font-semibold text-gray-700 truncate'>
            {booking.requesterName} {booking.requesterUsername && `(${booking.requesterUsername})`}
          </span>
        </div>
      </div>
      {isSelected && (
        <ArrowRight size={18} className='absolute right-2 top-1/2 -translate-y-1/2 text-purple-700 opacity-100' />
      )}
    </button>
  )
}
