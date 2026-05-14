import { useState, useMemo } from 'react'
import { Building2, TrendingUp, Clock, Download, Activity, X, Loader2 } from 'lucide-react'
import { DatePicker } from '@/components/ui/date-picker'
import { useSearchParams } from 'react-router'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import KPICard from '@/components/common/kpi-card'
import { InfiniteScrollSelect } from '@/components/common/infinite-scroll-select'
import { BookingTypeLabels } from '@/constants/types'
import { calculateDateRange, type FilterMode } from '@/utils/statistics'
import { useInfiniteFilterLabRoomsQuery } from '@/queries/lab-room.queries'
import {
  useRoomStatisticsSummaryQuery,
  useRoomStatisticsHeatmapQuery,
  useRoomStatisticsUsageDetailsQuery
} from '@/queries/room-statistics.queries'
import { cn } from '@/lib/utils'
import PaginationCustom from '@/components/common/pagination-custom'
import type { RoomStatisticsParams, RoomUsageDetailsParams } from '@/schemas/room-statistics.schema'

const ACTIVITY_TYPES = [
  { id: 'THESIS', label: BookingTypeLabels.THESIS },
  { id: 'PERSONAL', label: BookingTypeLabels.PERSONAL },
  { id: 'GROUP', label: BookingTypeLabels.GROUP }
] as const

const AdminRoomSlotReportPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const filterMode = (searchParams.get('mode') as FilterMode) || 'today'
  const fromParam = searchParams.get('from') || undefined
  const toParam = searchParams.get('to') || undefined
  const monthParam = searchParams.get('month') || undefined
  const yearParam = searchParams.get('year') || undefined

  const [selectedRoomId, setSelectedRoomId] = useState<string>(searchParams.get('roomId') || '')
  const [selectedActivity, setSelectedActivity] = useState<string>(searchParams.get('activity') || 'all')
  const [roomKeyword, setRoomKeyword] = useState('')
  const [currentPage, setCurrentPage] = useState(0)

  // States for Custom Range (Tùy chọn)
  const [rangeType, setRangeType] = useState<'date' | 'month'>(
    (searchParams.get('rangeType') as 'date' | 'month') || (searchParams.get('month') ? 'month' : 'date')
  )
  const [tempFrom, setTempFrom] = useState<string>(fromParam || '')
  const [tempTo, setTempTo] = useState<string>(toParam || '')
  const [tempMonth, setTempMonth] = useState<string>(monthParam || (new Date().getMonth() + 1).toString())
  const [tempYear, setTempYear] = useState<string>(yearParam || new Date().getFullYear().toString())

  const {
    data: roomsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteFilterLabRoomsQuery({
    limit: 10,
    keyword: roomKeyword
  })

  const rooms = useMemo(() => {
    return roomsData?.pages.flatMap((page) => page.data.data) || []
  }, [roomsData])

  const { startDate, endDate } = calculateDateRange(filterMode, fromParam, toParam, monthParam, yearParam)

  const apiParams: RoomStatisticsParams = useMemo(() => {
    const params: RoomStatisticsParams = { startDate, endDate }
    const roomId = searchParams.get('roomId')
    const activity = searchParams.get('activity')

    if (roomId) params.roomId = Number(roomId)
    if (activity && activity !== 'all') params.activityType = activity as 'THESIS' | 'PERSONAL' | 'GROUP'

    return params
  }, [startDate, endDate, searchParams])

  const { data: summaryData, isLoading: isSummaryLoading } = useRoomStatisticsSummaryQuery(apiParams)
  const { data: heatmapData, isLoading: isHeatmapLoading } = useRoomStatisticsHeatmapQuery(apiParams)

  const slotCount = useMemo(() => heatmapData?.[0]?.shifts.length || 5, [heatmapData])

  const usageDetailsParams: RoomUsageDetailsParams = useMemo(
    () => ({
      ...apiParams,
      page: currentPage,
      limit: slotCount,
      sortBy: 'usageRate',
      order: 'desc'
    }),
    [apiParams, currentPage, slotCount]
  )

  const { data: usageDetailsData, isLoading: isUsageDetailsLoading } =
    useRoomStatisticsUsageDetailsQuery(usageDetailsParams)

  const setFilterMode = (mode: FilterMode) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('mode', mode)
    if (mode !== 'range') {
      newParams.delete('from')
      newParams.delete('to')
      newParams.delete('month')
      newParams.delete('year')
      newParams.delete('rangeType')
    }
    setSearchParams(newParams)
    setCurrentPage(0)
  }

  const handleApplyFilter = () => {
    const newParams = new URLSearchParams(searchParams)
    if (selectedRoomId) newParams.set('roomId', selectedRoomId)
    else newParams.delete('roomId')
    if (selectedActivity !== 'all') newParams.set('activity', selectedActivity)
    else newParams.delete('activity')

    // Handle Custom Range
    if (filterMode === 'range') {
      newParams.set('rangeType', rangeType)
      if (rangeType === 'date') {
        if (tempFrom) newParams.set('from', tempFrom)
        else newParams.delete('from')
        if (tempTo) newParams.set('to', tempTo)
        else newParams.delete('to')
        newParams.delete('month')
        newParams.delete('year')
      } else {
        newParams.set('month', tempMonth)
        newParams.set('year', tempYear)
        newParams.delete('from')
        newParams.delete('to')
      }
    }

    setSearchParams(newParams)
    setCurrentPage(0)
  }

  const handleClearFilters = () => {
    setSelectedRoomId('')
    setSelectedActivity('all')
    setRoomKeyword('')
    const newParams = new URLSearchParams()
    newParams.set('mode', filterMode)
    setSearchParams(newParams)
    setCurrentPage(0)
  }

  const handleRoomSearchChange = (keyword: string) => {
    setRoomKeyword(keyword)
  }

  const hasFilter = useMemo(() => {
    return (
      searchParams.has('roomId') ||
      (searchParams.has('activity') && searchParams.get('activity') !== 'all') ||
      searchParams.has('from') ||
      searchParams.has('month')
    )
  }, [searchParams])

  const getHeatmapColor = (rate: number) => {
    if (rate >= 90) return 'bg-primary text-white'
    if (rate >= 70) return 'bg-primary/80 text-white'
    if (rate >= 40) return 'bg-primary/60 text-white'
    if (rate >= 20) return 'bg-primary/30 text-primary uppercase'
    return 'bg-primary/10 text-primary uppercase font-black'
  }

  return (
    <div className='flex flex-col gap-6 pb-10'>
      {/* Header */}
      <div className='flex flex-col gap-2'>
        <h1 className='text-3xl font-black tracking-tight text-primary uppercase'>Phòng & Ca Học</h1>
        <p className='text-muted-foreground font-medium'>Thống kê hiệu suất sử dụng phòng lab theo ca</p>
      </div>

      {/* Filter Bar */}
      <div className='flex flex-col gap-4'>
        <div className='flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4'>
          {/* Left: Date Tabs - Query immediately */}
          <div className='flex p-1 bg-slate-50 rounded-xl border border-border overflow-x-auto shadow-sm'>
            {(['today', '7d', 'month', 'range'] as const).map((item) => (
              <Button
                key={item}
                variant={filterMode === item ? 'default' : 'ghost'}
                size='sm'
                className={cn(
                  'rounded-lg text-[13px] font-bold px-5 h-9 transition-all whitespace-nowrap',
                  filterMode === item ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-foreground'
                )}
                onClick={() => setFilterMode(item)}
              >
                {item === 'today' ? 'Hôm nay' : item === '7d' ? '7 ngày' : item === 'month' ? 'Tháng này' : 'Tùy chọn'}
              </Button>
            ))}
          </div>

          {/* Right: Select Filters + Lọc Button - Query on click */}
          <div className='flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto'>
            <div className='w-full sm:w-[200px]'>
              <InfiniteScrollSelect
                placeholder='Tất cả phòng...'
                value={selectedRoomId}
                onValueChange={setSelectedRoomId}
                items={rooms}
                hasMore={hasNextPage}
                isLoading={isFetchingNextPage}
                onLoadMore={fetchNextPage}
                getItemValue={(item) => item.labRoomId.toString()}
                getItemLabel={(item) => item.roomName}
                onSearchChange={handleRoomSearchChange}
                className='bg-white h-10'
              />
            </div>

            <div className='w-full sm:w-[180px]'>
              <Select value={selectedActivity} onValueChange={setSelectedActivity}>
                <SelectTrigger className='w-full h-10 bg-white font-medium'>
                  <SelectValue placeholder='Hoạt động' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Tất cả hoạt động</SelectItem>
                  {ACTIVITY_TYPES.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='flex items-center gap-2 w-full sm:w-auto'>
              <Button
                onClick={handleApplyFilter}
                className='h-10 rounded-xl font-bold px-6 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white shrink-0'
              >
                Lọc
              </Button>
              {hasFilter && (
                <Button
                  variant='outline'
                  onClick={handleClearFilters}
                  className='h-10 px-4 rounded-xl font-bold bg-white border-border shrink-0 gap-2 animate-in fade-in zoom-in duration-300'
                >
                  <X className='h-4 w-4' />
                  Xóa
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Custom Range Panel - Below filter bar */}
        {filterMode === 'range' && (
          <div className='flex flex-col sm:flex-row items-center gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500 ease-out'>
            <div className='flex p-1 bg-white rounded-lg border border-blue-100 shadow-sm shrink-0'>
              <Button
                variant='ghost'
                size='sm'
                className={cn(
                  'h-8 px-4 text-[12px] font-bold rounded-md transition-all',
                  rangeType === 'date' ? 'bg-primary text-white shadow-sm' : 'text-slate-500'
                )}
                onClick={() => setRangeType('date')}
              >
                Khoảng ngày
              </Button>
              <Button
                variant='ghost'
                size='sm'
                className={cn(
                  'h-8 px-4 text-[12px] font-bold rounded-md transition-all',
                  rangeType === 'month' ? 'bg-primary text-white shadow-sm' : 'text-slate-500'
                )}
                onClick={() => setRangeType('month')}
              >
                Theo tháng
              </Button>
            </div>

            <div className='h-6 w-[1px] bg-blue-200 hidden sm:block' />

            <div className='flex flex-wrap items-center gap-3'>
              {rangeType === 'date' ? (
                <>
                  <div className='flex items-center gap-2'>
                    <span className='text-[12px] font-bold text-slate-500 uppercase'>Từ</span>
                    <DatePicker value={tempFrom} onChange={setTempFrom} className='h-9 w-[150px]' />
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-[12px] font-bold text-slate-500 uppercase'>Đến</span>
                    <DatePicker value={tempTo} onChange={setTempTo} className='h-9 w-[150px]' />
                  </div>
                </>
              ) : (
                <>
                  <div className='flex items-center gap-2'>
                    <span className='text-[12px] font-bold text-slate-500 uppercase'>Tháng</span>
                    <Select value={tempMonth} onValueChange={setTempMonth}>
                      <SelectTrigger className='h-9 w-[120px] bg-white'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            Tháng {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-[12px] font-bold text-slate-500 uppercase'>Năm</span>
                    <Select value={tempYear} onValueChange={setTempYear}>
                      <SelectTrigger className='h-9 w-[100px] bg-white'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 5 }, (_, i) => {
                          const yr = new Date().getFullYear() - 2 + i
                          return (
                            <SelectItem key={yr} value={yr.toString()}>
                              {yr}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2'>
        {isSummaryLoading ? (
          <div className='col-span-4 flex justify-center py-8'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
          </div>
        ) : (
          <>
            <KPICard
              title='Tỷ lệ sử dụng trung bình'
              value={`${summaryData?.usageRate.value ?? 0}%`}
              growth={summaryData?.usageRate.growth}
              isUp={summaryData?.usageRate.isUp ?? true}
              icon={TrendingUp}
              color='primary'
            />
            <KPICard
              title='Phòng sử dụng nhiều nhất'
              value={summaryData?.mostUsedRoom.roomName ?? '-'}
              subValue={`${summaryData?.mostUsedRoom.usageRate ?? 0}% (${summaryData?.mostUsedRoom.bookingCount ?? 0} booking)`}
              icon={Building2}
              color='info'
            />
            <KPICard
              title='Phòng sử dụng ít nhất'
              value={summaryData?.leastUsedRoom.roomName ?? '-'}
              subValue={`${summaryData?.leastUsedRoom.usageRate ?? 0}% (${summaryData?.leastUsedRoom.bookingCount ?? 0} booking)`}
              icon={Activity}
              color='destructive'
            />
            <KPICard
              title='Ca có mức sử dụng cao nhất'
              value={summaryData?.peakShift.shiftName ?? '-'}
              subValue={`Trung bình: ${summaryData?.peakShift.usageRate ?? 0}%`}
              icon={Clock}
              color='warning'
            />
          </>
        )}
      </div>

      <Card className='bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm'>
        <div className='px-6 py-3 border-b border-gray-100 flex flex-col gap-3'>
          <div className='flex items-center justify-between'>
            <div className='flex flex-col gap-1'>
              <h3 className='text-base font-black text-primary uppercase tracking-wider'>
                Tỷ lệ lấp đầy theo sức chứa
              </h3>
              <p className='text-[11px] text-muted-foreground'>
                Tỷ lệ lấp đầy = (Số người / Sức chứa phòng) × 100% • Khóa luận = 100%
              </p>
            </div>
            <div className='flex items-center gap-4'>
              <div className='hidden sm:flex items-center gap-6'>
                <div className='flex items-center gap-2'>
                  <div className='w-3 h-3 rounded-full bg-primary/10 border border-primary/20' />
                  <span className='text-[11px] font-bold text-muted-foreground uppercase'>Thấp</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-3 h-3 rounded-full bg-primary/30' />
                  <span className='text-[11px] font-bold text-muted-foreground uppercase'>Trung bình</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-3 h-3 rounded-full bg-primary/60' />
                  <span className='text-[11px] font-bold text-muted-foreground uppercase'>Cao</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-3 h-3 rounded-full bg-primary' />
                  <span className='text-[11px] font-bold text-muted-foreground uppercase'>Rất cao</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <CardContent className='p-6'>
          {isHeatmapLoading ? (
            <div className='flex justify-center py-8'>
              <Loader2 className='h-8 w-8 animate-spin text-primary' />
            </div>
          ) : heatmapData && heatmapData.length > 0 ? (
            <div className='overflow-x-auto custom-scrollbar pb-2'>
              <table className='w-full border-separate border-spacing-2'>
                <thead>
                  <tr>
                    <th className='text-left text-[11px] font-black uppercase text-muted-foreground p-2 w-32'>Phòng</th>
                    {heatmapData[0]?.shifts.map((shift) => (
                      <th key={shift.slotId} className='p-2 min-w-[140px]'>
                        <div className='flex flex-col items-center gap-0.5'>
                          <span className='text-[13px] font-black text-foreground'>{shift.slotName}</span>
                          <span className='text-[10px] text-muted-foreground font-bold tracking-tight uppercase'>
                            {shift.timeRange}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heatmapData.map((row) => (
                    <tr key={row.roomId}>
                      <td className='p-2 font-black text-foreground text-sm uppercase'>{row.roomName}</td>
                      {row.shifts.map((shift) => (
                        <td key={shift.slotId} className='p-1'>
                          <div
                            className={cn(
                              'h-[75px] rounded-xl flex flex-col items-center justify-center gap-1 transition-all hover:scale-[1.02] cursor-default shadow-sm border border-transparent',
                              getHeatmapColor(shift.usageRate)
                            )}
                          >
                            <span className='text-lg font-black tracking-tight'>{shift.usageRate}%</span>
                            <span className='text-[10px] font-bold opacity-80 uppercase leading-none'>
                              {shift.bookingCount} booking
                            </span>
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className='text-center py-8 text-muted-foreground'>Không có dữ liệu trong khoảng thời gian này</div>
          )}
        </CardContent>
      </Card>

      <Card className='bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm'>
        <div className='px-6 py-3 border-b border-gray-100 flex items-center justify-between'>
          <div className='flex flex-col gap-1'>
            <h3 className='text-base font-black text-primary uppercase tracking-wider'>Chi tiết hiệu suất sử dụng</h3>
          </div>
          <Button
            variant='link'
            className='h-auto p-0 text-[13px] font-bold uppercase text-primary hover:no-underline cursor-pointer hover:underline gap-2'
          >
            <Download className='h-4 w-4' />
            Xuất báo cáo
          </Button>
        </div>
        <CardContent className='p-0'>
          {isUsageDetailsLoading ? (
            <div className='flex justify-center py-20'>
              <Loader2 className='h-10 w-10 animate-spin text-primary' />
            </div>
          ) : usageDetailsData?.data.length ? (
            <>
              <div className='overflow-x-auto custom-scrollbar'>
                <table className='w-full'>
                  <thead>
                    <tr className='bg-gray-50 border-b border-gray-200'>
                      <th className='px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase'>Phòng Lab</th>
                      <th className='px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase'>Ca học</th>
                      <th className='px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase'>
                        Tỷ lệ lấp đầy
                      </th>
                      <th className='px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase'>
                        Số lượt đặt
                      </th>
                      <th className='px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase'>Tổng giờ</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-50'>
                    {usageDetailsData.data.map((row, i) => (
                      <tr key={i} className='hover:bg-slate-50/50 transition-colors group'>
                        <td className='px-6 py-4 font-black text-foreground text-sm uppercase'>{row.roomName}</td>
                        <td className='px-6 py-4 font-bold text-muted-foreground text-sm uppercase'>{row.slotName}</td>
                        <td className='px-6 py-4'>
                          <div className='flex items-center gap-3'>
                            <Progress value={row.usageRate} className='h-2 w-24' />
                            <span className='font-black text-primary text-sm'>{Math.round(row.usageRate)}%</span>
                          </div>
                        </td>
                        <td className='px-6 py-4 text-center font-bold text-slate-600 text-sm'>{row.bookingCount}</td>
                        <td className='px-6 py-4 text-center font-bold text-slate-600 text-sm'>
                          {Math.round(row.totalHours)}H
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className='px-6 py-4 border-t border-gray-100'>
                <PaginationCustom
                  currentPage={currentPage + 1}
                  totalPages={usageDetailsData.totalPages}
                  totalItems={usageDetailsData.totalItems}
                  limit={slotCount}
                  onPageChange={(p) => setCurrentPage(p - 1)}
                />
              </div>
            </>
          ) : (
            <div className='text-center py-20 text-muted-foreground italic font-bold'>
              Không có dữ liệu trong khoảng thời gian này
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminRoomSlotReportPage
