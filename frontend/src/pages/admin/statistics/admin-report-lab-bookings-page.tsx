import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X, CheckCircle2, AlertCircle, Eye, Zap, Timer, Loader2, Download } from 'lucide-react'
import { DatePicker } from '@/components/ui/date-picker'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts'
import { cn } from '@/lib/utils'
import KPICard from '@/components/common/kpi-card'
import { calculateDateRange, type FilterMode } from '@/utils/statistics'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  BookingStatusOptions,
  BookingTypeLabels,
  RequestStatus,
  BookingType,
  RequestStatusLabels
} from '@/constants/types'
import {
  useLabBookingKpiQuery,
  useBookingOutcomeDistributionQuery,
  useBookingSubmissionTrendQuery,
  useBookingAuditLogsQuery
} from '@/queries/lab-booking-statistics.queries'
import PaginationCustom from '@/components/common/pagination-custom'
import type { BookingAuditLogResponse, BookingOutcomeResponse } from '@/schemas/lab-booking-statistics.schema'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate } from '@/utils/format'

const AdminReportLabBookingsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const filterMode = (searchParams.get('mode') as FilterMode) || 'today'
  const fromParam = searchParams.get('from') || undefined
  const toParam = searchParams.get('to') || undefined
  const monthParam = searchParams.get('month') || undefined
  const yearParam = searchParams.get('year') || undefined

  const [currentPage, setCurrentPage] = useState(0)
  const [pendingStatus, setPendingStatus] = useState<string>(searchParams.get('status') || 'all')
  const [pendingAdmin, setPendingAdmin] = useState<string>(searchParams.get('admin') || 'all')

  // States for Custom Range
  const [rangeType, setRangeType] = useState<'date' | 'month'>(
    (searchParams.get('rangeType') as 'date' | 'month') || (searchParams.get('month') ? 'month' : 'date')
  )
  const [tempFrom, setTempFrom] = useState<string>(fromParam || '')
  const [tempTo, setTempTo] = useState<string>(toParam || '')
  const [tempMonth, setTempMonth] = useState<string>(monthParam || (new Date().getMonth() + 1).toString())
  const [tempYear, setTempYear] = useState<string>(yearParam || new Date().getFullYear().toString())

  const { startDate, endDate } = calculateDateRange(filterMode, fromParam, toParam, monthParam, yearParam)

  const activeStatus = searchParams.get('status') || 'all'
  const activeAdmin = searchParams.get('admin') || 'all'

  const apiParams = useMemo(() => ({ startDate, endDate }), [startDate, endDate])

  const auditLogParams = useMemo(
    () => ({
      ...apiParams,
      status: activeStatus !== 'all' ? (activeStatus as keyof typeof RequestStatus) : undefined,
      adminId: activeAdmin !== 'all' ? activeAdmin : undefined,
      page: currentPage,
      limit: 10
    }),
    [apiParams, activeStatus, activeAdmin, currentPage]
  )

  const { data: kpis, isLoading: isKpiLoading } = useLabBookingKpiQuery(apiParams)
  const { data: outcomeData, isLoading: isOutcomeLoading } = useBookingOutcomeDistributionQuery(apiParams)
  const { data: trendData, isLoading: isTrendLoading } = useBookingSubmissionTrendQuery(apiParams)
  const { data: auditLogs, isLoading: isAuditLogsLoading } = useBookingAuditLogsQuery(auditLogParams)

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
    if (pendingStatus !== 'all') newParams.set('status', pendingStatus)
    else newParams.delete('status')

    if (pendingAdmin !== 'all') newParams.set('admin', pendingAdmin)
    else newParams.delete('admin')

    if (filterMode === 'range') {
      newParams.set('rangeType', rangeType)
      if (rangeType === 'date') {
        if (tempFrom) newParams.set('from', tempFrom)
        if (tempTo) newParams.set('to', tempTo)
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
    setPendingStatus('all')
    setPendingAdmin('all')
    const newParams = new URLSearchParams(searchParams)
    newParams.delete('status')
    newParams.delete('admin')
    setSearchParams(newParams)
    setCurrentPage(0)
  }

  const hasFilter = useMemo(() => {
    return (
      (searchParams.has('status') && searchParams.get('status') !== 'all') ||
      (searchParams.has('admin') && searchParams.get('admin') !== 'all')
    )
  }, [searchParams])

  const outcomeChartData = useMemo(() => {
    if (!outcomeData) return []
    const colors: Record<keyof typeof RequestStatus, string> = {
      APPROVED: '#10b981',
      REJECTED: '#ef4444',
      CANCELED: '#94a3b8',
      SYSTEM_CANCELED: '#f59e0b',
      PENDING: '#6366f1'
    }

    return outcomeData.map((item: BookingOutcomeResponse) => ({
      name: RequestStatusLabels[item.status as keyof typeof RequestStatusLabels] || item.status,
      value: item.count,
      color: colors[item.status as keyof typeof RequestStatus] || '#94a3b8'
    }))
  }, [outcomeData])

  const totalBookings = useMemo(() => {
    if (!outcomeData) return 0
    return outcomeData.reduce((acc: number, curr: BookingOutcomeResponse) => acc + curr.count, 0)
  }, [outcomeData])

  return (
    <div className='flex flex-col gap-6 pb-10'>
      {/* Header */}
      <div className='flex flex-col gap-2'>
        <h1 className='text-3xl font-black tracking-tight text-primary uppercase'>Báo cáo phê duyệt</h1>
        <p className='text-muted-foreground font-medium'>Thống kê và phân tích hiệu suất xử lý đơn đăng ký phòng Lab</p>
      </div>

      {/* Filter Bar */}
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
            <div className='w-full sm:w-[180px]'>
              <Select value={pendingStatus} onValueChange={setPendingStatus}>
                <SelectTrigger className='w-full h-10 bg-white font-medium focus:ring-0'>
                  <SelectValue placeholder='Trạng thái' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Tất cả trạng thái</SelectItem>
                  {BookingStatusOptions.filter((opt) => opt.value !== '').map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='w-full sm:w-[180px]'>
              <Select value={pendingAdmin} onValueChange={setPendingAdmin}>
                <SelectTrigger className='w-full h-10 bg-white font-medium focus:ring-0'>
                  <SelectValue placeholder='Admin' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Tất cả Admin</SelectItem>
                  <SelectItem value='ADMIN'>Hệ thống Admin</SelectItem>
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

        {/* Custom Range Panel */}
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
                      <SelectTrigger className='h-9 w-[120px] bg-white focus:ring-0'>
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
                      <SelectTrigger className='h-9 w-[100px] bg-white focus:ring-0'>
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

      {/* Row 1: KPI Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2'>
        {isKpiLoading ? (
          <div className='col-span-4 flex justify-center py-8'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
          </div>
        ) : kpis ? (
          <>
            <KPICard
              title='Đơn chờ xử lý'
              value={kpis.pendingCount}
              subValue='Cần giải quyết ngay'
              icon={Timer}
              color={kpis.pendingCount > 20 ? 'destructive' : 'warning'}
            />
            <KPICard
              title='Tốc độ duyệt TB'
              value={`${Math.round(kpis.avgProcessingSpeedMinutes)} Phút`}
              subValue='Thời gian phản hồi trung bình'
              icon={Zap}
              color='info'
            />
            <KPICard
              title='Tỷ lệ chấp thuận'
              value={`${kpis.approvalRate.toFixed(1)}%`}
              subValue=' Trên tổng đơn đã xử lý'
              icon={CheckCircle2}
              color='success'
            />
            <KPICard
              title='Xung đột hệ thống'
              value={`${kpis.conflictRate.toFixed(1)}%`}
              subValue='Tỷ lệ đơn bị hủy tự động'
              icon={AlertCircle}
              color='destructive'
            />
          </>
        ) : null}
      </div>

      {/* Row 2: Charts Area */}
      <div className='grid grid-cols-1 lg:grid-cols-10 gap-6'>
        {/* Left Column (40%) */}
        <Card className='lg:col-span-4 bg-white rounded-2xl border border-border shadow-sm overflow-hidden'>
          <div className='px-6 py-4 border-b border-gray-100 flex items-center justify-between'>
            <div className='flex flex-col gap-1.5'>
              <h3 className='text-base font-black text-primary uppercase tracking-wider leading-none'>
                Kết quả phê duyệt
              </h3>
              <p className='text-[10px] font-bold text-muted-foreground uppercase leading-none'>
                Tỷ lệ phân bổ trạng thái đơn
              </p>
            </div>
          </div>
          <CardContent className='p-6 h-[400px] relative'>
            {isOutcomeLoading ? (
              <div className='h-full flex items-center justify-center'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
              </div>
            ) : outcomeChartData.length > 0 ? (
              <>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={outcomeChartData}
                      cx='50%'
                      cy='45%'
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey='value'
                    >
                      {outcomeChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
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
                      wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '20px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className='absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center'>
                  <p className='text-[10px] font-black text-slate-400 uppercase leading-none'>Tổng số đơn</p>
                  <h4 className='text-2xl font-black text-slate-800 tracking-tighter'>{totalBookings}</h4>
                </div>
              </>
            ) : (
              <div className='h-full flex items-center justify-center text-muted-foreground font-bold italic text-sm'>
                Không có dữ liệu
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column (60%) */}
        <Card className='lg:col-span-6 bg-white rounded-2xl border border-border shadow-sm overflow-hidden'>
          <div className='px-6 py-4 border-b border-gray-100 flex items-center justify-between'>
            <div className='flex flex-col gap-1.5'>
              <h3 className='text-base font-black text-primary uppercase tracking-wider leading-none'>
                Xu thế gửi đơn
              </h3>
              <p className='text-[10px] font-bold text-muted-foreground uppercase leading-none'>
                Biểu đồ trực quan theo giờ
              </p>
            </div>
          </div>
          <CardContent className='p-6 h-[400px] '>
            {isTrendLoading ? (
              <div className='h-full flex items-center justify-center'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
              </div>
            ) : trendData && trendData.length > 0 ? (
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id='colorCount' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='5%' stopColor='#3f51b5' stopOpacity={0.1} />
                      <stop offset='95%' stopColor='#3f51b5' stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#f1f5f9' />
                  <XAxis
                    dataKey='hour'
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                    tickFormatter={(val) => `${val}h`}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    }}
                    labelFormatter={(val) => `${val}h`}
                  />
                  <Area
                    type='monotone'
                    dataKey='count'
                    name='Số lượng đơn'
                    stroke='#3f51b5'
                    strokeWidth={3}
                    fillOpacity={1}
                    fill='url(#colorCount)'
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className='h-full flex items-center justify-center text-muted-foreground font-bold italic text-sm'>
                Không có dữ liệu xu hướng
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Audit Log Table */}
      <Card className='bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm'>
        <div className='px-6 py-4 border-b border-gray-100 flex items-center justify-between'>
          <div className='flex flex-col gap-1.5'>
            <h3 className='text-base font-black text-primary uppercase tracking-wider leading-none'>Nhật ký xử lý</h3>
            <p className='text-[10px] font-bold text-muted-foreground uppercase leading-none'>
              Danh sách chi tiết lịch sử xét duyệt
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
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow className='bg-gray-50/50 border-b border-gray-100 h-14'>
                <TableHead className='w-16 text-center font-bold text-gray-700 text-[13px] uppercase'>STT</TableHead>
                <TableHead className='font-bold text-gray-700 text-[13px] uppercase'>Người yêu cầu</TableHead>
                <TableHead className='font-bold text-gray-700 text-[13px] uppercase'>Loại đơn</TableHead>
                <TableHead className='font-bold text-gray-700 text-[13px] uppercase'>Thời gian gửi</TableHead>
                <TableHead className='font-bold text-gray-700 text-[13px] uppercase'>Xử lý</TableHead>
                <TableHead className='font-bold text-gray-700 text-[13px] uppercase'>Tốc độ</TableHead>
                <TableHead className='text-center font-bold text-gray-700 text-[13px] uppercase'>Trạng thái</TableHead>
                <TableHead className='w-16'></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isAuditLogsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className='h-20'>
                    {Array.from({ length: 8 }).map((__, j) => (
                      <TableCell key={j}>
                        <div className='h-4 bg-gray-100 animate-pulse rounded' />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : auditLogs?.data.length ? (
                auditLogs.data.map((log: BookingAuditLogResponse, index: number) => (
                  <TableRow
                    key={log.bookingId}
                    className='border-b border-gray-100 hover:bg-gray-50/50 transition-colors h-20'
                  >
                    <TableCell className='text-center text-gray-500 font-bold text-sm'>
                      {currentPage * 10 + index + 1}
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        <Avatar className='h-8 w-8 border border-border'>
                          <AvatarImage src={log.requesterAvatar} />
                          <AvatarFallback className='text-[10px] bg-primary/5 text-primary font-bold'>
                            {log.requesterName.split(' ').pop()?.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className='flex flex-col'>
                          <span className='text-[15px] font-bold text-gray-900 leading-none'>{log.requesterName}</span>
                          <span className='text-[12px] text-gray-400 font-mono mt-1'>MSSV: {log.requesterMssv}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          log.bookingType === BookingType.THESIS
                            ? 'thesis'
                            : log.bookingType === BookingType.GROUP
                              ? 'research'
                              : 'personal'
                        }
                        className='text-[12px] font-bold uppercase border-none px-2'
                      >
                        {BookingTypeLabels[log.bookingType] || log.bookingType}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-[14px] font-bold text-gray-700'>
                      {formatDate(log.submitTime)}
                      <div className='text-[12px] text-gray-500 font-medium'>
                        {new Date(log.submitTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </TableCell>
                    <TableCell className='text-[14px] font-bold text-gray-700'>
                      {log.processTime ? formatDate(log.processTime) : '-'}
                      {log.processTime && (
                        <div className='text-[12px] text-gray-500 font-medium'>
                          {new Date(log.processTime).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {log.processingTimeMinutes !== undefined && log.processingTimeMinutes !== null ? (
                        <div className='flex items-center gap-1.5 text-blue-600'>
                          <Timer className='h-3 w-3' />
                          <span className='text-[11px] font-black'>Sau {log.processingTimeMinutes} phút</span>
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className='text-center'>
                      <Badge
                        variant={
                          log.status === RequestStatus.APPROVED
                            ? 'approved'
                            : log.status === RequestStatus.REJECTED
                              ? 'rejected'
                              : log.status === RequestStatus.PENDING
                                ? 'pending'
                                : 'system_canceled'
                        }
                        className='font-bold text-[12px] uppercase px-2'
                      >
                        {RequestStatusLabels[log.status] || log.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size='sm'
                        variant='outline'
                        className='h-9 px-4 text-[#153898] hover:bg-blue-50 border-blue-100 font-bold gap-1.5 border-primary text-sm'
                      >
                        <Eye className='h-4 w-4' /> Xem
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className='h-48 text-center'>
                    <p className='text-muted-foreground font-medium'>Không có dữ liệu nhật ký</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {auditLogs && auditLogs.totalPages > 1 && (
          <div className='px-6 py-4 border-t border-gray-100'>
            <PaginationCustom
              currentPage={currentPage + 1}
              totalPages={auditLogs.totalPages}
              totalItems={auditLogs.totalItems}
              limit={10}
              onPageChange={(p: number) => setCurrentPage(p - 1)}
            />
          </div>
        )}
      </Card>
    </div>
  )
}

export default AdminReportLabBookingsPage
