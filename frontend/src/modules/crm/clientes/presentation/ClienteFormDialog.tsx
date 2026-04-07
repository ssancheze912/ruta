import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input, Button, LookupField } from 'siesa-ui-kit'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useCreateCliente } from '../application/useCreateCliente'
import { useUpdateCliente } from '../application/useUpdateCliente'
import { useAssignContactoCliente } from '@/modules/crm/contactos/application/useAssignContactoCliente'
import { lookupFetcher } from '@/shared/lib/lookupFetcher'
import { getHttpStatus } from '@/shared/lib/httpError'

const schema = z.object({
  nombre:   z.string().min(1, 'Nombre es requerido'),
  nit:      z.string().min(1, 'NIT/RUC es requerido'),
  telefono: z.string().min(1, 'Teléfono es requerido'),
  ciudad:   z.string().min(1, 'Ciudad es requerida'),
})
type FormValues = z.infer<typeof schema>

const emptyValues: FormValues = { nombre: '', nit: '', telefono: '', ciudad: '' }

interface ClienteFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  clienteId?: string
  defaultValues?: FormValues
}

export function ClienteFormDialog({
  open,
  onOpenChange,
  onSuccess,
  clienteId,
  defaultValues,
}: ClienteFormDialogProps) {
  const createMutation = useCreateCliente()
  const updateMutation = useUpdateCliente()
  const assignMutation = useAssignContactoCliente()

  const { isPending } = clienteId ? updateMutation : createMutation

  // After create: holds the new client's ID to show associate step
  const [newClienteId, setNewClienteId] = useState<string | null>(null)
  const [selectedContactoId, setSelectedContactoId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (open) {
      reset(defaultValues ?? emptyValues)
      setNewClienteId(null)
      setSelectedContactoId(null)
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) reset(emptyValues)
    onOpenChange(isOpen)
  }

  const onSubmit = async (data: FormValues) => {
    try {
      if (clienteId) {
        await updateMutation.mutateAsync({ id: clienteId, data })
        handleOpenChange(false)
        onSuccess()
      } else {
        const created = await createMutation.mutateAsync(data)
        setNewClienteId(created.id)
      }
    } catch (error) {
      if (getHttpStatus(error) === 409) {
        setError('nit', { message: 'El NIT/RUC ya está registrado' })
      }
    }
  }

  const handleAssociate = async () => {
    if (!newClienteId || !selectedContactoId) return
    await assignMutation.mutateAsync({
      contactoId: selectedContactoId,
      clienteId: newClienteId,
      currentClienteId: newClienteId,
    })
    handleOpenChange(false)
    onSuccess()
  }

  const handleSkip = () => {
    handleOpenChange(false)
    onSuccess()
  }

  // Step 2: associate a contact to the newly created client
  if (newClienteId) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>Asociar contacto (opcional)</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500 pb-1">
            Cliente creado correctamente. ¿Deseas asociarle un contacto ahora?
          </p>
          <LookupField
            entity="contactos"
            label="Seleccionar contacto"
            displayFields={['Nombre', 'Cargo']}
            displayValue="Nombre"
            placeholder="Buscar contacto..."
            clearable
            minChars={0}
            value={selectedContactoId}
            onChange={(record) => setSelectedContactoId(record?.Id ?? null)}
            fetcher={lookupFetcher}
          />
          <DialogFooter>
            <Button type="outline-solid" onClick={handleSkip} disabled={assignMutation.isPending}>
              Saltar
            </Button>
            <Button
              onClick={handleAssociate}
              disabled={!selectedContactoId || assignMutation.isPending}
            >
              {assignMutation.isPending ? 'Asociando...' : 'Asociar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // Step 1: create/edit client form
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton>
        <DialogHeader>
          <DialogTitle>{clienteId ? 'Editar cliente' : 'Nuevo cliente'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <Input
            label="Nombre"
            fullWidth
            error={!!errors.nombre}
            errorMessage={errors.nombre?.message}
            {...register('nombre')}
          />
          <Input
            label="NIT/RUC"
            fullWidth
            error={!!errors.nit}
            errorMessage={errors.nit?.message}
            {...register('nit')}
          />
          <Input
            label="Teléfono"
            fullWidth
            error={!!errors.telefono}
            errorMessage={errors.telefono?.message}
            {...register('telefono')}
          />
          <Input
            label="Ciudad"
            fullWidth
            error={!!errors.ciudad}
            errorMessage={errors.ciudad?.message}
            {...register('ciudad')}
          />
          <DialogFooter>
            <Button type="outline-solid" onClick={() => handleOpenChange(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button htmlType="submit" disabled={isPending}>
              {isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
