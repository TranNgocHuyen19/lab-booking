import { Search, Clock, LayoutGrid, Filter, FilterX, X } from 'lucide-react'
import { InfiniteScrollSelect } from '@/components/common/infinite-scroll-select'
import { formatTime } from '@/utils/format'
import type { SlotResponse } from '@/schemas/slot.schema'
import type { LabRoomResponse } from '@/schemas/lab-room.schema'

interface ScheduleFiltersProps {
  searchKeyword: string
  setSearchKeyword: (keyword: string) => void
  selectedSlot: string
  setSelectedSlot: (slot: string) => void
  selectedRoom: string
  setSelectedRoom: (room: string) => void
  selectedStatus: string
  setSelectedStatus: (status: string) => void
  slots: SlotResponse[]
  labRoomsList: LabRoomResponse[]
  statusOptions: { value: string; label: string }[]
  handleClearFilters: () => void
}

export const ScheduleFilters = ({
  searchKeyword,
  setSearchKeyword,
  selectedSlot,
  setSelectedSlot,
  selectedRoom,
  setSelectedRoom,
  selectedStatus,
  setSelectedStatus,
  slots,
  labRoomsList,
  statusOptions,
  handleClearFilters
}: ScheduleFiltersProps) => {
  return (
    <div className='bg-white p-5 rounded-md shadow-sm border border-[#e5e7eb] mb-6'>
      <div className='grid grid-cols-1 md:grid-cols-12 gap-5 items-center'>
        <div className='md:col-span-12 lg:col-span-5 relative'>
          <span className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
            <Search className='text-gray-400 h-6 w-6' />
          </span>
          <input
            className='block w-full pl-12 pr-12 py-3 border border-[#d1d5db] rounded-lg bg-[#f9fafb] text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#153898] text-[15px] font-medium'
            placeholder='Tìm kiếm phòng, thiết bị...'
            type='text'
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          {searchKeyword && (
            <button
              onClick={() => setSearchKeyword('')}
              className='absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#153898]'
            >
              <X className='h-5 w-5' />
            </button>
          )}
        </div>
        <div className='md:col-span-12 lg:col-span-7 flex flex-wrap md:flex-nowrap gap-3 items-center justify-end'>
          <div className='w-full md:flex-1 min-w-[140px]'>
            <InfiniteScrollSelect
              value={selectedSlot}
              onValueChange={setSelectedSlot}
              placeholder='Tất cả các ca'
              items={slots}
              getItemValue={(slot: SlotResponse) => slot.slotId.toString()}
              getItemLabel={(slot: SlotResponse) =>
                `${slot.slotName} (${formatTime(slot.startTime)} - ${formatTime(slot.endTime)})`
              }
              icon={<Clock className='h-5 w-5' />}
              className='text-[15px] font-bold'
            />
          </div>

          <div className='w-full md:flex-1 min-w-[140px]'>
            <InfiniteScrollSelect
              value={selectedRoom}
              onValueChange={setSelectedRoom}
              placeholder='Tất cả phòng'
              items={labRoomsList}
              getItemValue={(room: LabRoomResponse) => room.labRoomId.toString()}
              getItemLabel={(room: LabRoomResponse) => `${room.roomName} (${room.capacity} chỗ)`}
              icon={<LayoutGrid className='h-5 w-5' />}
              className='text-[15px] font-bold'
            />
          </div>

          <div className='w-full md:flex-1 min-w-[140px]'>
            <InfiniteScrollSelect
              value={selectedStatus}
              onValueChange={setSelectedStatus}
              placeholder='Tất cả trạng thái'
              items={statusOptions}
              getItemValue={(opt: { value: string; label: string }) => opt.value}
              getItemLabel={(opt: { value: string; label: string }) => opt.label}
              icon={<Filter className='h-5 w-5' />}
              className='text-[15px] font-bold'
            />
          </div>

          {(selectedSlot || selectedRoom || selectedStatus || searchKeyword) && (
            <button
              onClick={handleClearFilters}
              className='p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 flex items-center justify-center'
              title='Xoá bộ lọc'
            >
              <FilterX className='h-5 w-5' />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
