import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface KPICardProps {
  title: string
  value: string | number
  subValue?: string
  icon: React.ElementType
  growth?: number
  isUp?: boolean
  color?: 'primary' | 'success' | 'warning' | 'info' | 'destructive'
}

const KPICard: React.FC<KPICardProps> = ({ title, value, subValue, icon: Icon, growth, isUp, color = 'primary' }) => {
  const colorMap = {
    primary: 'bg-primary',
    success: 'bg-emerald-600',
    warning: 'bg-amber-600',
    info: 'bg-blue-600',
    destructive: 'bg-rose-600'
  }

  const iconColorMap = {
    primary: 'text-primary',
    success: 'text-emerald-600',
    warning: 'text-amber-600',
    info: 'text-blue-600',
    destructive: 'text-rose-600'
  }

  return (
    <Card className='group relative overflow-hidden border-border bg-card shadow-sm transition-all hover:shadow-md rounded-[1rem]'>
      <div className={cn('absolute top-0 left-0 h-1.5 w-full', colorMap[color])} />
      <CardContent className='p-4'>
        <div className='flex items-start justify-between'>
          <p className='text-[14px] font-bold text-slate-600'>{title}</p>
          <div className={cn('transition-colors', iconColorMap[color])}>
            <Icon className='h-5 w-5 stroke-[2]' />
          </div>
        </div>

        <div className='mt-1'>
          <h3 className='text-2xl font-black tracking-tight text-slate-900'>{value}</h3>
          <div className='mt-1 flex flex-col gap-0.5'>
            {growth !== undefined && growth !== null && (
              <div
                className={cn(
                  'flex items-center gap-0.5 text-[12px] font-black',
                  isUp ? 'text-emerald-600' : 'text-rose-600'
                )}
              >
                {isUp ? '↑' : '↓'} {Math.abs(growth)}%
              </div>
            )}
            {growth === null && (
              <div
                className={cn(
                  'flex items-center gap-0.5 text-[12px] font-black',
                  isUp ? 'text-emerald-600' : 'text-rose-600'
                )}
              >
                {isUp ? '↑ Mới' : '↓ Giảm'}
              </div>
            )}
            {subValue && <p className='text-[11px] font-bold text-slate-400 leading-tight'>{subValue}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default KPICard
