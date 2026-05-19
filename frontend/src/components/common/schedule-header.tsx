import React from 'react'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Clock,
  Search,
  LayoutGrid,
  Filter,
  FilterX,
  X,
  ShieldCheck
} from 'lucide-react'
import { format } from 'date-fns'
import { InfiniteScrollSelect } from '@/components/common/infinite-scroll-select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { LabRoomRulesPanel } from '@/components/common/lab-room-rules-panel'
import { formatTime } from '@/utils/format'
import type { SlotResponse } from '@/schemas/slot.schema'
import type { LabRoomResponse } from '@/schemas/lab-room.schema'

interface ScheduleTab {
  id: string
  label: string
  icon: React.ElementType
  requiresAuth?: boolean
}

interface ScheduleHeaderProps {
  tabs: ScheduleTab[]
  activeTab: string
  setActiveTab: (tabId: string) => void
  isAuthenticated: boolean
  setShowLoginDialog: (show: boolean) => void
  currentDate: Date
  handleDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handlePrevWeek: () => void
  handleNextWeek: () => void
  handleToday: () => void
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

export const ScheduleHeader = ({
  tabs,
  activeTab,
  setActiveTab,
  isAuthenticated,
  setShowLoginDialog,
  currentDate,
  handleDateChange,
  handlePrevWeek,
  handleNextWeek,
  handleToday,
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
}: ScheduleHeaderProps) => {
  const [isRulesOpen, setIsRulesOpen] = React.useState(false)

  return (
    <>
      <div className='bg-white p-3 rounded-md shadow-sm border border-[#e5e7eb] mt-2 space-y-3'>
        <div className='flex flex-col lg:flex-row justify-between items-center gap-3'>
          <div className='inline-flex rounded-md border border-[#e5e7eb] bg-[#f3f4f6] p-1 w-full lg:w-auto overflow-x-auto'>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.requiresAuth && !isAuthenticated) {
                    setShowLoginDialog(true)
                    return
                  }
                  setActiveTab(tab.id)
                  setSelectedStatus('')
                }}
                className={`px-4 py-1.5 text-[14px] font-bold rounded-md transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id ? 'bg-white text-[#153898] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className='h-4 w-4' />
                {tab.label}
              </button>
            ))}
          </div>

          <div className='flex flex-wrap items-center gap-2 w-full lg:w-auto justify-center lg:justify-end'>
            <div className='relative group'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <CalendarIcon className='text-[#153898] h-4 w-4' />
              </div>
              <input
                type='date'
                value={format(currentDate, 'yyyy-MM-dd')}
                onChange={handleDateChange}
                className='pl-9 pr-8 py-1.5 text-xs font-bold border border-gray-300 rounded-md text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#153898] w-full sm:w-auto cursor-pointer h-[38px]'
              />
              <div className='absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none'>
                <ChevronDown className='text-gray-400 h-4 w-4' />
              </div>
            </div>

            <div className='flex items-center gap-1'>
              <button
                onClick={handlePrevWeek}
                className='px-2 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-[#153898] transition-colors flex items-center h-[38px]'
                title='Tuần trước'
              >
                <ChevronLeft className='h-4 w-4' />
              </button>
              <button
                onClick={handleToday}
                className='px-3 py-1.5 text-xs font-bold text-white bg-[#153898] rounded-md shadow-sm hover:bg-blue-700 transition-colors flex items-center h-[38px]'
              >
                Hôm nay
              </button>
              <button
                onClick={handleNextWeek}
                className='px-2 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-[#153898] transition-colors flex items-center h-[38px]'
                title='Tuần kế tiếp'
              >
                <ChevronRight className='h-4 w-4' />
              </button>
            </div>

            <button
              type='button'
              onClick={() => setIsRulesOpen(true)}
              className='px-3 py-1.5 text-xs font-bold text-[#153898] bg-[#eff6ff] border border-[#dbeafe] rounded-md hover:bg-[#dbeafe] transition-colors flex items-center gap-2 h-[38px]'
            >
              <ShieldCheck className='h-4 w-4' />
              Quy định
            </button>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-12 gap-2 items-center pt-2 border-t border-gray-100'>
          <div className='md:col-span-12 lg:col-span-4 relative'>
            <span className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <Search className='text-gray-400 h-4 w-4' />
            </span>
            <input
              className='block w-full pl-9 pr-9 py-2 border border-[#d1d5db] rounded-md bg-[#f9fafb] text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#153898] text-[13px] font-bold h-[38px]'
              placeholder='Tìm kiếm phòng, thiết bị...'
              type='text'
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            {searchKeyword && (
              <button
                onClick={() => setSearchKeyword('')}
                className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#153898]'
              >
                <X className='h-4 w-4' />
              </button>
            )}
          </div>

          <div className='md:col-span-12 lg:col-span-8 flex flex-wrap md:flex-nowrap gap-2 items-center justify-end'>
            <div className='w-full md:flex-1 min-w-[120px]'>
              <InfiniteScrollSelect
                value={selectedSlot}
                onValueChange={setSelectedSlot}
                placeholder='Tất cả các ca'
                items={slots}
                getItemValue={(slot: SlotResponse) => slot.slotId.toString()}
                getItemLabel={(slot: SlotResponse) =>
                  `${slot.slotName} (${formatTime(slot.startTime)} - ${formatTime(slot.endTime)})`
                }
                icon={<Clock className='h-4 w-4' />}
                className='text-[13px] font-bold h-[38px]'
              />
            </div>

            <div className='w-full md:flex-1 min-w-[120px]'>
              <InfiniteScrollSelect
                value={selectedRoom}
                onValueChange={setSelectedRoom}
                placeholder='Tất cả phòng'
                items={labRoomsList}
                getItemValue={(room: LabRoomResponse) => room.labRoomId.toString()}
                getItemLabel={(room: LabRoomResponse) => `${room.roomName} (${room.capacity} chỗ)`}
                icon={<LayoutGrid className='h-4 w-4' />}
                className='text-[13px] font-bold h-[38px]'
              />
            </div>

            <div className='w-full md:flex-1 min-w-[120px]'>
              <InfiniteScrollSelect
                value={selectedStatus}
                onValueChange={setSelectedStatus}
                placeholder='Tất cả trạng thái'
                items={statusOptions}
                getItemValue={(opt: { value: string; label: string }) => opt.value}
                getItemLabel={(opt: { value: string; label: string }) => opt.label}
                icon={<Filter className='h-4 w-4' />}
                className='text-[13px] font-bold h-[38px]'
              />
            </div>

            {(selectedSlot || selectedRoom || selectedStatus || searchKeyword) && (
              <button
                onClick={handleClearFilters}
                className='p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors border border-gray-200 flex items-center justify-center h-[38px] w-[38px]'
                title='Xóa bộ lọc'
              >
                <FilterX className='h-4 w-4' />
              </button>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isRulesOpen} onOpenChange={setIsRulesOpen}>
        <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-5xl'>
          <DialogHeader>
            <DialogTitle className='text-2xl font-black uppercase tracking-tight text-primary'>
              Quy định phòng Lab
            </DialogTitle>
          </DialogHeader>
          <LabRoomRulesPanel />
        </DialogContent>
      </Dialog>
    </>
  )
}
