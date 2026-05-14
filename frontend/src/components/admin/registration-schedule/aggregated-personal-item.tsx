import { User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { BookingType, BookingTypeLabels } from '@/constants/types'

interface AggregatedPersonalItemProps {
  count: number
  isSelected: boolean
  onClick: () => void
}

export const AggregatedPersonalItem = ({ count, isSelected, onClick }: AggregatedPersonalItemProps) => {
  const borderColor = isSelected
    ? 'border-primary ring-1 ring-primary/20 bg-blue-50/50'
    : 'border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300'

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-xl border transition-all mb-3 relative group overflow-hidden flex items-center justify-between shadow-sm ${borderColor}`}
    >
      <div className={`absolute top-0 left-0 w-1 h-full ${isSelected ? 'bg-primary' : 'bg-gray-300'}`}></div>

      <div className='flex flex-col gap-1 pl-2'>
        <span className='text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1'>
          <User size={10} className={isSelected ? 'text-primary' : ''} /> {BookingTypeLabels[BookingType.PERSONAL]}
        </span>
        <span className='font-bold text-sm text-gray-700'>Danh sách tổng hợp</span>
      </div>

      <Badge variant='personal' className='font-bold'>
        {count} SV
      </Badge>
    </button>
  )
}
