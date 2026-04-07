import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/shared/lib/toast'
import { clienteApiRepository } from '../infrastructure/clienteApiRepository'

export function useDeleteCliente() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => clienteApiRepository.delete(id),
    onSuccess: ({ contactosDesasociados }, id) => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] })
      queryClient.removeQueries({ queryKey: ['clientes', id] })
      if (contactosDesasociados > 0) {
        toast.success('Cliente eliminado. Sus contactos asociados quedaron sin cliente asignado.')
      } else {
        toast.success('Cliente eliminado correctamente')
      }
    },
    onError: () => {
      toast.error('No se pudo eliminar el cliente.')
    },
  })
}
