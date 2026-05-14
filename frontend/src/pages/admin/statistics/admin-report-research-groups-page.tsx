import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, Clock, Download, X, Loader2, LayoutDashboard, Activity } from 'lucide-react'
import { DatePicker } from '@/components/ui/date-picker'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import { cn } from '@/lib/utils'
import PaginationCustom from '@/components/common/pagination-custom'
import KPICard from '@/components/common/kpi-card'
import { InfiniteScrollSelect } from '@/components/common/infinite-scroll-select'
import { useInfiniteAdminFilterUsersQuery } from '@/queries/user.queries'
import {
  useGroupStatisticsSummaryQuery,
  useGroupStatisticsDistributionQuery,
  useGroupStatisticsUsageDetailsQuery
} from '@/queries/research-group-statistics.queries'
import { BookingTypeLabels, GroupTypeLabel } from '@/constants/types'
import { calculateDateRange, type FilterMode } from '@/utils/statistics'
import type { GroupStatisticsParams, GroupUsageDetailsParams } from '@/schemas/research-group-statistics.schema'

const CHART_COLORS = ['#3f51b5', '#009688', '#ff9800', '#f44336', '#9c27b0', '#00bcd4']

const AdminReportResearchGroupsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const filterMode = (searchParams.get('mode') as FilterMode) || 'today'
  const fromParam = searchParams.get('from') || undefined
  const toParam = searchParams.get('to') || undefined
  const monthParam = searchParams.get('month') || undefined
  const yearParam = searchParams.get('year') || undefined

  const [currentPage, setCurrentPage] = useState(0)
  const [lecturerKeyword, setLecturerKeyword] = useState('')

  const [pendingLecturerId, setPendingLecturerId] = useState<string>(searchParams.get('lecturerId') || 'all')
  const [pendingGroupType, setPendingGroupType] = useState<string>(searchParams.get('groupType') || 'all')

  // States for Custom Range (Tùy chọn)
  const [rangeType, setRangeType] = useState<'date' | 'month'>(
    (searchParams.get('rangeType') as 'date' | 'month') || (searchParams.get('month') ? 'month' : 'date')
  )
  const [tempFrom, setTempFrom] = useState<string>(fromParam || '')
  const [tempTo, setTempTo] = useState<string>(toParam || '')
  const [tempMonth, setTempMonth] = useState<string>(monthParam || (new Date().getMonth() + 1).toString())
  const [tempYear, setTempYear] = useState<string>(yearParam || new Date().getFullYear().toString())

  const activeLecturerId = searchParams.get('lecturerId') || 'all'
  const activeGroupType = searchParams.get('groupType') || 'all'

  const {
    data: lecturersData,
    fetchNextPage: fetchNextLecturers,
    hasNextPage: hasNextLecturers,
    isLoading: isLecturersLoading
  } = useInfiniteAdminFilterUsersQuery({
    size: 20,
    keyword: lecturerKeyword,
    role: 'LECTURER'
  })

  interface Lecturer {
    userId: number
    fullName: string
  }

  const lecturers = useMemo(() => {
    return (lecturersData?.pages.flatMap((page) => page.data) as Lecturer[]) || []
  }, [lecturersData])

  const { startDate, endDate } = calculateDateRange(filterMode, fromParam, toParam, monthParam, yearParam)

  const apiParams: GroupStatisticsParams = useMemo(() => {
    const params: GroupStatisticsParams = { startDate, endDate }
    if (activeGroupType !== 'all') params.groupType = activeGroupType as 'RESEARCH' | 'THESIS'
    if (activeLecturerId !== 'all') params.lecturerId = Number(activeLecturerId)
    return params
  }, [startDate, endDate, activeGroupType, activeLecturerId])

  const usageDetailsParams: GroupUsageDetailsParams = useMemo(
    () => ({
      ...apiParams,
      page: currentPage,
      limit: 10,
      sortBy: 'totalHours',
      order: 'desc'
    }),
    [apiParams, currentPage]
  )

  const { data: summaryData, isLoading: isSummaryLoading } = useGroupStatisticsSummaryQuery(apiParams)
  const { data: distributionData, isLoading: isDistributionLoading } = useGroupStatisticsDistributionQuery(apiParams)
  const { data: usageDetailsData, isLoading: isUsageDetailsLoading } =
    useGroupStatisticsUsageDetailsQuery(usageDetailsParams)

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

  const handleClearFilters = () => {
    setPendingGroupType('all')
    setPendingLecturerId('all')
    setLecturerKeyword('')
    const newParams = new URLSearchParams(searchParams)
    newParams.delete('groupType')
    newParams.delete('lecturerId')
    setSearchParams(newParams)
    setCurrentPage(0)
  }

  const handleApplyFilter = () => {
    const newParams = new URLSearchParams(searchParams)
    if (pendingGroupType && pendingGroupType !== 'all') newParams.set('groupType', pendingGroupType)
    else newParams.delete('groupType')

    if (pendingLecturerId && pendingLecturerId !== 'all') newParams.set('lecturerId', pendingLecturerId)
    else newParams.delete('lecturerId')

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

  const hasFilter = useMemo(() => {
    return (
      (searchParams.has('groupType') && searchParams.get('groupType') !== 'all') ||
      (searchParams.has('lecturerId') && searchParams.get('lecturerId') !== 'all')
    )
  }, [searchParams])

  const chartData = useMemo(() => {
    if (!distributionData) return []
    return distributionData.map((item) => ({
      name: item.slotName,
      ...item.distribution
    }))
  }, [distributionData])

  const allChartKeys = useMemo(() => {
    if (!chartData || chartData.length === 0) return []
    const keys = new Set<string>()
    chartData.forEach((item) => {
      Object.keys(item).forEach((key) => {
        if (key !== 'name') keys.add(key)
      })
    })
    return Array.from(keys)
  }, [chartData])

  return (
    <div className='flex flex-col gap-6 pb-10'>
      <div className='flex flex-col gap-2'>
        <h1 className='text-3xl font-black tracking-tight text-primary uppercase'>Nhóm Nghiên Cứu</h1>
        <p className='text-muted-foreground font-medium'>Thống kê hoạt động nghiên cứu của giảng viên và sinh viên</p>
      </div>

      <div className='flex flex-col gap-4'>
        <div className='flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4'>
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

          <div className='flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto'>
            <div className='w-full sm:w-[160px]'>
              <Select value={pendingGroupType} onValueChange={setPendingGroupType}>
                <SelectTrigger className='w-full h-10 bg-white font-medium'>
                  <SelectValue placeholder='Loại nhóm' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Tất cả loại nhóm</SelectItem>
                  {(Object.entries(GroupTypeLabel) as [string, string][]).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='w-full sm:w-[200px]'>
              <InfiniteScrollSelect
                placeholder='Giảng viên...'
                items={lecturers}
                getItemValue={(u: Lecturer) => u.userId.toString()}
                getItemLabel={(u: Lecturer) => u.fullName}
                value={pendingLecturerId}
                onValueChange={setPendingLecturerId}
                onSearchChange={setLecturerKeyword}
                isLoading={isLecturersLoading}
                hasMore={hasNextLecturers}
                onLoadMore={fetchNextLecturers}
                className='bg-white h-10'
              />
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
        ) : summaryData ? (
          <>
            <KPICard
              title='Tổng số nhóm hoạt động'
              value={summaryData.activeGroups.value}
              subValue='Nhóm đã đặt chỗ'
              growth={summaryData.activeGroups.growth}
              isUp={summaryData.activeGroups.isUp}
              icon={Users}
              color='primary'
            />
            <KPICard
              title='Tổng giờ sử dụng'
              value={`${Math.round(summaryData.totalHours.value)}H`}
              subValue='Thời lượng thực tế'
              growth={summaryData.totalHours.growth}
              isUp={summaryData.totalHours.isUp}
              icon={Clock}
              color='info'
            />
            <KPICard
              title='Loại hình chủ đạo'
              value={
                summaryData.typeDistribution?.[0]
                  ? BookingTypeLabels[summaryData.typeDistribution[0].type as keyof typeof BookingTypeLabels]
                  : '-'
              }
              subValue={`${Math.round(summaryData.typeDistribution?.[0]?.percentage || 0)}% tổng số ca`}
              icon={Activity}
              color='success'
            />
            <KPICard
              title='Tỷ lệ lấp đầy bởi nhóm'
              value={`${Math.round(summaryData.occupancyRate.value)}%`}
              subValue='Trên tổng số ca hệ thống'
              growth={summaryData.occupancyRate.growth}
              isUp={summaryData.occupancyRate.isUp}
              icon={LayoutDashboard}
              color='warning'
            />
          </>
        ) : null}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <Card className='lg:col-span-1 bg-white rounded-2xl border border-border shadow-sm overflow-hidden'>
          <div className='px-6 py-4 border-b border-gray-100 flex items-center justify-between'>
            <h3 className='text-base font-black text-primary uppercase tracking-wider leading-none'>
              Mục đích sử dụng
            </h3>
          </div>
          <CardContent className='p-6 h-[350px]'>
            {isSummaryLoading ? (
              <div className='h-full flex items-center justify-center text-primary'>
                <Loader2 className='h-8 w-8 animate-spin' />
              </div>
            ) : summaryData && summaryData.typeDistribution.length > 0 ? (
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={summaryData.typeDistribution.map((t) => ({
                      name: BookingTypeLabels[t.type as keyof typeof BookingTypeLabels] || t.type,
                      value: t.count
                    }))}
                    cx='50%'
                    cy='45%'
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey='value'
                  >
                    {summaryData.typeDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Legend
                    verticalAlign='bottom'
                    height={36}
                    iconType='circle'
                    wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className='h-full flex items-center justify-center text-muted-foreground font-bold italic text-sm'>
                Không có dữ liệu
              </div>
            )}
          </CardContent>
        </Card>

        <Card className='lg:col-span-2 bg-white rounded-2xl border border-border shadow-sm overflow-hidden'>
          <div className='px-6 py-4 border-b border-gray-100 flex items-center justify-between'>
            <div className='flex flex-col gap-1.5'>
              <h3 className='text-base font-black text-primary uppercase tracking-wider leading-none'>
                Tần suất theo ca & Loại hình
              </h3>
              <p className='text-[10px] font-bold text-muted-foreground uppercase leading-none'>
                Đơn vị tính: Giờ (thời lượng thực)
              </p>
            </div>
          </div>
          <CardContent className='p-6 h-[350px]'>
            {isDistributionLoading ? (
              <div className='h-full flex items-center justify-center text-primary'>
                <Loader2 className='h-8 w-8 animate-spin' />
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#f1f5f9' />
                  <XAxis
                    dataKey='name'
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Legend
                    verticalAlign='top'
                    align='right'
                    iconType='circle'
                    wrapperStyle={{ paddingBottom: '20px', fontSize: '11px', fontWeight: 'bold' }}
                  />
                  {allChartKeys.map((key, index) => (
                    <Bar
                      key={key}
                      dataKey={key}
                      name={BookingTypeLabels[key as keyof typeof BookingTypeLabels] || key}
                      stackId='a'
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                      radius={index === allChartKeys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                      barSize={32}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className='h-full flex items-center justify-center text-muted-foreground font-bold italic text-sm'>
                Không có dữ liệu biểu đồ
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className='bg-white rounded-2xl border border-border overflow-hidden shadow-sm'>
        <div className='px-6 py-4 border-b border-gray-100 flex items-center justify-between'>
          <div className='flex flex-col gap-1.5'>
            <h3 className='text-base font-black text-primary uppercase tracking-wider leading-none'>
              Xếp hạng hiệu quả hoạt động các nhóm
            </h3>
            <p className='text-[10px] font-bold text-muted-foreground uppercase leading-none'>
              Đánh giá KPI dựa trên tần suất sử dụng
            </p>
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
                      <th className='px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase'>Hạng</th>
                      <th className='px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase'>
                        Nhóm nghiên cứu
                      </th>
                      <th className='px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase'>Loại hình</th>
                      <th className='px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase'>
                        Giảng viên hướng dẫn
                      </th>
                      <th className='px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase'>
                        Phòng hay dùng
                      </th>
                      <th className='px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase'>Ca hay dùng</th>
                      <th className='px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase'>Tổng giờ</th>
                      <th className='px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase'>Booking</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-50'>
                    {usageDetailsData?.data.map((row, i) => (
                      <tr key={row.groupId} className='hover:bg-slate-50/50 transition-colors group'>
                        <td className='px-6 py-4'>
                          <div
                            className={cn(
                              'w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-sm',
                              i === 0
                                ? 'bg-yellow-100 text-yellow-700'
                                : i === 1
                                  ? 'bg-slate-200 text-slate-700'
                                  : i === 2
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'bg-gray-50 text-gray-500'
                            )}
                          >
                            {i + 1 + currentPage * 10}
                          </div>
                        </td>
                        <td className='px-6 py-4 font-black text-foreground text-sm uppercase'>{row.groupName}</td>
                        <td className='px-6 py-4'>
                          <Badge variant={row.groupType === 'RESEARCH' ? 'research' : 'thesis'}>
                            {GroupTypeLabel[row.groupType as keyof typeof GroupTypeLabel] || row.groupType}
                          </Badge>
                        </td>
                        <td className='px-6 py-4 font-bold text-muted-foreground text-sm'>{row.lecturerName}</td>
                        <td className='px-6 py-4 font-black text-foreground text-sm uppercase'>{row.mostUsedRoom}</td>
                        <td className='px-6 py-4 font-bold text-muted-foreground text-sm uppercase'>
                          {row.mostUsedShift}
                        </td>
                        <td className='px-6 py-4 text-center font-black text-primary text-sm'>
                          {Math.round(row.totalHours)}
                        </td>
                        <td className='px-6 py-4 text-center font-bold text-muted-foreground text-sm'>
                          {row.bookingCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className='px-6 py-4 border-t border-gray-100'>
                <PaginationCustom
                  currentPage={currentPage + 1}
                  totalPages={usageDetailsData?.totalPages || 0}
                  totalItems={usageDetailsData?.totalItems || 0}
                  limit={10}
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

export default AdminReportResearchGroupsPage
