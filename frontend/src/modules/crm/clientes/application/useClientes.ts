import { useQuery } from '@tanstack/react-query'
import { clienteApiRepository } from '../infrastructure/clienteApiRepository'

export function useClientes() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => clienteApiRepository.getAll(),
    staleTime: 5 * 60 * 1000,
  })

  return {
    clientes: data ?? [],
    isLoading,
    isError,
    refetch,
  }
}
