import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query'
import { QUERY_POLICIES } from './query-policies'

type QueryKey = readonly unknown[]

interface InfiniteQueryBaseOptions<TData> {
  queryKey: QueryKey
  queryFn: (context: { pageParam: number }) => Promise<TData>
  getNextPageParam: (lastPage: TData, allPages: TData[], lastPageParam: number) => number | undefined
  initialPageParam: number
  enabled?: boolean
  staleTime?: number
  gcTime?: number
  select?: (data: InfiniteData<TData, number>) => unknown
}

export function createInfiniteQuery<TData>(baseOptions: InfiniteQueryBaseOptions<TData>) {
  return (overrideOptions?: { enabled?: boolean }) => {
    const { queryKey, queryFn, getNextPageParam, initialPageParam, enabled, staleTime, gcTime, select } = baseOptions

    return useInfiniteQuery({
      queryKey,
      queryFn: ({ pageParam }) => queryFn({ pageParam: pageParam as number }),
      getNextPageParam,
      initialPageParam,
      enabled: overrideOptions?.enabled ?? enabled,
      staleTime: staleTime ?? QUERY_POLICIES.INFINITE.staleTime,
      gcTime: gcTime ?? QUERY_POLICIES.INFINITE.gcTime,
      select: select as ((data: InfiniteData<TData, number>) => InfiniteData<TData, number>) | undefined
    })
  }
}
