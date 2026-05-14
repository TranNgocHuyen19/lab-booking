import React from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { Search } from 'lucide-react'
import { useDeviceUsageQuery } from '@/queries/dashboard.queries'

export interface DeviceUsageData {
  name: string
  count: number
  [key: string]: string | number
}

import type { DashboardKpiParams } from '@/schemas/dashboard.schema'

export interface DeviceUsageChartProps {
  data?: DeviceUsageData[]
  dateRange?: DashboardKpiParams
}

const DeviceUsageChart: React.FC<DeviceUsageChartProps> = ({ data: initialData, dateRange }) => {
  const { data: fetchedData, isLoading } = useDeviceUsageQuery(
    { fromDate: dateRange?.fromDate || '', toDate: dateRange?.toDate || '', limit: 5 },
    { enabled: !!dateRange }
  )
  const data = initialData || fetchedData || []

  if (isLoading && !initialData) {
    return (
      <div className='bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm'>
        <div className='px-6 py-5 border-b border-gray-100 flex items-center justify-between'>
          <div className='h-5 w-48 bg-muted rounded animate-pulse' />
        </div>
        <div className='p-6 h-[300px]'>
          <div className='h-full w-full bg-muted rounded animate-pulse' />
        </div>
      </div>
    )
  }

  return (
    <div className='bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm'>
      <div className='px-6 py-5 border-b border-gray-100 flex items-center justify-between'>
        <h3 className='text-base font-black text-primary uppercase tracking-wider'>Thiết bị mượn nhiều nhất</h3>
      </div>
      <div className='p-6 h-[300px] flex flex-col items-center justify-center text-center'>
        {data.length > 0 ? (
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={data} layout='vertical' margin={{ left: 0, right: 30 }}>
              <XAxis type='number' hide />
              <YAxis
                dataKey='name'
                type='category'
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 13, fontWeight: 700, fill: 'rgb(var(--foreground))' }}
                width={100}
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
                formatter={(value: number | string | undefined) => [value ?? 0, 'Số lượng']}
              />
              <Bar dataKey='count' radius={[0, 8, 8, 0]} barSize={20}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill='rgb(var(--primary))' fillOpacity={1 - index * 0.15} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className='flex flex-col items-center justify-center gap-3 animate-in fade-in zoom-in duration-300'>
            <div className='p-4 bg-gray-50 rounded-full'>
              <Search className='h-8 w-8 text-gray-300' />
            </div>
            <p className='text-muted-foreground font-medium'>Không có dữ liệu thiết bị</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DeviceUsageChart
