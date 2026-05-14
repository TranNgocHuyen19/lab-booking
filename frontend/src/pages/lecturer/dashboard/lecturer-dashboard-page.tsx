import { useNavigate } from 'react-router'
import { useSearchParams } from 'react-router'
import { useMemo } from 'react'
import {
  Users,
  BookOpen,
  CalendarDays,
  UserPlus,
  ArrowRight,
  Check,
  X,
  GraduationCap,
  Loader2,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import KPICard from '@/components/common/kpi-card'
import FilterBar from '@/components/admin/dashboard/filter-bar'
import { useLecturerDashboardQuery } from '@/queries/lecturer-dashboard.queries'
import { useApproveJoinRequestMutation, useRejectJoinRequestMutation } from '@/queries/group-join-request.queries'
import { PATHS } from '@/constants/paths'
import { BookingTypeLabels } from '@/constants/types'
import { calculateDateRange, type FilterMode } from '@/utils/statistics'
import { toast } from 'sonner'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export default function LecturerDashboardPage() {
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

  const { data, isLoading } = useLecturerDashboardQuery(dateRange)
  const approveMutation = useApproveJoinRequestMutation()
  const rejectMutation = useRejectJoinRequestMutation()

  const handleApprove = (requestId: number) => {
    approveMutation.mutate(
      { requestId },
      {
        onSuccess: () => toast.success('Đã duyệt yêu cầu tham gia nhóm'),
        onError: () => toast.error('Lỗi khi duyệt yêu cầu')
      }
    )
  }

  const handleReject = (requestId: number) => {
    rejectMutation.mutate(
      { requestId, data: { responseNote: '' } },
      {
        onSuccess: () => toast.success('Đã từ chối yêu cầu tham gia nhóm'),
        onError: () => toast.error('Lỗi khi từ chối yêu cầu')
      }
    )
  }

  if (isLoading) {
    return (
      <div className='flex h-[400px] items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    )
  }

  const { kpis, upcomingAgenda, quickJoinRequests } = data || {
    kpis: { pendingJoinRequests: 0, weeklySchedules: 0, guidingGroups: 0, totalStudents: 0 },
    upcomingAgenda: [],
    quickJoinRequests: []
  }

  return (
    <TooltipProvider delayDuration={100}>
      <div className='space-y-6'>
        {/* Header */}
        <div className='mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
          <div className='flex flex-col gap-2'>
            <h1 className='text-3xl font-black tracking-tight text-primary uppercase'>Dashboard Giảng viên</h1>
            <p className='text-muted-foreground font-medium'>Quản lý lịch dạy và nhóm nghiên cứu</p>
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
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          <KPICard
            title='Yêu cầu tham gia'
            value={kpis.pendingJoinRequests}
            subValue='Sinh viên đang chờ duyệt'
            icon={UserPlus}
            color='destructive'
          />
          <KPICard
            title='Lịch đã đặt'
            value={`${kpis.weeklySchedules} Ca`}
            subValue='Tổng số ca đã đặt'
            icon={CalendarDays}
            color='info'
          />
          <KPICard
            title='Nhóm hướng dẫn'
            value={kpis.guidingGroups}
            subValue='Nhóm đang hoạt động'
            icon={BookOpen}
            color='primary'
          />
          <KPICard
            title='Tổng sinh viên'
            value={kpis.totalStudents}
            subValue='Thành viên các nhóm'
            icon={Users}
            color='success'
          />
        </div>

        {/* Main Content */}
        <div className='grid grid-cols-1 lg:grid-cols-10 gap-6'>
          {/* Left: Upcoming Agenda (70%) */}
          <div className='lg:col-span-7 space-y-4'>
            <Card className='rounded-2xl border-none shadow-sm overflow-hidden'>
              <div className='px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white'>
                <h3 className='text-base font-black text-primary uppercase tracking-wider'>Lịch trình sắp tới</h3>
                <Button
                  variant='ghost'
                  size='sm'
                  className='text-primary font-bold hover:bg-primary/5 gap-1'
                  onClick={() => navigate(PATHS.LECTURER.BOOKINGS)}
                >
                  Xem lịch chi tiết <ArrowRight className='h-4 w-4' />
                </Button>
              </div>
              <CardContent className='p-6 bg-slate-50/50 min-h-[400px]'>
                {upcomingAgenda.length > 0 ? (
                  <div className='space-y-6'>
                    {upcomingAgenda.map((item) => (
                      <div
                        key={item.bookingId}
                        className='flex items-center gap-4 p-4 bg-white rounded-xl border border-border shadow-sm hover:border-primary/30 transition-all'
                      >
                        <div className='flex flex-col items-center justify-center min-w-[80px] p-2 bg-primary/5 rounded-lg'>
                          <span className='text-[10px] font-black text-primary uppercase'>
                            {new Date(item.bookingDate).toLocaleDateString('vi-VN', { weekday: 'short' })}
                          </span>
                          <span className='text-xl font-black text-primary'>
                            {new Date(item.bookingDate).getDate()}
                          </span>
                          <span className='text-[10px] font-bold text-slate-400'>
                            Thg {new Date(item.bookingDate).getMonth() + 1}
                          </span>
                        </div>
                        <div className='flex-1 space-y-1'>
                          <div className='flex items-center gap-2'>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className='w-fit'>
                                  <Badge
                                    variant='outline'
                                    className='bg-white text-[10px] font-black uppercase text-primary border-primary/20 cursor-help'
                                  >
                                    {item.slotName}
                                  </Badge>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent
                                side='top'
                                className='font-bold text-xs bg-gray-900 border-gray-800 translate-y-[-4px]'
                              >
                                <p>{item.slotTime}</p>
                              </TooltipContent>
                            </Tooltip>
                            <h4 className='font-black text-slate-900'>{item.groupName}</h4>
                          </div>
                          <div className='flex items-center gap-4 text-xs font-bold text-slate-500'>
                            <div className='flex items-center gap-1'>
                              <Clock className='h-3 w-3' /> Phòng {item.roomName}
                            </div>
                          </div>
                        </div>
                        <Badge className='bg-slate-100 text-slate-600 border-none font-bold uppercase text-[10px]'>
                          {BookingTypeLabels[item.bookingType as keyof typeof BookingTypeLabels] || item.bookingType}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='flex flex-col items-center justify-center h-[350px] text-slate-400 gap-2'>
                    <CalendarDays className='h-12 w-12 opacity-20' />
                    <p className='font-bold italic'>Không có lịch trình sắp tới</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Quick Approval Widget (30%) */}
          <div className='lg:col-span-3 space-y-4'>
            <Card className='rounded-2xl border-none shadow-sm overflow-hidden h-full'>
              <div className='px-6 py-4 border-b border-gray-100 bg-white'>
                <h3 className='text-base font-black text-primary uppercase tracking-wider'>Duyệt yêu cầu nhanh</h3>
              </div>
              <CardContent className='p-4 space-y-4 min-h-[400px]'>
                {quickJoinRequests.length > 0 ? (
                  quickJoinRequests.map((req) => (
                    <div
                      key={req.requestId}
                      className='p-3 bg-slate-50 rounded-xl border border-transparent hover:border-slate-200 transition-all'
                    >
                      <div className='flex items-center gap-3 mb-3'>
                        <Avatar className='h-10 w-10 border-2 border-white shadow-sm'>
                          <AvatarImage src={req.studentAvatar || undefined} />
                          <AvatarFallback className='bg-primary/10 text-primary font-black text-xs'>
                            {req.studentName.split(' ').pop()?.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className='flex flex-col overflow-hidden'>
                          <span className='font-black text-slate-900 text-sm truncate'>{req.studentName}</span>
                          <span className='text-[10px] font-bold text-slate-400'>
                            vào <span className='text-primary'>{req.groupName}</span>
                          </span>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Button
                          size='sm'
                          className='flex-1 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1'
                          onClick={() => handleApprove(req.requestId)}
                          disabled={approveMutation.isPending}
                        >
                          <Check className='h-3.5 w-3.5' /> Duyệt
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          className='flex-1 h-8 rounded-lg border-rose-200 text-rose-600 hover:bg-rose-50 font-bold gap-1'
                          onClick={() => handleReject(req.requestId)}
                          disabled={rejectMutation.isPending}
                        >
                          <X className='h-3.5 w-3.5' /> Hủy
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className='flex flex-col items-center justify-center h-[350px] text-slate-400 gap-2'>
                    <UserPlus className='h-12 w-12 opacity-20' />
                    <p className='font-bold italic text-sm'>Không có yêu cầu nào</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Row 3: Quick Actions */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          <Card
            className='group p-4 rounded-xl border border-slate-200 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all'
            onClick={() => navigate(PATHS.LECTURER.BOOKINGS + '?mode=THESIS')}
          >
            <div className='flex items-center gap-4'>
              <div className='p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-all'>
                <GraduationCap className='h-6 w-6' />
              </div>
              <div>
                <h4 className='font-black text-slate-900'>Đặt lịch KLTN</h4>
                <p className='text-[10px] font-bold text-slate-400 uppercase'>Chế độ Thesis (KLTN)</p>
              </div>
            </div>
          </Card>
          {/* Can add more cards here */}
        </div>
      </div>
    </TooltipProvider>
  )
}
