import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Search, Loader2, MapPin, Locate } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useDebounce } from '@/hooks/use-debounce'
import { toast } from 'sonner'

const iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png'
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png'
const shadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'

const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
})

L.Marker.prototype.options.icon = DefaultIcon

interface Location {
  lat: number
  lng: number
}

interface LocationPickerProps {
  value?: Location
  onChange: (lat: number, lng: number) => void
  disabled?: boolean
}

interface SearchResult {
  place_id: number
  lat: string
  lon: string
  display_name: string
}

function LocationMarker({ position, onChange }: { position: Location; onChange: (lat: number, lng: number) => void }) {
  const map = useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng)
    }
  })

  useEffect(() => {
    map.flyTo(position, 17, { animate: true })
  }, [position, map])

  return <Marker position={position} riseOnHover />
}

export function LocationPicker({ value, onChange, disabled }: LocationPickerProps) {
  const hasValue = value && typeof value.lat === 'number' && typeof value.lng === 'number'
  const position = hasValue ? value : { lat: 10.822024, lng: 106.687569 }

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  useEffect(() => {
    const searchPlaces = async () => {
      if (!debouncedSearchQuery || debouncedSearchQuery.length < 3) {
        setSearchResults([])
        return
      }

      setIsSearching(true)
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            debouncedSearchQuery
          )}&limit=5&countrycodes=vn`,
          {
            headers: {
              'User-Agent': 'lab-room-booking-app'
            }
          }
        )
        if (!response.ok) throw new Error('Search failed')
        const data = await response.json()
        setSearchResults(data)
        setShowResults(true)
      } catch (error) {
        console.error('Error searching location:', error)
        toast.error('Không thể tìm kiếm địa điểm, vui lòng thử lại sau.')
      } finally {
        setIsSearching(false)
      }
    }

    searchPlaces()
  }, [debouncedSearchQuery])

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectLocation = (result: SearchResult) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    onChange(lat, lng)
    setSearchQuery(result.display_name || '')
    setShowResults(false)
  }

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Trình duyệt của bạn không hỗ trợ định vị.')
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        onChange(latitude, longitude)
        setSearchQuery('')
        setIsLocating(false)
        toast.success('Đã lấy vị trí hiện tại')
      },
      (error) => {
        console.error('Error getting location:', error)
        toast.error('Không thể lấy vị trí hiện tại. Vui lòng kiểm tra quyền truy cập.')
        setIsLocating(false)
      }
    )
  }

  return (
    <div className='flex flex-col gap-4' ref={wrapperRef}>
      {!disabled && (
        <div className='flex gap-2'>
          <div className='relative flex-1'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
              <Input
                placeholder='Tìm kiếm địa chỉ (ít nhất 3 ký tự)...'
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  if (!showResults) setShowResults(true)
                }}
                onFocus={() => {
                  if (searchResults.length > 0) setShowResults(true)
                }}
                className='pl-9 h-10'
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                  }
                }}
              />
              {isSearching && (
                <div className='absolute right-3 top-1/2 -translate-y-1/2'>
                  <Loader2 className='h-4 w-4 animate-spin text-primary' />
                </div>
              )}
            </div>

            {showResults && searchResults.length > 0 && (
              <div className='absolute z-[1000] mt-1 w-full rounded-md border border-gray-200 bg-white py-1 shadow-lg'>
                {searchResults.map((result) => (
                  <button
                    key={result.place_id}
                    className='flex w-full items-start gap-2 px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors'
                    onClick={() => handleSelectLocation(result)}
                    type='button'
                  >
                    <MapPin className='h-4 w-4 mt-0.5 text-gray-400 shrink-0' />
                    <span className='line-clamp-2 text-gray-700'>{result.display_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button
            type='button'
            variant='outline'
            size='icon'
            className='h-10 w-10 shrink-0'
            onClick={handleGetCurrentLocation}
            title='Lấy vị trí hiện tại của bạn'
            disabled={isLocating}
          >
            {isLocating ? <Loader2 className='h-4 w-4 animate-spin' /> : <Locate className='h-4 w-4' />}
          </Button>
        </div>
      )}

      <div className='h-[400px] w-full rounded-xl overflow-hidden border border-gray-200 relative z-0'>
        <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          />
          {!disabled && <LocationMarker position={position} onChange={onChange} />}
          {disabled && <Marker position={position} riseOnHover />}
        </MapContainer>
      </div>

      <div className='flex items-center gap-4 text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded border border-gray-100'>
        <div>
          Lat: <span className='font-semibold text-gray-700'>{position.lat.toFixed(6)}</span>
        </div>
        <div className='h-3 w-px bg-gray-300'></div>
        <div>
          Lng: <span className='font-semibold text-gray-700'>{position.lng.toFixed(6)}</span>
        </div>
      </div>
    </div>
  )
}
