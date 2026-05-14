import React from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { Card, CardContent } from '@/components/ui/card'
import { useSlotsQuery } from '@/queries/slot.queries'
import type { SlotResponse } from '@/schemas/slot.schema'
import { getSlotColor } from './trend-chart'

export interface RoomShiftActivityData {
  room: string
  [key: string]: string | number
}

export interface RoomShiftChartProps {
  data: RoomShiftActivityData[]
}

const RoomShiftChart: React.FC<RoomShiftChartProps> = ({ data }) => {
  const { data: slotsRes } = useSlotsQuery({ limit: 50 })
  const activeSlots =
    (slotsRes?.data?.data as SlotResponse[])?.filter((s) => s.slotName.toUpperCase().startsWith('CA')) || []

  return (
    <Card className='rounded-2xl border-border shadow-sm overflow-hidden bg-card text-card-foreground'>
      <div className='px-6 py-5 border-b border-gray-100 flex items-center justify-between'>
        <h3 className='text-base font-black text-primary uppercase tracking-wider'>Phòng hoạt động tích cực nhất</h3>
      </div>
      <CardContent className='p-6 h-[400px]'>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ left: -20, right: 30, top: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='rgb(var(--border))' opacity={0.4} />
            <XAxis
              dataKey='room'
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgb(var(--foreground))', fontWeight: 800, fontSize: 13 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgb(var(--muted-foreground))', fontWeight: 700, fontSize: 13 }}
            />
            <Tooltip
              cursor={{ fill: 'rgb(var(--muted)/0.1)' }}
              contentStyle={{
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '1px solid rgb(var(--border))',
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
                lineHeight: '24px'
              }}
            />
            {activeSlots.map((slot, index) => (
              <Bar
                key={slot.slotId}
                dataKey={slot.slotName}
                name={`${slot.slotName} (${slot.startTime.substring(0, 5)} - ${slot.endTime.substring(0, 5)})`}
                stackId='a'
                fill={getSlotColor(slot.slotName)}
                barSize={40}
                radius={index === activeSlots.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default RoomShiftChart
