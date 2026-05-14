import * as React from 'react'
import { X, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command'
import { cn } from '@/lib/utils'

interface InfiniteScrollMultipleSelectProps<T> {
  value?: string[]
  onValueChange: (values: string[]) => void
  placeholder?: string
  items: T[]
  getItemValue: (item: T) => string
  getItemLabel: (item: T) => string
  hasMore: boolean
  isLoading: boolean
  onLoadMore: () => void
  disabled?: boolean
  maxSelected?: number
  emptyText?: string
  hidePlaceholderWhenSelected?: boolean
  className?: string
  badgeClassName?: string
}

export function InfiniteScrollMultipleSelect<T>({
  value = [],
  onValueChange,
  placeholder = 'Chọn...',
  items,
  getItemValue,
  getItemLabel,
  hasMore,
  isLoading,
  onLoadMore,
  disabled = false,
  maxSelected = Number.MAX_SAFE_INTEGER,
  emptyText = 'Không tìm thấy',
  hidePlaceholderWhenSelected = false,
  className,
  badgeClassName
}: InfiniteScrollMultipleSelectProps<T>) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')

  const selectedItems = React.useMemo(() => {
    return items.filter((item) => value.includes(getItemValue(item)))
  }, [items, value, getItemValue])

  const filteredItems = React.useMemo(() => {
    const filtered = items.filter((item) => getItemLabel(item).toLowerCase().includes(search.toLowerCase()))
    return filtered.filter((item) => !value.includes(getItemValue(item)))
  }, [items, search, value, getItemValue, getItemLabel])

  React.useEffect(() => {
    const container = scrollContainerRef.current
    if (!container || !open) return

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
    if (value.length >= maxSelected) {
      return
    }
    onValueChange([...value, itemValue])
  }

  const handleUnselect = React.useCallback(
    (itemValue: string) => {
      onValueChange(value.filter((v) => v !== itemValue))
    },
    [value, onValueChange]
  )

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current
      if (input) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          if (input.value === '' && value.length > 0) {
            handleUnselect(value[value.length - 1])
          }
        }
        if (e.key === 'Escape') {
          input.blur()
          setOpen(false)
        }
      }
    },
    [value, handleUnselect]
  )

  return (
    <Command onKeyDown={handleKeyDown} className='overflow-visible bg-transparent' shouldFilter={false}>
      <div
        className={cn(
          'group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
          className
        )}
      >
        <div className='flex items-center justify-between gap-2'>
          <div className='flex flex-wrap gap-1 flex-1'>
            {selectedItems.map((item) => {
              const itemValue = getItemValue(item)
              const itemLabel = getItemLabel(item)
              return (
                <Badge
                  key={itemValue}
                  className={cn(
                    'bg-primary/10 text-primary hover:bg-primary/20 border-none px-2 py-1 transition-colors',
                    badgeClassName
                  )}
                  data-disabled={disabled}
                >
                  {itemLabel}
                  <button
                    type='button'
                    className={cn(
                      'ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2',
                      disabled && 'hidden'
                    )}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleUnselect(itemValue)
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onClick={() => handleUnselect(itemValue)}
                    disabled={disabled}
                  >
                    <X className='h-3 w-3 text-muted-foreground hover:text-foreground' />
                  </button>
                </Badge>
              )
            })}
            <input
              ref={inputRef}
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              disabled={disabled}
              onBlur={() => {
                setOpen(false)
              }}
              onFocus={() => {
                setOpen(true)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                }
              }}
              placeholder={hidePlaceholderWhenSelected && value.length !== 0 ? '' : placeholder}
              className='ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground'
            />
          </div>
          {value.length > 0 && !disabled && (
            <button
              type='button'
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onValueChange([])
              }}
              className='p-1 hover:bg-muted rounded-full transition-colors'
              title='Xoá tất cả'
            >
              <X className='h-4 w-4 text-muted-foreground' />
            </button>
          )}
        </div>
      </div>
      <div className='relative mt-2'>
        {open && (
          <div
            className='absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in'
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
                  const isDisabled = value.length >= maxSelected

                  return (
                    <CommandItem
                      key={itemValue}
                      value={itemLabel}
                      disabled={isDisabled}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onSelect={() => {
                        if (!isDisabled) {
                          handleSelect(itemValue)
                          setSearch('')
                        }
                      }}
                      className={cn(
                        'cursor-pointer transition-colors data-[selected=true]:bg-gray-100 data-[selected=true]:text-gray-900',
                        isDisabled && 'cursor-default text-muted-foreground opacity-50'
                      )}
                    >
                      {itemLabel}
                    </CommandItem>
                  )
                })}
                {isLoading && (
                  <div className='flex items-center justify-center py-4'>
                    <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
                  </div>
                )}
                {!isLoading && !hasMore && items.length > 0 && (
                  <div className='py-4 text-center text-xs text-muted-foreground border-t border-dashed mt-2'>
                    Đã hiển thị tất cả nhóm nghiên cứu
                  </div>
                )}
                {!isLoading && hasMore && <div className='h-2' />}
              </CommandGroup>
            </CommandList>
          </div>
        )}
      </div>
    </Command>
  )
}
