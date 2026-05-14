import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

export function createQuery<TData, TError = Error>(
  baseOptions: UseQueryOptions<TData, TError, TData, readonly unknown[]>
) {
  return (overrideOptions?: Partial<UseQueryOptions<TData, TError, TData, readonly unknown[]>>) =>
    useQuery<TData, TError, TData, readonly unknown[]>({
      ...baseOptions,
      ...overrideOptions
    })
}
