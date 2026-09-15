import axios from 'axios'

// Authentication headers and cookies must follow the backend contract.
export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || undefined,
  timeout: 30_000,
})
