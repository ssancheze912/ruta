import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/shared/lib/toast'
import { clienteApiRepository } from '../infrastructure/clienteApiRepository'
import type { UpdateClienteDto } from '../domain/IClienteRepository'

export function useUpdateCliente() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClienteDto }) =>
      clienteApiRepository.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] })
      queryClient.invalidateQueries({ queryKey: ['clientes', id] })
      toast.success('Cliente actualizado correctamente')
    },
  })
}
