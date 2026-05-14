import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface SelectActiveProps {
  value: string
  onValueChange: (value: string) => void
}

export function SelectActive({ value, onValueChange }: SelectActiveProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className='w-[180px] h-10 border-gray-200'>
        <SelectValue placeholder='Tất cả trạng thái' />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='all'>Tất cả trạng thái</SelectItem>
        <SelectItem value='true'>Hoạt động</SelectItem>
        <SelectItem value='false'>Không hoạt động</SelectItem>
      </SelectContent>
    </Select>
  )
}
