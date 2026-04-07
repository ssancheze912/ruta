import { useQuery } from '@tanstack/react-query'
import { contactoRepository } from '../infrastructure/contactoApiRepository'

export function useContactosByCliente(clienteId: string) {
  return useQuery({
    queryKey: ['contactos', { clienteId }],
    queryFn: () => contactoRepository.getByClienteId(clienteId),
    staleTime: 5 * 60 * 1000,
  })
}
