export const normalizedTime = (minutes: number | null | undefined): string => {
  if (minutes === null || minutes === undefined || minutes === 0) return '0 phút'
  if (minutes < 60) return `${minutes} phút`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) return `${hours} giờ`
  return `${hours} giờ ${mins} phút`
}
