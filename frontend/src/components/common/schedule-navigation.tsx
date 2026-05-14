import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, Clock } from 'lucide-react'
import { format } from 'date-fns'

interface ScheduleTab {
  id: string
  label: string
  icon: React.ElementType
  requiresAuth?: boolean
}

interface ScheduleNavigationProps {
  tabs: ScheduleTab[]
  activeTab: string
  setActiveTab: (tabId: string) => void
  setSelectedStatus: (status: string) => void
  isAuthenticated: boolean
  setShowLoginDialog: (show: boolean) => void
  currentDate: Date
  handleDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handlePrevWeek: () => void
  handleNextWeek: () => void
  handleToday: () => void
}

export const ScheduleNavigation = ({
  tabs,
  activeTab,
  setActiveTab,
  setSelectedStatus,
  isAuthenticated,
  setShowLoginDialog,
  currentDate,
  handleDateChange,
  handlePrevWeek,
  handleNextWeek,
  handleToday
}: ScheduleNavigationProps) => {
  return (
    <div className='bg-white p-4 rounded-md shadow-sm border border-[#e5e7eb] mt-2'>
      <div className='flex flex-col xl:flex-row justify-between items-center gap-4'>
        <div className='flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto'>
          <div className='inline-flex rounded-lg border border-[#e5e7eb] bg-[#f3f4f6] p-1.5'>
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
                className={`px-6 py-2 text-[15px] font-bold rounded-md transition-all flex items-center gap-2 ${
                  activeTab === tab.id ? 'bg-white text-[#153898] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className='h-5 w-5' />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className='flex flex-wrap items-center gap-3 w-full xl:w-auto justify-center xl:justify-end'>
          <div className='relative group'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <CalendarIcon className='text-[#153898] h-4.5 w-4.5' />
            </div>
            <input
              type='date'
              value={format(currentDate, 'yyyy-MM-dd')}
              onChange={handleDateChange}
              className='pl-10 pr-10 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#153898] w-full sm:w-auto min-w-[200px] cursor-pointer'
            />
            <div className='absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none'>
              <ChevronDown className='text-gray-400 text-lg' />
            </div>
          </div>

          <button
            onClick={handlePrevWeek}
            className='px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-[#153898] transition-colors flex items-center'
          >
            <ChevronLeft className='h-4 w-4 mr-1' /> Tuần trước
          </button>
          <button
            onClick={handleToday}
            className='px-4 py-2 text-sm font-bold text-white bg-[#153898] rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center'
          >
            <Clock className='h-4 w-4 mr-1' /> Hôm nay
          </button>
          <button
            onClick={handleNextWeek}
            className='px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-[#153898] transition-colors flex items-center'
          >
            Tuần kế tiếp <ChevronRight className='h-4 w-4 ml-1' />
          </button>
        </div>
      </div>
    </div>
  )
}
