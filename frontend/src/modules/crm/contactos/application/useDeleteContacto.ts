import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/shared/lib/toast'
import { contactoRepository } from '../infrastructure/contactoApiRepository'

export function useDeleteContacto(contactoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => contactoRepository.delete(contactoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactos'] })
      queryClient.removeQueries({ queryKey: ['contactos', contactoId] })
      toast.success('Contacto eliminado correctamente')
    },
    onError: () => {
      toast.error('No se pudo eliminar el contacto. Intenta de nuevo.')
    },
  })
}
