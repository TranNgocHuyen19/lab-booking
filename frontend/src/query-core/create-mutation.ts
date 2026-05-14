import { useMutation, type UseMutationOptions } from '@tanstack/react-query'
import { MUTATION_POLICIES } from './mutation-policies'

export function createMutation<TData, TVariables, TError = Error, TContext = unknown>(
  baseOptions: UseMutationOptions<TData, TError, TVariables, TContext>
) {
  return (overrideOptions?: Partial<UseMutationOptions<TData, TError, TVariables, TContext>>) =>
    useMutation<TData, TError, TVariables, TContext>({
      ...MUTATION_POLICIES.DEFAULT,
      ...baseOptions,
      ...overrideOptions
    })
}
