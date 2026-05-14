import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        // Solid variants
        default: 'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary: 'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        destructive: 'border-transparent bg-destructive text-destructive-foreground [a&]:hover:bg-destructive/90',
        success: 'border-transparent bg-success text-success-foreground [a&]:hover:bg-success/90',
        warning: 'border-transparent bg-warning text-warning-foreground [a&]:hover:bg-warning/90',
        info: 'border-transparent bg-info text-info-foreground [a&]:hover:bg-info/90',

        // Soft/Light variants (với background nhạt)
        'primary-soft': 'border-primary/20 bg-primary/10 text-primary',
        'secondary-soft': 'border-secondary/20 bg-secondary/10 text-secondary-foreground',
        'destructive-soft': 'border-destructive/20 bg-destructive/10 text-destructive',
        'success-soft': 'border-success/20 bg-success/10 text-success',
        'warning-soft': 'border-warning/20 bg-warning/10 text-warning',
        'info-soft': 'border-info/20 bg-info/10 text-info',

        // Outline variant
        outline: 'text-foreground border-border [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',

        // Type variants
        research: 'border-blue-200 bg-blue-50 text-blue-700 font-bold shadow-sm',
        thesis: 'border-amber-200 bg-amber-50 text-amber-700 font-bold shadow-sm',
        personal: 'border-indigo-200 bg-indigo-50 text-indigo-700 font-bold shadow-sm',

        // Member role variants
        leader: 'border-transparent bg-secondary text-primary font-black',
        co_leader: 'border-transparent bg-orange-100 text-orange-700 font-black',
        member: 'border-primary/20 bg-primary/10 text-primary font-black',

        // Status variants
        pending: 'border-yellow-200 bg-yellow-50 text-yellow-800 font-bold',
        approved: 'border-emerald-200 bg-emerald-50 text-emerald-700 font-bold',
        rejected: 'border-red-200 bg-red-50 text-red-700 font-bold',
        canceled: 'border-gray-200 bg-gray-50 text-gray-500 font-bold',
        system_canceled: 'border-rose-200 bg-rose-50 text-rose-700 font-bold',

        // Account status variants
        active: 'border-emerald-200 bg-emerald-50 text-emerald-700 font-bold',
        inactive: 'border-gray-200 bg-gray-50 text-gray-500 font-bold'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return <Comp data-slot='badge' className={cn(badgeVariants({ variant }), className)} {...props} />
}

export type BadgeVariant = VariantProps<typeof badgeVariants>['variant']
export { Badge, badgeVariants }
