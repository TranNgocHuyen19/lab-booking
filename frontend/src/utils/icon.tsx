import {
  Computer,
  Mic,
  Projector,
  Keyboard,
  Mouse,
  Headphones,
  Usb,
  Cpu,
  Box,
  MonitorPlay,
  Presentation
} from 'lucide-react'

export const deviceIconMap = {
  default: Box,
  computer: Computer,
  monitor: MonitorPlay,
  mic: Mic,
  projector: Projector,
  presentation: Presentation,
  keyboard: Keyboard,
  mouse: Mouse,
  headphones: Headphones,
  usb: Usb,
  cpu: Cpu
} as const

export type DeviceIconName = keyof typeof deviceIconMap

export const allDeviceIcons = Object.keys(deviceIconMap) as DeviceIconName[]

export const deviceIconLabels: Record<DeviceIconName, string> = {
  default: 'Mặc định',
  computer: 'Máy tính',
  monitor: 'Màn hình',
  mic: 'Micro',
  projector: 'Máy chiếu',
  presentation: 'Màn chiếu',
  keyboard: 'Bàn phím',
  mouse: 'Chuột',
  headphones: 'Tai nghe',
  usb: 'USB',
  cpu: 'CPU'
}
