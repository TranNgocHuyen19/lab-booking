import { useSearchParams } from 'react-router'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Users, Shield, Loader2, GraduationCap, FilterX } from 'lucide-react'
import {
  useResearchGroupsQuery,
  useOtherResearchGroupsQuery,
  useMyResearchGroupsQuery,
  useLeadersQuery,
  useMyLeadersQuery,
  useOtherLeadersQuery
} from '@/queries/research-group.queries'
import { useCreateJoinRequestMutation } from '@/queries/group-join-request.queries'
import { cn } from '@/lib/utils'
import PaginationCustom from '@/components/common/pagination-custom'
import { ResearchGroupCard } from '@/components/student/research-group/card-research-group'
import { InfiniteScrollSelect } from '@/components/common/infinite-scroll-select'
import { toast } from 'sonner'
import { handleErrorApi } from '@/utils/error-handler'
import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import type { UserResponse } from '@/schemas/user.schema'
import { LoginRequiredDialog } from '@/components/common/dialog-login-required'
import { DialogCreateJoinRequest } from '@/components/student/research-group/dialog-create-join-request'

const ResearchGroupsPage = () => {
  const { isAuthenticated } = useAuth()
  const limit = 6
  const [searchParams, setSearchParams] = useSearchParams()

  const rawTab = searchParams.get('tab') as 'all' | 'mine'
  const tab = !isAuthenticated ? 'all' : rawTab || 'all'

  const filters = {
    page: Number(searchParams.get('page')) || 1,
    tab: tab,
    keyword: searchParams.get('keyword') || '',
    type: searchParams.get('type') || 'all',
    status: searchParams.get('status') || 'all',
    leaderId: searchParams.get('leaderId') || 'all'
  }

  const [leaderSearch, setLeaderSearch] = useState('')

  const publicQueryParams = {
    page: filters.page,
    limit: limit,
    keyword: filters.keyword || undefined,
    type: filters.type === 'all' ? undefined : filters.type,
    leaderId: filters.leaderId === 'all' ? undefined : Number(filters.leaderId)
  }

  const myQueryParams = {
    ...publicQueryParams,
    isPrivate: filters.status === 'all' ? undefined : filters.status === 'private'
  }

  const publicQuery = useResearchGroupsQuery(publicQueryParams, !isAuthenticated)
  const otherQuery = useOtherResearchGroupsQuery(publicQueryParams, isAuthenticated && filters.tab === 'all')
  const myQuery = useMyResearchGroupsQuery(myQueryParams, isAuthenticated && filters.tab === 'mine')

  const publicLeadersQuery = useLeadersQuery({ keyword: leaderSearch || undefined }, !isAuthenticated)
  const otherLeadersQuery = useOtherLeadersQuery(
    { keyword: leaderSearch || undefined },
    isAuthenticated && filters.tab === 'all'
  )
  const myLeadersQuery = useMyLeadersQuery(
    { keyword: leaderSearch || undefined },
    isAuthenticated && filters.tab === 'mine'
  )

  let activeQuery
  let leadersQuery

  if (!isAuthenticated) {
    activeQuery = publicQuery
    leadersQuery = publicLeadersQuery
  } else if (filters.tab === 'all') {
    activeQuery = otherQuery
    leadersQuery = otherLeadersQuery
  } else {
    activeQuery = myQuery
    leadersQuery = myLeadersQuery
  }

  const { data: responseData, isLoading } = activeQuery
  const { data: leadersResponse, isLoading: isLeadersLoading } = leadersQuery
  const leaders = leadersResponse?.data?.data || []

  const groups = responseData?.data?.data || []
  const totalPages = responseData?.data?.totalPages || 0
  const totalItems = responseData?.data?.totalItems || 0

  const createJoinRequestMutation = useCreateJoinRequestMutation()
  const [joinModalOpen, setJoinModalOpen] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<{ id: number; name: string } | null>(null)

  const handleJoinRequest = (groupId: number, groupName: string) => {
    if (!isAuthenticated) {
      setShowLoginDialog(true)
      return
    }
    setSelectedGroup({ id: groupId, name: groupName })
    setJoinModalOpen(true)
  }

  const handleSubmitJoinRequest = async (message: string) => {
    if (!selectedGroup) return

    try {
      await createJoinRequestMutation.mutateAsync({
        researchGroupId: selectedGroup.id,
        message
      })
      toast.success('Gửi yêu cầu tham gia thành công!', {
        description: 'Vui lòng đợi trưởng nhóm phê duyệt yêu cầu của bạn.'
      })
      setJoinModalOpen(false)
      setSelectedGroup(null)
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  const updateSearchParams = (updates: Record<string, string | number | undefined | null>) => {
    const newParams = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '' || value === 'all') {
        newParams.delete(key)
      } else {
        newParams.set(key, String(value))
      }
    })
    if (!Object.keys(updates).every((k) => k === 'page')) {
      newParams.delete('page')
    }
    setSearchParams(newParams)
  }

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams({ tab: filters.tab }))
  }

  const handleTabChange = (tab: 'all' | 'mine') => {
    setSearchParams(new URLSearchParams({ tab }))
  }

  const isFiltered =
    filters.keyword !== '' || filters.type !== 'all' || filters.status !== 'all' || filters.leaderId !== 'all'

  return (
    <div className='bg-[#f8fafc] min-h-screen pb-20 pt-10 font-sans'>
      <div className='w-full px-6 md:px-20 lg:px-40'>
        {isAuthenticated && (
          <div className='flex gap-10 mb-8 border-b border-gray-100'>
            <button
              onClick={() => handleTabChange('all')}
              className={cn(
                'pb-4 px-2 text-[15px] font-black transition-all relative tracking-tight',
                filters.tab === 'all' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              Nhóm nghiên cứu khác
              {filters.tab === 'all' && (
                <div className='absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-full' />
              )}
            </button>
            <button
              onClick={() => handleTabChange('mine')}
              className={cn(
                'pb-4 px-2 text-[15px] font-black transition-all relative tracking-tight',
                filters.tab === 'mine' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              Nhóm của tôi
              {filters.tab === 'mine' && (
                <div className='absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-full' />
              )}
            </button>
          </div>
        )}

        <div className='bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4 mb-10 items-center'>
          <div className='relative flex-1 w-full group'>
            <Search className='absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors' />
            <Input
              placeholder='Tìm kiếm tên nhóm, chủ đề...'
              className='pl-10 h-11 bg-[#f8fafc] border-gray-100 rounded-xl font-medium focus-visible:ring-1 focus-visible:ring-primary/20 transition-all placeholder:text-gray-400'
              value={filters.keyword}
              onChange={(e) => updateSearchParams({ keyword: e.target.value })}
            />
          </div>

          <div className='flex gap-3 w-full lg:w-auto lg:flex-shrink-0 items-center'>
            <Select value={filters.type} onValueChange={(val) => updateSearchParams({ type: val })}>
              <SelectTrigger className='w-full lg:w-[180px] h-11 bg-[#f8fafc] border-gray-100 rounded-xl font-semibold text-gray-600 capitalize'>
                <div className='flex items-center gap-2'>
                  <Users className='h-3.5 w-3.5 text-gray-400' />
                  <SelectValue placeholder='Loại nhóm' />
                </div>
              </SelectTrigger>
              <SelectContent className='rounded-xl border-gray-200 shadow-xl'>
                <SelectItem value='all' className='font-medium'>
                  Tất cả loại nhóm
                </SelectItem>
                <SelectItem value='THESIS' className='font-medium'>
                  Khoá luận
                </SelectItem>
                <SelectItem value='RESEARCH' className='font-medium'>
                  Nghiên cứu
                </SelectItem>
              </SelectContent>
            </Select>

            {filters.tab === 'mine' && (
              <Select value={filters.status} onValueChange={(val) => updateSearchParams({ status: val })}>
                <SelectTrigger className='w-full lg:w-[180px] h-11 bg-[#f8fafc] border-gray-100 rounded-xl font-semibold text-gray-600 capitalize'>
                  <div className='flex items-center gap-2'>
                    <Shield className='h-3.5 w-3.5 text-gray-400' />
                    <SelectValue placeholder='Trạng thái' />
                  </div>
                </SelectTrigger>
                <SelectContent className='rounded-xl border-gray-200 shadow-xl'>
                  <SelectItem value='all' className='font-medium'>
                    Tất cả trạng thái
                  </SelectItem>
                  <SelectItem value='public' className='font-medium'>
                    Public
                  </SelectItem>
                  <SelectItem value='private' className='font-medium'>
                    Private
                  </SelectItem>
                </SelectContent>
              </Select>
            )}

            <InfiniteScrollSelect
              value={filters.leaderId === 'all' ? '' : filters.leaderId}
              onValueChange={(val) => updateSearchParams({ leaderId: val || 'all' })}
              placeholder='Tất cả giảng viên'
              items={leaders}
              getItemValue={(leader: UserResponse) => leader.userId.toString()}
              getItemLabel={(leader: UserResponse) => leader.fullName}
              hasMore={false}
              isLoading={isLeadersLoading}
              onLoadMore={() => {}}
              onSearchChange={(search) => setLeaderSearch(search)}
              icon={<GraduationCap className='h-3.5 w-3.5' />}
              className='w-full lg:w-[260px] h-11 bg-[#f8fafc] border-gray-100 rounded-xl'
              emptyText='Không tìm thấy giảng viên'
            />

            {isFiltered && (
              <Button
                variant='ghost'
                onClick={handleClearFilters}
                className='h-11 px-3 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors'
                title='Xoá bộ lọc'
              >
                <FilterX className='h-5 w-5' />
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className='flex flex-col items-center justify-center py-40 gap-4'>
            <Loader2 className='h-10 w-10 text-primary animate-spin' />
            <p className='text-gray-400 font-bold animate-pulse uppercase tracking-wider text-sm'>
              Đang tải danh sách nhóm...
            </p>
          </div>
        ) : groups.length === 0 ? (
          <div className='bg-white rounded-[2rem] p-20 border border-gray-100 flex flex-col items-center text-center shadow-sm'>
            <div className='w-24 h-24 bg-[#f8fafc] rounded-full flex items-center justify-center mb-8'>
              <Users className='h-10 w-10 text-gray-300' />
            </div>
            <h3 className='text-2xl font-black text-gray-900 mb-2'>
              {filters.tab === 'all' ? 'Không tìm thấy nhóm phù hợp' : 'Bạn chưa tham gia nhóm nào'}
            </h3>
            <p className='text-gray-400 font-bold max-w-sm leading-relaxed'>
              {isFiltered
                ? 'Hãy thử thay đổi từ khóa hoặc xóa bộ lọc để tìm kiếm các nhóm khác.'
                : filters.tab === 'all'
                  ? 'Hiện tại chưa có nhóm nào được đăng ký.'
                  : 'Hãy khám phá các nhóm nghiên cứu khác để bắt đầu cộng tác và học hỏi nhé!'}
            </p>
            {isFiltered && (
              <Button
                onClick={handleClearFilters}
                variant='outline'
                className='mt-8 h-12 px-8 rounded-xl font-bold border-gray-200 hover:bg-gray-50'
              >
                Xoá tất cả bộ lọc
              </Button>
            )}
            {filters.tab === 'mine' && !isFiltered && (
              <Button
                onClick={() => handleTabChange('all')}
                className='mt-10 h-14 px-10 rounded-2xl font-black bg-primary text-white hover:bg-primary/95 shadow-lg shadow-primary/20 transition-all active:scale-95'
              >
                Khám phá ngay
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {groups.map((group) => (
                <ResearchGroupCard
                  key={group.researchGroupId}
                  group={group}
                  tab={filters.tab}
                  onJoinRequest={handleJoinRequest}
                />
              ))}
            </div>

            {!isLoading && responseData && (
              <div className='mt-12'>
                <PaginationCustom
                  currentPage={filters.page}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  limit={limit}
                  onPageChange={(page) => updateSearchParams({ page })}
                />
              </div>
            )}
          </>
        )}
      </div>

      <DialogCreateJoinRequest
        open={joinModalOpen}
        onOpenChange={setJoinModalOpen}
        groupName={selectedGroup?.name || ''}
        onSubmit={handleSubmitJoinRequest}
        isSubmitting={createJoinRequestMutation.isPending}
      />

      <LoginRequiredDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </div>
  )
}

export default ResearchGroupsPage
