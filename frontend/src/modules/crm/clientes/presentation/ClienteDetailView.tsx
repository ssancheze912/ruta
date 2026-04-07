import { useState, lazy, Suspense } from 'react'
import { DescriptionList, Button } from 'siesa-ui-kit'
import { useNavigate } from '@tanstack/react-router'
import axios from 'axios'
import { useCliente } from '../application/useCliente'
import { useDeleteCliente } from '../application/useDeleteCliente'
import { ClienteDeleteDialog } from './ClienteDeleteDialog'
import { AssociatedContactsSection } from './AssociatedContactsSection'
import { ErrorPanel } from '@/shared/components/ErrorPanel'

const ClienteFormDialog = lazy(() =>
  import('./ClienteFormDialog').then((m) => ({ default: m.ClienteFormDialog })),
)

interface ClienteDetailViewProps {
  clienteId: string
}

export function ClienteDetailView({ clienteId }: ClienteDetailViewProps) {
  const navigate = useNavigate()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const deleteMutation = useDeleteCliente()
  const { data: cliente, isLoading, isError, error, refetch } = useCliente(clienteId)

  if (isLoading) {
    return (
      <div className="p-6 animate-pulse space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 bg-slate-100 rounded" />
        ))}
      </div>
    )
  }

  if (isError && axios.isAxiosError(error) && error.response?.status === 404) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
        <p className="text-slate-600">Cliente no encontrado.</p>
        <Button type="outline-solid" onClick={() => navigate({ to: '/clientes' })}>
          Volver a clientes
        </Button>
      </div>
    )
  }

  if (isError) {
    return <ErrorPanel message="No se pudo cargar el cliente." onRetry={() => refetch()} />
  }

  if (!cliente) return null

  return (
    <div className="p-6 space-y-1">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-slate-900">{cliente.nombre}</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsEditOpen(true)}>Editar</Button>
          <Button type="outline-solid" onClick={() => setIsDeleteOpen(true)}>Eliminar</Button>
          <Button type="outline-solid" onClick={() => navigate({ to: '/clientes' })}>
            Volver
          </Button>
        </div>
      </div>

      <DescriptionList term="Nombre" details={cliente.nombre} />
      <DescriptionList term="NIT/RUC" details={cliente.nit} />
      <DescriptionList term="Teléfono" details={cliente.telefono ?? '—'} />
      <DescriptionList term="Ciudad" details={cliente.ciudad ?? '—'} />

      <div className="mt-6">
        <h2 className="text-base font-semibold text-slate-700 mb-3">Contactos asociados</h2>
        <AssociatedContactsSection clienteId={clienteId} />
      </div>

      <ClienteDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        clienteNombre={cliente.nombre}
        isPending={deleteMutation.isPending}
        onConfirm={() => {
          deleteMutation
            .mutateAsync(clienteId)
            .then(() => navigate({ to: '/clientes' }))
            .catch(() => {}) // onError in useDeleteCliente handles error feedback
        }}
      />

      <Suspense fallback={null}>
        <ClienteFormDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          onSuccess={() => {}}
          clienteId={cliente.id}
          defaultValues={{
            nombre: cliente.nombre,
            nit: cliente.nit,
            telefono: cliente.telefono ?? '',
            ciudad: cliente.ciudad ?? '',
          }}
        />
      </Suspense>
    </div>
  )
}
