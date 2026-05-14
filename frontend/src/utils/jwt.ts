import { jwtDecode } from 'jwt-decode'

interface DecodedToken {
  exp: number
  iat: number
  sub?: string
  userId?: number
  roles?: string[]
}

export const decodeToken = (token: string): DecodedToken | null => {
  try {
    return jwtDecode<DecodedToken>(token)
  } catch {
    return null
  }
}

export const isTokenExpiringSoon = (token: string): boolean => {
  const decoded = decodeToken(token)
  if (!decoded) return true

  const now = Math.floor(Date.now() / 1000)
  const tokenLifetime = decoded.exp - decoded.iat
  const timeRemaining = decoded.exp - now

  return timeRemaining < tokenLifetime / 3
}

export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token)
  if (!decoded) return true
  return decoded.exp <= Math.floor(Date.now() / 1000)
}
