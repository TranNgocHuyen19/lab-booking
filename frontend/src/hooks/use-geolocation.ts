import { useState } from 'react'

export const useGeolocation = () => {
  const [loading, setLoading] = useState(false)

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'))
        return
      }

      setLoading(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLoading(false)
          resolve(position)
        },
        (error) => {
          setLoading(false)
          reject(error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    })
  }

  return { loading, getCurrentPosition }
}
