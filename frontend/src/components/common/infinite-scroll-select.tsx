import * as React from 'react'
import { ChevronDown, Check, Loader2, X } from 'lucide-react'
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/use-debounce'

interface InfiniteScrollSelectProps<T> {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  items: T[]
  getItemValue: (item: T) => string
  getItemLabel: (item: T) => string
  hasMore?: boolean
  isLoading?: boolean
  onLoadMore?: () => void
  onSearchChange?: (search: string) => void
  disabled?: boolean
  emptyText?: string
  className?: string
  icon?: React.ReactNode
  clearable?: boolean
  searchDebounceMs?: number
}

export function InfiniteScrollSelect<T>({
  value = '',
  onValueChange,
  placeholder = 'Chọn...',
  items,
  getItemValue,
  getItemLabel,
  hasMore = false,
  isLoading = false,
  onLoadMore,
  onSearchChange,
  disabled = false,
  emptyText = 'Không tìm thấy',
  className,
  icon,
  clearable = true,
  searchDebounceMs = 500
}: InfiniteScrollSelectProps<T>) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')

  // Debounce search value
  const debouncedSearch = useDebounce(search, searchDebounceMs)

  // Call onSearchChange when debounced search changes
  React.useEffect(() => {
    if (onSearchChange && open) {
      onSearchChange(debouncedSearch)
    }
  }, [debouncedSearch, onSearchChange, open])

  const selectedItem = React.useMemo(() => {
    return items.find((item) => getItemValue(item) === value)
  }, [items, value, getItemValue])

  const filteredItems = React.useMemo(() => {
    if (!search) return items
    return items.filter((item) => getItemLabel(item).toLowerCase().includes(search.toLowerCase()))
  }, [items, search, getItemLabel])

  React.useEffect(() => {
    const container = scrollContainerRef.current
    if (!container || !open || !onLoadMore) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      if (scrollHeight - scrollTop <= clientHeight * 1.2 && hasMore && !isLoading) {
        onLoadMore()
      }
    }

    if (hasMore && !isLoading && container.scrollHeight <= container.clientHeight) {
      onLoadMore()
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [hasMore, isLoading, onLoadMore, open, items.length])

  const handleSelect = (itemValue: string) => {
    onValueChange(itemValue)
    setOpen(false)
    setSearch('')
    inputRef.current?.blur()
  }

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onValueChange('')
    setSearch('')
  }

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const input = inputRef.current
    if (input) {
      if (e.key === 'Escape') {
        input.blur()
        setOpen(false)
      }
    }
  }, [])

  return (
    <Command onKeyDown={handleKeyDown} className='overflow-visible bg-transparent' shouldFilter={false}>
      <div
        className={cn(
          'group rounded-lg border border-input px-3 py-2.5 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 bg-[#f9fafb] cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        onClick={() => !disabled && inputRef.current?.focus()}
      >
        <div className='flex items-center gap-2'>
          {icon && <span className='text-gray-400 flex-shrink-0'>{icon}</span>}
          <div className='flex-1 relative'>
            {!open && selectedItem && (
              <span className='text-gray-700 font-medium absolute inset-0 flex items-center pointer-events-none'>
                <span className='truncate'>{getItemLabel(selectedItem)}</span>
              </span>
            )}
            <input
              ref={inputRef}
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              disabled={disabled}
              onBlur={() => {
                setTimeout(() => setOpen(false), 150)
              }}
              onFocus={() => {
                setOpen(true)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                }
              }}
              placeholder={selectedItem ? '' : placeholder}
              className={cn(
                'w-full bg-transparent outline-none placeholder:text-gray-500 font-medium',
                selectedItem && !open && 'opacity-0'
              )}
            />
          </div>
          <div className='flex items-center gap-1'>
            {clearable && value && !disabled && (
              <button
                type='button'
                onClick={handleClear}
                className='p-0.5 hover:bg-gray-200 rounded-full transition-colors'
                title='Xoá'
              >
                <X className='h-3.5 w-3.5 text-gray-400 hover:text-gray-600' />
              </button>
            )}
            <ChevronDown className={cn('h-4 w-4 text-gray-400 transition-transform', open && 'rotate-180')} />
          </div>
        </div>
      </div>
      <div className='relative mt-1'>
        {open && (
          <div
            className='absolute top-0 z-50 w-full rounded-lg border bg-white shadow-lg outline-none animate-in fade-in-0 zoom-in-95'
            onMouseDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          >
            <CommandList ref={scrollContainerRef} className='max-h-64 overflow-y-auto'>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {filteredItems.map((item) => {
                  const itemValue = getItemValue(item)
                  const itemLabel = getItemLabel(item)
                  const isSelected = value === itemValue

                  return (
                    <CommandItem
                      key={itemValue}
                      value={itemLabel}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onSelect={() => handleSelect(itemValue)}
                      className={cn(
                        'cursor-pointer py-2.5 px-3 transition-colors',
                        isSelected && 'bg-primary/10 text-primary font-semibold'
                      )}
                    >
                      <span className='flex-1'>{itemLabel}</span>
                      {isSelected && <Check className='h-4 w-4 text-primary' />}
                    </CommandItem>
                  )
                })}
                {isLoading && (
                  <div className='flex items-center justify-center py-4'>
                    <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
                  </div>
                )}
                {!isLoading && hasMore && onLoadMore && <div className='h-2' />}
              </CommandGroup>
            </CommandList>
          </div>
        )}
      </div>
    </Command>
  )
}
