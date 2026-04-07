import { useQuery } from '@tanstack/react-query'
import { contactoRepository } from '../infrastructure/contactoApiRepository'
import { getHttpStatus } from '@/shared/lib/httpError'

export function useContacto(id: string) {
  return useQuery({
    queryKey: ['contactos', id],
    queryFn: () => contactoRepository.getById(id),
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: unknown) => {
      if (getHttpStatus(error) === 404) return false
      return failureCount < 2
    },
  })
}
