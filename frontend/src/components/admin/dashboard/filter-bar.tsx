import React from 'react'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

export type FilterMode = 'today' | '7d' | 'month' | 'range'

export interface FilterBarProps {
  filter: FilterMode
  onFilterChange: (mode: FilterMode) => void
  from: string
  onFromChange: (date: string) => void
  to: string
  onToChange: (date: string) => void
  rangeType?: 'date' | 'month'
  onRangeTypeChange?: (type: 'date' | 'month') => void
  month?: string
  onMonthChange?: (month: string) => void
  year?: string
  onYearChange?: (year: string) => void
}

const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  onFilterChange,
  from,
  onFromChange,
  to,
  onToChange,
  rangeType = 'date',
  onRangeTypeChange,
  month,
  onMonthChange,
  year,
  onYearChange
}) => {
  return (
    <div className='flex flex-col gap-4 items-end'>
      <div className='flex flex-wrap items-center justify-end gap-3'>
        <div className='flex p-1 bg-slate-50 rounded-xl border border-border shadow-sm'>
          {(['today', '7d', 'month', 'range'] as const).map((f) => (
            <Button
              key={f}
              size='sm'
              variant={filter === f ? 'default' : 'ghost'}
              onClick={() => onFilterChange(f)}
              className={cn(
                'h-9 px-6 rounded-lg font-bold transition-all',
                filter === f ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-foreground'
              )}
            >
              {f === 'today' ? 'Hôm nay' : f === '7d' ? '7 ngày' : f === 'month' ? 'Tháng này' : 'Tùy chọn'}
            </Button>
          ))}
        </div>
      </div>

      {filter === 'range' && (
        <div className='flex flex-col sm:flex-row items-center justify-end gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500 ease-out'>
          <div className='flex p-1 bg-white rounded-lg border border-blue-100 shadow-sm shrink-0'>
            <Button
              variant='ghost'
              size='sm'
              className={cn(
                'h-8 px-4 text-[12px] font-bold rounded-md transition-all',
                rangeType === 'date' ? 'bg-primary text-white shadow-sm' : 'text-slate-500'
              )}
              onClick={() => onRangeTypeChange?.('date')}
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
              onClick={() => onRangeTypeChange?.('month')}
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
                  <DatePicker value={from} onChange={onFromChange} className='h-9 w-[150px]' />
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-[12px] font-bold text-slate-500 uppercase'>Đến</span>
                  <DatePicker value={to} onChange={onToChange} className='h-9 w-[150px]' />
                </div>
              </>
            ) : (
              <>
                <div className='flex items-center gap-2'>
                  <span className='text-[12px] font-bold text-slate-500 uppercase'>Tháng</span>
                  <Select value={month} onValueChange={onMonthChange}>
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
                  <Select value={year} onValueChange={onYearChange}>
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
  )
}

export default FilterBar
