import React from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts'
import { Card, CardContent } from '@/components/ui/card'

export interface BookingTypeData {
  name: string
  value: number
  [key: string]: string | number
}

import { Skeleton } from '@/components/ui/skeleton'

export interface BookingTypePieChartProps {
  data: BookingTypeData[]
  colors?: string[]
  isLoading?: boolean
}

const DEFAULT_COLORS = [
  '#6366f1', // Indigo (GROUP)
  '#f59e0b', // Amber (THESIS)
  '#10b981', // Emerald (PERSONAL)
  '#3b82f6', // Blue
  '#ef4444' // Red
]

const BookingTypePieChart: React.FC<BookingTypePieChartProps> = ({ data, colors = DEFAULT_COLORS, isLoading }) => {
  return (
    <Card className='rounded-2xl border-border shadow-sm overflow-hidden bg-card text-card-foreground'>
      <div className='px-6 py-5 border-b border-gray-100 flex items-center justify-between'>
        <h3 className='text-base font-black text-primary uppercase tracking-wider'>Phân loại hình thức Booking</h3>
      </div>
      <CardContent className='p-6 h-[350px] flex items-center justify-center'>
        {isLoading ? (
          <div className='flex flex-col items-center justify-center w-full h-full space-y-4'>
            <div className='relative flex items-center justify-center'>
              <Skeleton className='w-[200px] h-[200px] rounded-full' />
              <Skeleton className='absolute w-[140px] h-[140px] rounded-full bg-card' />
            </div>
            <div className='flex gap-4'>
              <Skeleton className='h-4 w-16' />
              <Skeleton className='h-4 w-16' />
              <Skeleton className='h-4 w-16' />
            </div>
          </div>
        ) : (
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey='value'
                innerRadius={70}
                outerRadius={100}
                paddingAngle={8}
                stroke='none'
                cornerRadius={4}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Legend
                iconType='circle'
                verticalAlign='bottom'
                wrapperStyle={{
                  fontSize: '12px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  paddingTop: '20px'
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  border: '1px solid rgb(var(--border))',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  fontSize: '13px',
                  fontWeight: 700
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

export default BookingTypePieChart
