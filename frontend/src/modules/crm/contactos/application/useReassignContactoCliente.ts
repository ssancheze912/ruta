import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/shared/lib/toast'
import { contactoRepository } from '../infrastructure/contactoApiRepository'

interface ReassignParams {
  contactoId: string
  newClienteId: string
  oldClienteId: string
}

export function useReassignContactoCliente() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ contactoId, newClienteId }: ReassignParams) =>
      contactoRepository.assignCliente(contactoId, newClienteId),
    onSuccess: (_, { oldClienteId, newClienteId }) => {
      queryClient.invalidateQueries({ queryKey: ['contactos'] })
      queryClient.invalidateQueries({ queryKey: ['contactos', { clienteId: oldClienteId }] })
      queryClient.invalidateQueries({ queryKey: ['contactos', { clienteId: newClienteId }] })
      toast.success('Contacto reasignado correctamente')
    },
    onError: () => {
      toast.error('No se pudo completar la operación. Intenta de nuevo.')
    },
  })
}
