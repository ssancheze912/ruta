import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/shared/lib/toast'
import { contactoRepository } from '../infrastructure/contactoApiRepository'

interface AssignParams {
  contactoId: string
  clienteId: string | null
  currentClienteId: string
}

export function useAssignContactoCliente() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ contactoId, clienteId }: AssignParams) =>
      contactoRepository.assignCliente(contactoId, clienteId),
    onSuccess: (_, { clienteId, currentClienteId }) => {
      queryClient.invalidateQueries({ queryKey: ['contactos'] })
      queryClient.invalidateQueries({ queryKey: ['contactos', { clienteId: currentClienteId }] })
      const msg = clienteId ? 'Contacto asociado correctamente' : 'Contacto desasociado correctamente'
      toast.success(msg)
    },
    onError: () => {
      toast.error('No se pudo completar la operación. Intenta de nuevo.')
    },
  })
}
