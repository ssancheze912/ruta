import { z } from 'zod'

export const createContactoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  cargo: z.string().min(1, 'El cargo es requerido'),
  telefono: z.string().min(1, 'El teléfono es requerido'),
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Formato de email inválido'),
})

export type CreateContactoFormValues = z.infer<typeof createContactoSchema>

export const contactoSchema = createContactoSchema
export type ContactoFormValues = CreateContactoFormValues
