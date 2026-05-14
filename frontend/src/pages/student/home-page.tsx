import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Cpu, GraduationCap, ChevronRight, BookOpen, Activity, Users } from 'lucide-react'
import { Link } from 'react-router'
import { PATHS } from '@/constants/paths'
import { useLabRoomsQuery } from '@/queries/lab-room.queries'

const HomePage = () => {
  const { data: labRoomsData } = useLabRoomsQuery({ page: 1, limit: 6, active: true })

  return (
    <div className='flex flex-col min-h-screen bg-white font-sans'>
      <section className='relative h-[85vh] w-full overflow-hidden'>
        <div className='absolute inset-0'>
          <img src={`/images/student-login.jpeg`} alt='Lab Hero' className='h-full w-full object-cover' />
          <div className='absolute inset-0 bg-blue-900/40 mix-blend-multiply' />
          <div className='absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-900/50 to-transparent' />
        </div>

        <div className='w-full relative h-full px-6 md:px-20 lg:px-40 flex flex-col justify-center text-white'>
          <div className='max-w-3xl space-y-6 animate-fade-in'>
            <div className='inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm font-semibold backdrop-blur-md border border-white/20 uppercase tracking-widest'>
              <Activity className='h-4 w-4 text-secondary' />
              Hệ thống đăng ký sử dụng phòng lab
            </div>

            <h1 className='text-7xl md:text-8xl font-black leading-[1.1] tracking-tight'>
              Cổng Đăng Ký
              <br />
              <span className='text-secondary'>Phòng lab</span>
            </h1>

            <div className='flex items-center gap-4 text-xl font-bold'>
              <div className='h-1 w-12 bg-secondary' />
              <span className='tracking-[0.2em] uppercase'>H9.3 • H3.3 • A1.01</span>
            </div>

            <p className='text-lg text-gray-200 max-w-xl font-medium leading-relaxed'>
              Hệ thống đăng ký phòng lab chính thức của khoa Công nghệ Thông tin, giúp sinh viên và giảng viên dễ dàng
              đăng ký phòng lab, tham gia các nhóm nghiên cứu và thực hành chuyên sâu.
            </p>

            <div className='flex items-center gap-4 pt-4'>
              <Link to={PATHS.STUDENT.SCHEDULE}>
                <Button
                  size='lg'
                  className='bg-secondary hover:bg-secondary/90 text-black font-bold h-14 px-8 rounded-xl shadow-xl shadow-secondary/20 transition-all hover:scale-105'
                >
                  <Calendar className='mr-2 h-5 w-5' />
                  Đặt Lịch Ngay
                </Button>
              </Link>
              <Link to={PATHS.STUDENT.SCHEDULE}>
                <Button
                  size='lg'
                  variant='outline'
                  className='bg-white/5 border-white/30 text-white hover:bg-white/10 font-bold h-14 px-8 rounded-xl backdrop-blur-md transition-all hover:scale-105'
                >
                  <BookOpen className='mr-2 h-5 w-5' />
                  Xem Danh Sách Phòng
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className='py-28 bg-[#f8faff] relative overflow-hidden'>
        <div className='w-full px-6 md:px-20 lg:px-40 relative z-10'>
          <div className='text-center space-y-4 mb-20'>
            <Badge
              variant='outline'
              className='px-4 py-1 rounded-full border-blue-200 text-blue-600 bg-blue-50/50 uppercase tracking-[0.2em] text-[11px] font-bold'
            >
              TIỆN ÍCH HỆ THỐNG
            </Badge>
            <h2 className='text-5xl font-black text-blue-950 tracking-tight'>Dịch Vụ Nổi Bật</h2>
            <div className='h-1.5 w-24 bg-secondary mx-auto rounded-full shadow-[0_2px_10px_rgba(249,178,0,0.3)]' />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-10'>
            {[
              {
                icon: Clock,
                title: 'Tiết Kiệm Thời Gian',
                desc: 'Đăng ký trực tuyến mọi lúc mọi nơi, không cần thủ tục giấy tờ phức tạp. Quy trình tối ưu hóa giúp bạn có phòng lab chỉ trong vài click.',
                lightBg: 'bg-blue-600/10',
                iconColor: 'text-primary'
              },
              {
                icon: Cpu,
                title: 'Thiết Bị Hiện Đại',
                desc: 'Tra cứu thông tin chi tiết về các thiết bị có sẵn trong từng phòng lab. Luôn cập nhật thông số kỹ thuật và tình trạng máy móc thực tế.',
                lightBg: 'bg-cyan-600/10',
                iconColor: 'text-cyan-600'
              },
              {
                icon: GraduationCap,
                title: 'Hỗ Trợ Học Tập',
                desc: 'Tạo điều kiện tốt nhất cho việc nghiên cứu và thực hành chuyên sâu. Đội ngũ kỹ thuật viên luôn sẵn sàng hỗ trợ bạn trong suốt quá trình sử dụng.',
                lightBg: 'bg-orange-600/10',
                iconColor: 'text-secondary'
              }
            ].map((feature, i) => (
              <Card
                key={i}
                className='group border border-blue-100/50 shadow-sm hover:shadow-2xl transition-all duration-500 rounded-xl overflow-hidden bg-white hover:-translate-y-2'
              >
                <CardContent className='p-10 space-y-6'>
                  <div
                    className={`h-20 w-20 rounded-2xl ${feature.lightBg} flex items-center justify-center group-hover:rotate-12 transition-transform duration-500`}
                  >
                    <feature.icon className={`h-10 w-10 ${feature.iconColor}`} />
                  </div>
                  <h3 className='text-2xl font-black text-blue-900'>{feature.title}</h3>
                  <p className='text-gray-500 font-medium leading-relaxed text-md'>{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className='py-28 bg-white'>
        <div className='w-full px-6 md:px-20 lg:px-40'>
          <div className='text-center space-y-4 mb-20'>
            <Badge
              variant='outline'
              className='px-4 py-1 rounded-full border-blue-200 text-blue-600 bg-blue-50/50 uppercase tracking-[0.2em] text-[11px] font-bold'
            >
              Cơ sở vật chất
            </Badge>
            <h2 className='text-5xl font-black text-blue-950 tracking-tight'>Danh Sách Phòng Lab</h2>
            <div className='h-1.5 w-24 bg-secondary mx-auto rounded-full shadow-[0_2px_10px_rgba(249,178,0,0.3)]' />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-12'>
            {labRoomsData?.data?.data?.map((lab) => (
              <Link key={lab.labRoomId} to={`${PATHS.STUDENT.SCHEDULE}?search=${lab.roomName}`} className='group'>
                <Card className='overflow-hidden border border-gray-100 shadow-xl hover:shadow-[0_20px_50px_-10px_rgba(21,56,152,0.15)] transition-all duration-700 rounded-xl bg-white h-full group-hover:-translate-y-2'>
                  <div className='relative h-72 overflow-hidden'>
                    <img
                      src='/images/student-login.jpeg'
                      alt={lab.roomName}
                      className='h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110'
                    />
                  </div>
                  <CardContent className='p-10 space-y-5'>
                    <h3 className='text-2xl font-black text-blue-900 group-hover:text-primary transition-colors tracking-tight'>
                      {lab.roomName}
                    </h3>
                    <p className='text-gray-500 leading-relaxed text-[15px] font-medium'>
                      Phòng thực hành {lab.roomName} với trang thiết bị hiện đại phục vụ nhu cầu học tập và nghiên cứu.
                    </p>
                    <div className='flex items-center justify-between pt-8 border-t border-gray-50 mt-6'>
                      <div className='flex items-center gap-3 text-sm font-black text-gray-800 bg-gray-50 px-4 py-2 rounded-full'>
                        <Users className='h-4 w-4 text-primary' />
                        Sức chứa: {lab.capacity} chỗ
                      </div>
                      <div className='text-primary font-black text-sm uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all'>
                        Chi tiết <ChevronRight className='h-5 w-5' />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* <section className='py-32 bg-[#f8faff] relative overflow-hidden'>
        <div className='w-full px-6 md:px-20 lg:px-40 relative z-10'>
          <div className='flex flex-col lg:flex-row gap-16'>
            <div className='lg:w-[65%] space-y-10'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                  <div className='h-10 w-1.5 bg-primary rounded-full shadow-[0_0_15px_rgba(21,56,152,0.3)]' />
                  <h2 className='text-3xl font-black text-blue-950 uppercase tracking-tighter'>Tin tức nổi bật</h2>
                </div>
                <div className='flex gap-3'>
                  <Button
                    variant='outline'
                    size='icon'
                    className='h-10 w-10 rounded-xl border-gray-200 hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm'
                  >
                    <ChevronLeft className='h-5 w-5' />
                  </Button>
                  <Button
                    variant='outline'
                    size='icon'
                    className='h-10 w-10 rounded-xl border-gray-200 hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm'
                  >
                    <ChevronRight className='h-5 w-5' />
                  </Button>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                <div className='md:col-span-2 group cursor-pointer bg-white rounded-xl border border-blue-100/50 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 flex flex-col md:flex-row h-72'>
                  <div className='md:w-[45%] overflow-hidden h-full'>
                    <img
                      src='/images/university-news.png'
                      className='h-full w-full object-cover group-hover:scale-105 transition-transform duration-1000'
                      alt='Featured'
                    />
                  </div>
                  <div className='p-10 md:w-[55%] flex flex-col justify-center space-y-5'>
                    <div className='flex items-center gap-3'>
                      <div className='flex items-center gap-2 text-xs font-black text-secondary tracking-widest uppercase'>
                        <Calendar className='h-4 w-4' />
                        30/12/2025
                      </div>
                      <Badge className='bg-red-500 text-white border-none text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-red-500/20'>
                        MỚI NHẤT
                      </Badge>
                    </div>
                    <h2 className='text-2xl font-black text-blue-950 leading-tight group-hover:text-primary transition-colors line-clamp-2'>
                      Ngành Kinh doanh quốc tế và bài toán nguồn nhân lực hội nhập tại IUH
                    </h2>
                    <p className='text-gray-500 text-sm font-medium line-clamp-2 leading-relaxed'>
                      Cùng với quá trình hội nhập kinh tế quốc tế sâu rộng, Kinh doanh quốc tế ngày càng đóng vai trò
                      quan trọng trong việc đào tạo...
                    </p>
                  </div>
                </div>

                {[
                  {
                    title: 'Tập huấn Bộ nhận diện thương hiệu IUH: Đồng bộ hình ảnh chuyên nghiệp',
                    date: '26/12/2025',
                    img: '/images/lab-programming.png'
                  },
                  {
                    title: '10 hoạt động và thành tựu tiêu biểu của IUH năm 2024 vừa qua',
                    date: '26/12/2025',
                    img: '/images/lab-ai.png'
                  }
                ].map((news, i) => (
                  <div
                    key={i}
                    className='group cursor-pointer bg-white p-6 rounded-xl border border-blue-50/50 flex gap-6 hover:shadow-xl transition-all duration-500'
                  >
                    <div className='w-32 h-32 shrink-0 rounded-2xl overflow-hidden shadow-md'>
                      <img
                        src={news.img}
                        className='h-full w-full object-cover group-hover:scale-110 transition-transform duration-700'
                      />
                    </div>
                    <div className='space-y-3 py-1 flex-1'>
                      <div className='flex items-center gap-2'>
                        <div className='flex items-center gap-1.5 text-[11px] font-black text-secondary tracking-widest uppercase'>
                          <Calendar className='h-3.5 w-3.5' />
                          {news.date}
                        </div>
                      </div>
                      <h3 className='font-black text-blue-900 text-[17px] line-clamp-2 group-hover:text-primary leading-tight tracking-tight'>
                        {news.title}
                      </h3>
                      <p className='text-gray-400 text-xs font-medium line-clamp-2 italic leading-relaxed'>
                        Nhằm tăng cường hiệu quả lan tỏa hình ảnh và bảo đảm tính chuyên nghiệp...
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className='lg:w-[35%] space-y-10'>
              <div className='flex items-center gap-4'>
                <div className='h-10 w-1.5 bg-secondary rounded-full shadow-[0_0_15px_rgba(249,178,0,0.5)]' />
                <h2 className='text-3xl font-black text-blue-950 uppercase tracking-tighter'>Thông báo mới</h2>
              </div>

              <div className='bg-white rounded-xl border border-gray-100 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col h-[650px]'>
                <div className='p-8 border-b border-gray-50 group cursor-pointer'>
                  <div className='relative h-48 rounded-2xl overflow-hidden mb-6 shadow-lg'>
                    <img
                      src='/images/lab-ai.png'
                      className='w-full h-full object-cover group-hover:scale-110 transition-all duration-1000'
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent' />
                  </div>
                  <div className='flex items-center gap-3 mb-3'>
                    <div className='flex items-center gap-2 text-[11px] font-black text-secondary tracking-widest uppercase'>
                      <Calendar className='h-4 w-4' />
                      25/12/2025
                    </div>
                    <Badge className='bg-orange-500 text-white border-none text-[9px] font-black px-2.5 py-0.5 rounded-full'>
                      HOT
                    </Badge>
                  </div>
                  <h3 className='font-black text-blue-950 text-[18px] group-hover:text-primary transition-all leading-tight mb-3'>
                    Thông báo về điều chỉnh lịch nghỉ Tết Dương lực năm 2026 cho toàn bộ sinh viên
                  </h3>
                </div>

                <div className='flex-1 overflow-y-auto custom-scrollbar p-8 pt-0'>
                  <div className='space-y-8'>
                    {[
                      { date: '09/12/2025', title: 'Thông báo xét công nhận tốt nghiệp đợt tháng 3/2026 chính thức' },
                      { date: '24/11/2025', title: 'Sinh viên tham gia Bảo hiểm y tế bắt buộc năm 2026 (Cập nhật)' },
                      { date: '22/11/2025', title: 'Gia hạn thời gian nộp học phí học kỳ II năm học 2024-2025' },
                      { date: '15/11/2025', title: 'Thông báo về việc tổ chức lễ tốt nghiệp trang trọng năm 2025' }
                    ].map((item, i) => (
                      <div
                        key={i}
                        className='group cursor-pointer border-b border-gray-100 last:border-0 pb-6 last:pb-0'
                      >
                        <div className='flex items-center gap-3 mb-2'>
                          <div className='flex items-center gap-1.5 text-[11px] font-black text-secondary tracking-widest uppercase'>
                            <Calendar className='h-3.5 w-3.5' />
                            {item.date}
                          </div>
                          <span className='h-1 w-1 rounded-full bg-gray-300' />
                          <span className='text-[10px] font-black text-blue-400 uppercase tracking-widest'>
                            Thông báo
                          </span>
                        </div>
                        <h4 className='text-[15px] font-black text-gray-700 group-hover:text-primary transition-all line-clamp-2 leading-relaxed'>
                          {item.title}
                        </h4>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> */}
    </div>
  )
}

export default HomePage
