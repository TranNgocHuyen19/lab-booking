import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Mail, Phone, MapPin, Clock, Send, Globe, MessageSquare, Facebook, Youtube } from 'lucide-react'

const ContactPage = () => {
  return (
    <div className='flex flex-col min-h-screen bg-[#f8faff] font-sans antialiased animate-fade-in'>
      <section className='bg-[#163991] text-white py-20 relative overflow-hidden'>
        <div className='absolute inset-0 opacity-10'>
          <div className='absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white blur-3xl' />
          <div className='absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-secondary blur-3xl' />
        </div>

        <div className='w-full px-6 md:px-20 lg:px-40 relative z-10 text-center space-y-4'>
          <Badge className='bg-white/10 text-white border-white/20 px-4 py-1 text-xs font-bold tracking-widest uppercase hover:bg-white/20'>
            Trung tâm hỗ trợ
          </Badge>
          <h1 className='text-5xl font-black tracking-tight'>Liên hệ với chúng tôi</h1>
          <p className='text-blue-100 max-w-2xl mx-auto text-lg font-medium'>
            Bạn có thắc mắc về quy trình đăng ký phòng Lab hoặc cần hỗ trợ kỹ thuật? Hãy để lại lời nhắn, đội ngũ kỹ
            thuật viên IUH luôn sẵn sàng hỗ trợ bạn.
          </p>
        </div>
      </section>

      <section className='w-full px-6 md:px-20 lg:px-40 -mt-16 pb-24 relative z-20'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          <div className='lg:col-span-1 space-y-6'>
            <Card className='border-none shadow-xl rounded-2xl overflow-hidden bg-white h-full'>
              <CardContent className='p-8 flex flex-col h-full'>
                <div className='flex-1 space-y-10'>
                  {[
                    {
                      icon: MapPin,
                      title: 'Địa chỉ',
                      content: (
                        <>
                          Số 12 Nguyễn Văn Bảo, Phường 4,
                          <br /> Quận Gò Vấp, TP. Hồ Chí Minh
                        </>
                      )
                    },
                    {
                      icon: Phone,
                      title: 'Số điện thoại',
                      content: '028 38440 390',
                      sub: '(Phòng Quản trị thiết bị)'
                    },
                    {
                      icon: Mail,
                      title: 'Email hỗ trợ',
                      content: 'it.support@iuh.edu.vn',
                      sub: '(Phản hồi trong 24h)'
                    },
                    {
                      icon: Clock,
                      title: 'Giờ làm việc',
                      content: 'Thứ 2 - Thứ 7: 07:00 - 17:00',
                      sub: '(Nghỉ Chủ Nhật và ngày lễ)'
                    }
                  ].map((item, idx) => (
                    <div key={idx} className='flex items-start gap-6 group'>
                      <div className='h-12 w-12 rounded-2xl bg-blue-50/50 flex items-center justify-center shrink-0 border border-blue-100 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm'>
                        <item.icon className='h-6 w-6 text-primary group-hover:text-white transition-colors' />
                      </div>
                      <div className='space-y-1'>
                        <h4 className='font-black text-blue-900 text-xs uppercase tracking-widest'>{item.title}</h4>
                        <div className='text-gray-600 text-[14px] font-bold leading-relaxed'>{item.content}</div>
                        {item.sub && (
                          <div className='text-[11px] font-bold text-gray-400 uppercase tracking-tight italic'>
                            {item.sub}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className='pt-10 mt-10 border-t border-gray-100'>
                  <div className='flex items-center justify-between'>
                    <h4 className='font-black text-gray-400 text-[11px] uppercase tracking-[0.2em]'>Mạng xã hội</h4>
                    <div className='flex gap-2'>
                      {[
                        { icon: Facebook, color: 'hover:bg-blue-600' },
                        { icon: Youtube, color: 'hover:bg-red-600' },
                        { icon: Globe, color: 'hover:bg-primary' }
                      ].map((social, i) => (
                        <Button
                          key={i}
                          variant='ghost'
                          size='icon'
                          className={`h-9 w-9 rounded-xl text-gray-400 border border-gray-100/50 hover:text-white transition-all shadow-sm ${social.color}`}
                        >
                          <social.icon className='h-4.5 w-4.5' />
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className='lg:col-span-2'>
            <Card className='border-none shadow-2xl rounded-2xl overflow-hidden bg-white'>
              <CardContent className='p-10'>
                <div className='space-y-6'>
                  <div className='flex items-center gap-3'>
                    <div className='h-8 w-1 bg-secondary rounded-full shadow-lg shadow-secondary/50' />
                    <h2 className='text-2xl font-black text-[#163991] uppercase tracking-tight'>
                      Gửi lời nhắn cho chúng tôi
                    </h2>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='space-y-2'>
                      <label className='text-xs font-black text-gray-400 uppercase tracking-widest pl-1'>
                        Họ và tên
                      </label>
                      <Input
                        placeholder='Nguyễn Văn A'
                        className='h-14 bg-gray-50 border-transparent rounded-xl focus-visible:bg-white focus-visible:ring-primary/20 transition-all font-medium'
                      />
                    </div>
                    <div className='space-y-2'>
                      <label className='text-xs font-black text-gray-400 uppercase tracking-widest pl-1'>
                        Mã sinh viên
                      </label>
                      <Input
                        placeholder='210XXXXX'
                        className='h-14 bg-gray-50 border-transparent rounded-xl focus-visible:bg-white focus-visible:ring-primary/20 transition-all font-medium'
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='space-y-2'>
                      <label className='text-xs font-black text-gray-400 uppercase tracking-widest pl-1'>
                        Địa chỉ Email
                      </label>
                      <Input
                        type='email'
                        placeholder='student@iuh.edu.vn'
                        className='h-14 bg-gray-50 border-transparent rounded-xl focus-visible:bg-white focus-visible:ring-primary/20 transition-all font-medium'
                      />
                    </div>
                    <div className='space-y-2'>
                      <label className='text-xs font-black text-gray-400 uppercase tracking-widest pl-1'>
                        Chọn chủ đề
                      </label>
                      <div className='relative'>
                        <select className='w-full h-14 bg-gray-50 border-transparent rounded-xl px-4 appearance-none font-medium text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none'>
                          <option>Hỗ trợ đăng ký phòng Lab</option>
                          <option>Báo cáo sự cố thiết bị</option>
                          <option>Yêu cầu hỗ trợ kỹ thuật</option>
                          <option>Góp ý về hệ thống</option>
                        </select>
                        <MessageSquare className='absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none' />
                      </div>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <label className='text-xs font-black text-gray-400 uppercase tracking-widest pl-1'>
                      Nội dung lời nhắn
                    </label>
                    <Textarea
                      placeholder='Viết nội dung thắc mắc của bạn tại đây...'
                      className='min-h-[180px] bg-gray-50 border-transparent rounded-xl focus-visible:bg-white focus-visible:ring-primary/20 transition-all font-medium py-4'
                    />
                  </div>

                  <Button className='w-full bg-[#163991] hover:bg-[#112d73] text-white h-16 rounded-xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all group gap-3'>
                    <Send className='h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform' />
                    Gửi lời nhắn ngay
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ContactPage
