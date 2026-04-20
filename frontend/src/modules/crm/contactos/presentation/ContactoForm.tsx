import { useState } from 'react'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input, Button, LookupField } from 'siesa-ui-kit'
import { contactoSchema, type ContactoFormValues } from '../application/contactoSchema'
import { useCreateContacto } from '../application/useCreateContacto'
import { useUpdateContacto } from '../application/useUpdateContacto'
import { useAssignContactoCliente } from '../application/useAssignContactoCliente'
import { lookupFetcher } from '@/shared/lib/lookupFetcher'

interface ContactoFormProps {
  onSuccess: () => void
  onCancel: () => void
  contactoId?: string
  defaultValues?: ContactoFormValues
  initialClienteId?: string | null
}

export function ContactoForm({
  onSuccess,
  onCancel,
  contactoId,
  defaultValues,
  initialClienteId,
}: ContactoFormProps) {
  const [selectedClienteId, setSelectedClienteId] = useState<string | null>(
    initialClienteId ?? null,
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ContactoFormValues>({
    resolver: zodResolver(contactoSchema),
    defaultValues,
  })

  const createMutation = useCreateContacto()
  const updateMutation = useUpdateContacto(contactoId ?? '')
  const assignMutation = useAssignContactoCliente()
  const mutation = contactoId ? updateMutation : createMutation

  const onSubmit = async (data: ContactoFormValues) => {
    try {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        throw new Error('Formato de email inválido')
      }
      let resolvedContactoId = contactoId

      if (contactoId) {
        await updateMutation.mutateAsync(data)
      } else {
        const created = await createMutation.mutateAsync(data)
        resolvedContactoId = created.id
      }

      // Associate to client if selection changed
      const clienteChanged = selectedClienteId !== (initialClienteId ?? null)
      if (clienteChanged && resolvedContactoId) {
        await assignMutation.mutateAsync({
          contactoId: resolvedContactoId,
          clienteId: selectedClienteId,
          currentClienteId: selectedClienteId ?? initialClienteId ?? '',
        })
      }

      onSuccess()
    } catch (error) {
      if (error instanceof Error && !axios.isAxiosError(error)) {
        setError('root', { message: error.message })
        return
      }
      const detail = axios.isAxiosError(error)
        ? (error.response?.data as { detail?: string })?.detail
        : undefined
      setError('root', {
        message: detail ?? 'No se pudo guardar. Intenta de nuevo.',
      })
    }
  }

  const isPending = mutation.isPending || assignMutation.isPending

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        label="Nombre"
        fullWidth
        error={!!errors.nombre}
        errorMessage={errors.nombre?.message}
        {...register('nombre')}
      />
      <Input
        label="Cargo"
        fullWidth
        error={!!errors.cargo}
        errorMessage={errors.cargo?.message}
        {...register('cargo')}
      />
      <Input
        label="Teléfono"
        fullWidth
        error={!!errors.telefono}
        errorMessage={errors.telefono?.message}
        {...register('telefono')}
      />
      <Input
        label="Email"
        type="email"
        fullWidth
        error={!!errors.email}
        errorMessage={errors.email?.message}
        {...register('email')}
      />

      <LookupField
        entity="clientes"
        label="Cliente (opcional)"
        displayFields={['Nombre', 'Nit']}
        displayValue="Nombre"
        placeholder="Buscar cliente..."
        clearable
        minChars={0}
        value={selectedClienteId}
        onChange={(record) => setSelectedClienteId(record?.Id ?? null)}
        fetcher={lookupFetcher}
      />

      {errors.root && (
        <p className="text-sm text-red-600">{errors.root.message}</p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="outline-solid" onClick={onCancel} disabled={isPending}>
          Cancelar
        </Button>
        <Button htmlType="submit" disabled={isPending}>
          {isPending ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}
