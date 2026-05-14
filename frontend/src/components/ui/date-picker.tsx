import * as React from 'react'
import { CalendarIcon } from 'lucide-react'
import { vi } from 'date-fns/locale'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { formatDateForApi, formatDateDisplay } from '@/utils/format'

interface DatePickerProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

function DatePicker({ value, onChange, placeholder = 'Chọn ngày', className, disabled }: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (date: Date | undefined) => {
    onChange(formatDateForApi(date))
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          disabled={disabled}
          className={cn(
            'w-[180px] h-10 justify-between text-left font-normal border-gray-200 text-foreground',
            className
          )}
        >
          <span>{value ? formatDateDisplay(value) : placeholder}</span>
          <CalendarIcon className='h-4 w-4 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          mode='single'
          selected={value ? new Date(value) : undefined}
          onSelect={handleSelect}
          initialFocus
          locale={vi}
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }
