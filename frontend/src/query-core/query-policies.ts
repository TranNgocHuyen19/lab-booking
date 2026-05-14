export const QUERY_POLICIES = {
  LIST: {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  },
  DETAIL: {
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000
  },
  INFINITE: {
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000
  },
  REALTIME: {
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000
  },
  STATIC: {
    staleTime: Infinity,
    gcTime: Infinity
  }
} as const

export type QueryPolicyType = keyof typeof QUERY_POLICIES
