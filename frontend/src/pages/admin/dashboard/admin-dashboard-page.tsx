import { useMemo } from 'react'
import { CalendarDays, Lock, Sun, Moon, PieChart as LucidePieChart } from 'lucide-react'
import { useSearchParams, useNavigate } from 'react-router'

import KPICard from '@/components/common/kpi-card'
import FilterBar from '@/components/admin/dashboard/filter-bar'
import RecentPendingRequests from '@/components/admin/dashboard/recent-pending-requests'
import DeviceUsageChart from '@/components/admin/dashboard/device-usage-chart'
import TrendChart from '@/components/admin/dashboard/trend-chart'
import type { RoomShiftData } from '@/components/admin/dashboard/trend-chart'
import BookingTypePieChart from '@/components/admin/dashboard/booking-type-pie-chart'
import RoomShiftChart from '@/components/admin/dashboard/room-shift-chart'

import {
  useDashboardKpiQuery,
  useRoomActivityQuery,
  useBookingTypeDistributionQuery,
  useBookingTrendQuery
} from '@/queries/dashboard.queries'
import { useRecentPendingBookingsQuery } from '@/queries/booking.queries'
import { PATHS } from '@/constants/paths'
import { calculateDateRange, type FilterMode } from '@/utils/statistics'

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const filter = (searchParams.get('mode') as FilterMode) || 'today'
  const from = searchParams.get('from') || ''
  const to = searchParams.get('to') || ''
  const month = searchParams.get('month') || (new Date().getMonth() + 1).toString()
  const year = searchParams.get('year') || new Date().getFullYear().toString()
  const rangeType =
    (searchParams.get('rangeType') as 'date' | 'month') || (searchParams.get('month') ? 'month' : 'date')

  const setFilter = (mode: FilterMode) => {
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
  }

  const setFrom = (date: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (date) newParams.set('from', date)
    else newParams.delete('from')
    setSearchParams(newParams)
  }

  const setTo = (date: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (date) newParams.set('to', date)
    else newParams.delete('to')
    setSearchParams(newParams)
  }

  const setMonth = (m: string) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('month', m)
    setSearchParams(newParams)
  }

  const setYear = (y: string) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('year', y)
    setSearchParams(newParams)
  }

  const setRangeType = (type: 'date' | 'month') => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('rangeType', type)
    if (type === 'date') {
      newParams.delete('month')
      newParams.delete('year')
    } else {
      newParams.set('month', month)
      newParams.set('year', year)
      newParams.delete('from')
      newParams.delete('to')
    }
    setSearchParams(newParams)
  }

  const dateRange = useMemo(() => {
    const { startDate, endDate } = calculateDateRange(filter, from, to, month, year)
    return { fromDate: startDate, toDate: endDate }
  }, [filter, from, to, month, year])

  const { data: kpiData, isLoading: isKpiLoading } = useDashboardKpiQuery(dateRange)
  const { data: pendingBookings, isLoading: isPendingLoading } = useRecentPendingBookingsQuery(5)
  const { data: roomActivity } = useRoomActivityQuery(dateRange)
  const { data: bookingTypeDistribution, isLoading: isBookingTypeLoading } = useBookingTypeDistributionQuery(dateRange)

  const currentRoomActivity = useMemo(() => {
    if (!roomActivity) return []
    return roomActivity.map((ra) => {
      const slotMap = ra.slots.reduce(
        (acc, s) => {
          acc[s.slotName] = s.count
          return acc
        },
        {} as Record<string, number>
      )
      return {
        room: ra.roomName,
        ...slotMap
      }
    }) as RoomShiftData[]
  }, [roomActivity])

  const { data: bookingTrend, isLoading: isBookingTrendLoading } = useBookingTrendQuery(dateRange)

  const trendData = useMemo(() => {
    if (!bookingTrend) return []
    return bookingTrend.map((item) => ({
      date: item.date,
      booking: item.count
    }))
  }, [bookingTrend])

  const bookingTypeData = useMemo(() => {
    if (!bookingTypeDistribution) return []
    const typeLabelMap: Record<string, string> = {
      THESIS: 'Khóa luận',
      PERSONAL: 'Cá nhân',
      GROUP: 'Nhóm'
    }
    return bookingTypeDistribution.map((item) => ({
      name: typeLabelMap[item.name] || item.name,
      value: item.value
    }))
  }, [bookingTypeDistribution])

  const recentPendingRequests = useMemo(() => {
    if (!pendingBookings) return []
    return pendingBookings.map((b) => ({
      id: b.id,
      room: b.room,
      shift: b.slot?.slotName || '-',
      shiftTime: b.slot ? `${b.slot.startTime.substring(0, 5)} - ${b.slot.endTime.substring(0, 5)}` : '-',
      bookingDate: b.bookingDate,
      createdAt: b.createdAt,
      type: b.type,
      groupName: b.groupName,
      status: 'PENDING',
      user: {
        name: b.requester.fullName,
        code: b.requester.username
      }
    }))
  }, [pendingBookings])

  const roomActivityData = useMemo(() => {
    const data = currentRoomActivity
    return [...data].sort((a, b) => {
      const sumA = Object.keys(a)
        .filter((k) => k.toUpperCase().startsWith('CA'))
        .reduce((sum, k) => sum + (((a as Record<string, unknown>)[k] as number) || 0), 0)
      const sumB = Object.keys(b)
        .filter((k) => k.toUpperCase().startsWith('CA'))
        .reduce((sum, k) => sum + (((b as Record<string, unknown>)[k] as number) || 0), 0)
      return sumB - sumA
    })
  }, [currentRoomActivity])

  const handleViewDetail = (id: number) => {
    navigate(PATHS.ADMIN.APPROVALS.BOOKING_DETAIL.replace(':id', id.toString()))
  }

  const handleViewAll = () => {
    navigate(PATHS.ADMIN.APPROVALS.LAB_BOOKINGS)
  }

  return (
    <div className='space-y-6'>
      {/* Header & Filter */}
      <div className='mb-8 flex flex-col md:flex-row md:items-start justify-between gap-6'>
        <div className='flex flex-col gap-2'>
          <h1 className='text-3xl font-black tracking-tight text-primary uppercase'>Dashboard</h1>
          <p className='text-muted-foreground font-medium'>Thống kê hệ thống đăng ký phòng lab</p>
        </div>

        <FilterBar
          filter={filter}
          onFilterChange={setFilter}
          from={from}
          onFromChange={setFrom}
          to={to}
          onToChange={setTo}
          rangeType={rangeType}
          onRangeTypeChange={setRangeType}
          month={month}
          onMonthChange={setMonth}
          year={year}
          onYearChange={setYear}
        />
      </div>

      {/* KPI Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 text-foreground'>
        <KPICard
          title='Tổng booking'
          value={isKpiLoading ? '...' : (kpiData?.totalBooking.value.toLocaleString() ?? '-')}
          icon={CalendarDays}
          growth={kpiData?.totalBooking.growth}
          isUp={kpiData?.totalBooking.isUp ?? true}
          color='primary'
        />
        <KPICard
          title='Tỷ lệ sử dụng'
          value={isKpiLoading ? '...' : `${kpiData?.usageRate.value ?? 0}%`}
          icon={LucidePieChart}
          growth={kpiData?.usageRate.growth}
          isUp={kpiData?.usageRate.isUp ?? true}
          color='info'
        />
        <KPICard
          title='Ca cao điểm'
          value={isKpiLoading ? '...' : (kpiData?.peakShift.shiftName ?? '-')}
          subValue={kpiData?.peakShift.timeRange ?? '-'}
          icon={Sun}
          color='warning'
        />
        <KPICard
          title='Ca thấp điểm'
          value={isKpiLoading ? '...' : (kpiData?.lowShift.shiftName ?? '-')}
          subValue={kpiData?.lowShift.timeRange ?? '-'}
          icon={Moon}
          color='info'
        />
        <KPICard
          title='Đơn chờ duyệt'
          value={isKpiLoading ? '...' : (kpiData?.pendingApproval.value.toLocaleString() ?? '-')}
          icon={Lock}
          growth={kpiData?.pendingApproval.growth}
          isUp={kpiData?.pendingApproval.isUp ?? true}
          color='destructive'
        />
        <KPICard
          title='Tỷ lệ No-show'
          value={isKpiLoading ? '...' : `${kpiData?.noShowRate.value ?? 0}%`}
          icon={LucidePieChart}
          growth={kpiData?.noShowRate.growth}
          isUp={kpiData?.noShowRate.isUp ?? true}
          color='warning'
        />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2'>
          <RecentPendingRequests
            requests={recentPendingRequests}
            isLoading={isPendingLoading}
            onViewDetail={handleViewDetail}
            onViewAll={handleViewAll}
          />
        </div>
        <DeviceUsageChart dateRange={dateRange} />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <TrendChart
          filter={filter}
          trendData={trendData}
          roomShiftData={roomActivityData}
          roomActivity={roomActivity}
          isLoading={isBookingTrendLoading}
        />
        <BookingTypePieChart data={bookingTypeData} isLoading={isBookingTypeLoading} />
      </div>

      {filter !== 'today' && <RoomShiftChart data={roomActivityData} />}
    </div>
  )
}
