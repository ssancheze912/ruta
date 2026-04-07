import { useMutation, useQueryClient } from '@tanstack/react-query'
import { clienteApiRepository } from '../infrastructure/clienteApiRepository'
import type { CreateClienteDto } from '../domain/IClienteRepository'

export function useCreateCliente() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateClienteDto) => clienteApiRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] })
    },
  })
}
