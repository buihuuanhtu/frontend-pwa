import axios, { type AxiosInstance } from 'axios'

import { httpClient } from '@/services/httpClient'

const demoApiClient = axios.create({
  baseURL:
    import.meta.env.VITE_DEMO_API_BASE_URL ||
    'https://jsonplaceholder.typicode.com',
  timeout: 30_000,
})

const apiClients: Record<string, AxiosInstance> = {
  'main-api': httpClient,
  'demo-api': demoApiClient,
}

export const getApiClient = (apiKey: string): AxiosInstance => {
  const client = apiClients[apiKey]

  if (!client) {
    throw new Error(`No API client registered for ${apiKey}`)
  }

  return client
}
