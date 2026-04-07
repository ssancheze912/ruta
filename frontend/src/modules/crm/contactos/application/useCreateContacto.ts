import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/shared/lib/toast'
import { contactoRepository } from '../infrastructure/contactoApiRepository'
import type { CreateContactoFormValues } from './contactoSchema'

export function useCreateContacto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateContactoFormValues) => contactoRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactos'] })
      toast.success('Contacto creado correctamente')
    },
  })
}
