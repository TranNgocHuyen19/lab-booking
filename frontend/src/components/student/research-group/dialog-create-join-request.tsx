import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader2, Send } from 'lucide-react'

const formSchema = z.object({
  message: z.string().max(500, 'Lời nhắn không được vượt quá 500 ký tự')
})

interface DialogCreateJoinRequestProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupName: string
  onSubmit: (message: string) => void
  isSubmitting?: boolean
}

export const DialogCreateJoinRequest = ({
  open,
  onOpenChange,
  groupName,
  onSubmit,
  isSubmitting = false
}: DialogCreateJoinRequestProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: ''
    }
  })

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values.message)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[550px] border-none shadow-2xl rounded-xl overflow-hidden p-0'>
        <div className='p-8 pb-4 bg-gray-50/50 border-b border-gray-100/50'>
          <DialogTitle className='text-2xl font-black uppercase text-primary tracking-tight'>
            Gửi yêu cầu tham gia
          </DialogTitle>
          <DialogDescription className='text-sm font-medium text-gray-500 mt-1'>
            Gửi lời nhắn đến trưởng nhóm của <span className='text-primary font-black'>"{groupName}"</span>
          </DialogDescription>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='p-8 pt-6 space-y-6'>
            <FormField
              control={form.control}
              name='message'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-[11px] font-black text-gray-400 uppercase tracking-widest'>
                    Lời nhắn của bạn
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Chào bạn, mình muốn tham gia nhóm để cùng nghiên cứu về đề tài này...'
                      className='min-h-[160px] resize-none border-gray-200 bg-white rounded-2xl focus-visible:ring-2 focus-visible:ring-primary/10 font-medium shadow-sm transition-all'
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className='p-6 -mx-8 -mb-8 bg-gray-50/50 border-t border-gray-100 flex items-center justify-end gap-3'>
              <Button
                type='button'
                variant='ghost'
                className='font-black text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl px-6 h-11 uppercase text-[11px] tracking-wider transition-all'
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Hủy bỏ
              </Button>
              <Button
                type='submit'
                disabled={isSubmitting}
                className='bg-primary hover:bg-primary/95 text-white font-black rounded-xl px-8 h-11 uppercase text-[11px] tracking-wider gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95'
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Send className='h-4 w-4' />
                    Gửi yêu cầu
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
