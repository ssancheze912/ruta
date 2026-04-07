import { useState } from 'react'
import { Alert, Button, DescriptionList } from 'siesa-ui-kit'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { useContacto } from '../application/useContacto'
import { useCliente } from '../../clientes/application/useCliente'
import { ErrorPanel } from '@/shared/components/ErrorPanel'
import { getHttpStatus } from '@/shared/lib/httpError'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ContactoForm } from './ContactoForm'
import { useDeleteContacto } from '../application/useDeleteContacto'
import { ReasignarClienteDialog } from './ReasignarClienteDialog'

interface ContactoDetailViewProps {
  contactoId: string
}

export function ContactoDetailView({ contactoId }: ContactoDetailViewProps) {
  const navigate = useNavigate()
  const router = useRouter()
  const { data: contacto, isLoading, isError, error, refetch } = useContacto(contactoId)
  const { data: cliente, isLoading: isClienteLoading, isError: isClienteError } = useCliente(
    contacto?.clienteId ?? '',
    { enabled: !!contacto?.clienteId },
  )
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false)
  const deleteMutation = useDeleteContacto(contactoId)

  const is404 = getHttpStatus(error) === 404

  if (isLoading) {
    return (
      <div className="p-6 space-y-3 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 bg-slate-100 rounded" />
        ))}
      </div>
    )
  }

  if (isError && is404) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
        <p className="text-slate-600">Contacto no encontrado.</p>
        <Button type="outline-solid" onClick={() => navigate({ to: '/contactos' })}>
          Volver a contactos
        </Button>
      </div>
    )
  }

  if (isError) {
    return (
      <ErrorPanel
        message="No se pudo cargar el contacto."
        onRetry={() => refetch()}
      />
    )
  }

  if (!contacto) return null

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-slate-900">{contacto.nombre}</h1>
        <div className="flex gap-2">
          <Button onClick={() => setEditDialogOpen(true)}>Editar</Button>
          <Button onClick={() => setDeleteDialogOpen(true)}>Eliminar</Button>
          {contacto.clienteId && (
            <Button onClick={() => setReassignDialogOpen(true)}>Reasignar cliente</Button>
          )}
          <Button type="outline-solid" onClick={() => router.history.back()}>
            Volver
          </Button>
        </div>
      </div>

      <div className="space-y-1">
        <DescriptionList term="Nombre" details={contacto.nombre} />
        <DescriptionList term="Cargo" details={contacto.cargo} />
        <DescriptionList term="Teléfono" details={contacto.telefono} />
        <DescriptionList term="Email" details={contacto.email} />
        {contacto.clienteId ? (
          isClienteLoading ? (
            <DescriptionList term="Cliente" details="Cargando..." />
          ) : isClienteError ? (
            <DescriptionList term="Cliente" details="Error al cargar cliente" />
          ) : (
            <DescriptionList
              term="Cliente"
              details={
                <Button
                  type="plain"
                  onClick={() =>
                    navigate({ to: '/clientes/$clienteId', params: { clienteId: contacto.clienteId } })
                  }
                >
                  {cliente?.nombre ?? '—'}
                </Button>
              }
            />
          )
        ) : (
          <DescriptionList term="Cliente" details="Sin cliente asignado" />
        )}
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar contacto</DialogTitle>
          </DialogHeader>
          <ContactoForm
            contactoId={contactoId}
            defaultValues={{
              nombre: contacto.nombre,
              cargo: contacto.cargo,
              telefono: contacto.telefono,
              email: contacto.email,
            }}
            onSuccess={() => setEditDialogOpen(false)}
            onCancel={() => setEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="p-0 overflow-hidden" showCloseButton={false}>
          <Alert
            title="¿Eliminar este contacto?"
            description="Esta acción no se puede deshacer."
            onCancel={() => setDeleteDialogOpen(false)}
            onConfirm={async () => {
              try {
                await deleteMutation.mutateAsync()
                navigate({ to: '/contactos' })
              } catch {
                // Error feedback handled by useDeleteContacto onError
              }
            }}
            confirmText="Eliminar"
            isProcess={deleteMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {contacto.clienteId && (
        <ReasignarClienteDialog
          contactoId={contactoId}
          currentClienteId={contacto.clienteId}
          open={reassignDialogOpen}
          onOpenChange={setReassignDialogOpen}
        />
      )}
    </div>
  )
}
