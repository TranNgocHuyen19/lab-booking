import React from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts'
import { Card, CardContent } from '@/components/ui/card'
import type { RoomActivityResponse } from '@/schemas/dashboard.schema'

export interface TrendData {
  date: string
  booking: number
  [key: string]: string | number
}

export const getSlotColor = (slotName: string): string => {
  const num = slotName.match(/\d+/)?.[0]
  const colors: Record<string, string> = {
    '1': 'rgb(var(--primary))',
    '2': '#10b981',
    '3': '#f59e0b',
    '4': '#3b82f6',
    '5': '#ef4444',
    '6': '#8b5cf6',
    '7': '#ec4899'
  }
  return num && colors[num] ? colors[num] : 'rgb(var(--muted-foreground))'
}

export type RoomShiftData = {
  room: string
  [key: string]: string | number
}

export interface TrendChartProps {
  filter: 'today' | '7d' | 'month' | 'range'
  trendData: TrendData[]
  roomShiftData: RoomShiftData[]
  roomActivity?: RoomActivityResponse[]
  isLoading?: boolean
}

const TrendChart: React.FC<TrendChartProps> = ({ filter, trendData, roomShiftData, roomActivity, isLoading }) => {
  const activeSlots = React.useMemo(() => {
    if (!roomActivity) return []
    const slotMap = new Map<string, { name: string; start: string; end: string }>()

    roomActivity.forEach((ra) => {
      ra.slots.forEach((s) => {
        if (!slotMap.has(s.slotName)) {
          slotMap.set(s.slotName, {
            name: s.slotName,
            start: s.startTime,
            end: s.endTime
          })
        }
      })
    })

    return Array.from(slotMap.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [roomActivity])

  if (isLoading) {
    return (
      <Card className='rounded-2xl border-border shadow-sm overflow-hidden bg-card text-card-foreground'>
        <div className='px-6 py-5 border-b border-gray-100 flex items-center justify-between'>
          <h3 className='text-base font-black text-primary uppercase tracking-wider'>
            {filter === 'today' ? 'Phân bổ theo phòng (Hôm nay)' : 'Xu hướng đặt phòng'}
          </h3>
        </div>
        <CardContent className='p-6 h-[350px]'>
          <div className='h-full w-full bg-muted rounded animate-pulse' />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='rounded-2xl border-border shadow-sm overflow-hidden bg-card text-card-foreground'>
      <div className='px-6 py-5 border-b border-gray-100 flex items-center justify-between'>
        <h3 className='text-base font-black text-primary uppercase tracking-wider'>
          {filter === 'today' ? 'Phân bổ theo phòng (Hôm nay)' : 'Xu hướng đặt phòng'}
        </h3>
      </div>
      <CardContent className='p-6 h-[350px]'>
        <ResponsiveContainer width='100%' height='100%'>
          {filter === 'today' ? (
            <BarChart data={roomShiftData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke='rgb(var(--border))' strokeDasharray='3 3' opacity={0.4} />
              <XAxis
                dataKey='room'
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgb(var(--foreground))', fontSize: 13, fontWeight: 700 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgb(var(--muted-foreground))', fontSize: 13, fontWeight: 700 }}
              />
              <Tooltip
                cursor={{ fill: 'rgb(var(--muted) / 0.1)' }}
                contentStyle={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  border: '1px solid rgb(var(--border))',
                  padding: '12px',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  fontSize: '13px',
                  fontWeight: 700
                }}
              />
              <Legend
                layout='vertical'
                verticalAlign='middle'
                align='right'
                iconType='circle'
                iconSize={8}
                wrapperStyle={{
                  paddingLeft: '20px',
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  lineHeight: '22px'
                }}
              />
              {activeSlots.length > 0
                ? activeSlots.map((slot) => (
                    <Bar
                      key={slot.name}
                      dataKey={slot.name}
                      name={`${slot.name} (${slot.start.substring(0, 5)} - ${slot.end.substring(0, 5)})`}
                      stackId='a'
                      fill={getSlotColor(slot.name)}
                      barSize={18}
                    />
                  ))
                : ['CA 1', 'CA 2', 'CA 3', 'CA 4', 'CA 5'].map((name, i) => (
                    <Bar
                      key={name}
                      dataKey={name}
                      stackId='a'
                      fill={getSlotColor(name)}
                      barSize={18}
                      radius={i === 4 ? [4, 4, 0, 0] : undefined}
                    />
                  ))}
            </BarChart>
          ) : (
            <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke='rgb(var(--border))' strokeDasharray='3 3' opacity={0.4} />
              <XAxis
                dataKey='date'
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgb(var(--muted-foreground))', fontSize: 13, fontWeight: 700 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgb(var(--muted-foreground))', fontSize: 13, fontWeight: 700 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  border: '1px solid rgb(var(--border))',
                  padding: '12px',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  fontSize: '13px',
                  fontWeight: 700
                }}
              />
              <Line
                type='monotone'
                dataKey='booking'
                name='Lượt đặt'
                stroke='rgb(var(--primary))'
                strokeWidth={4}
                dot={{ fill: 'rgb(var(--primary))', strokeWidth: 2, r: 5, stroke: 'white' }}
                activeDot={{ r: 7, strokeWidth: 0, fill: 'rgb(var(--primary))' }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default TrendChart
