import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { networkMode: 'online' },
    mutations: { networkMode: 'online', retry: false },
  },
})
