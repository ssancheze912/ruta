import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/shared/lib/toast'
import { contactoRepository } from '../infrastructure/contactoApiRepository'
import type { ContactoFormValues } from './contactoSchema'

export function useUpdateContacto(contactoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ContactoFormValues) => contactoRepository.update(contactoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactos'] })
      queryClient.invalidateQueries({ queryKey: ['contactos', contactoId] })
      toast.success('Contacto actualizado correctamente')
    },
  })
}
