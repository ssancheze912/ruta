import { useQuery } from '@tanstack/react-query'
import { contactoRepository } from '../infrastructure/contactoApiRepository'

export function useContactos() {
  return useQuery({
    queryKey: ['contactos'],
    queryFn: () => contactoRepository.getAll(),
    staleTime: 5 * 60 * 1000,
  })
}
