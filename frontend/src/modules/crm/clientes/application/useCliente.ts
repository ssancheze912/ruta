import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { clienteApiRepository } from '../infrastructure/clienteApiRepository'

export function useCliente(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['clientes', id],
    queryFn: () => clienteApiRepository.getById(id),
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: unknown) => {
      // Don't retry on 404 (not found) or network errors (no response)
      if (!axios.isAxiosError(error) || !error.response || error.response.status === 404) return false
      return failureCount < 2
    },
  })
}
