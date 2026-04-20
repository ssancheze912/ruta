import { lazy, Suspense, useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { Alert, Badge, Button, Input, Table } from 'siesa-ui-kit'
import type { TableColumn } from 'siesa-ui-kit'
import { useContactos } from '../application/useContactos'
import type { Contacto } from '../domain/Contacto'
import { useClientes } from '@/modules/crm/clientes/application/useClientes'
import { contactoRepository } from '../infrastructure/contactoApiRepository'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorPanel } from '@/shared/components/ErrorPanel'
import { toast } from '@/shared/lib/toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ContactoForm } from './ContactoForm'

const ContactoFormDialog = lazy(() =>
  import('./ContactoFormDialog').then((m) => ({ default: m.ContactoFormDialog })),
)

export function ContactoListView() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: contactos = [], isLoading, isError, refetch } = useContactos()
  const { clientes = [] } = useClientes()
  const [searchTerm, setSearchTerm] = useState('')
  const [showOrphansOnly, setShowOrphansOnly] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingContacto, setEditingContacto] = useState<Contacto | null>(null)
  const [deletingContacto, setDeletingContacto] = useState<Contacto | null>(null)

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contactoRepository.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['contactos'] })
      queryClient.removeQueries({ queryKey: ['contactos', id] })
      toast.success('Contacto eliminado correctamente')
      setDeletingContacto(null)
    },
    onError: () => {
      toast.error('No se pudo eliminar el contacto. Intenta de nuevo.')
    },
  })

  const orphanCount = useMemo(
    () => contactos.filter((c) => c.clienteId === null).length,
    [contactos],
  )

  const filteredContactos = useMemo(() => {
    let result = showOrphansOnly ? contactos.filter((c) => c.clienteId === null) : contactos
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      result = result.filter(
        (c) =>
          c.nombre.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q),
      )
    }
    return result
  }, [contactos, searchTerm, showOrphansOnly])

  const columns: TableColumn<Contacto>[] = [
    { header: 'Nombre', accessor: 'nombre', sortable: true },
    { header: 'Cargo', accessor: 'cargo' },
    { header: 'Teléfono', accessor: 'telefono' },
    { header: 'Email', accessor: 'email' },
    {
      header: 'Cliente',
      accessor: 'clienteId',
      render: (_value, row) => {
        if (row.clienteId === null) return <Badge color="amber" label="Sin cliente" />
        const cliente = clientes.find((c) => c.id === row.clienteId)
        return <span className="text-sm text-slate-700">{cliente?.nombre ?? '—'}</span>
      },
    },
    {
      header: '',
      accessor: 'id',
      align: 'right',
      width: '200px',
      render: (_value, row) => (
        <div className="flex gap-1 justify-end">
          <Button
            type="plain"
            size="xs"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              navigate({ to: '/contactos/$contactoId', params: { contactoId: row.id } })
            }}
          >
            Ver
          </Button>
          <Button
            type="plain"
            size="xs"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              setEditingContacto(row)
            }}
          >
            Editar
          </Button>
          <Button
            type="plain"
            size="xs"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              setDeletingContacto(row)
            }}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-slate-900">Contactos</h1>
          {!isLoading && (
            <Button
              type={showOrphansOnly ? 'outline-solid' : 'plain'}
              size="xs"
              onClick={() => setShowOrphansOnly((prev) => !prev)}
            >
              {`Sin cliente (${orphanCount})`}
            </Button>
          )}
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>Nuevo contacto</Button>
      </div>

      {/* Search */}
      <div className="mb-4 max-w-sm px-6">
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nombre o email"
          aria-label="Buscar contactos"
        />
      </div>

      {/* Content */}
      {isError && !isLoading && (
        <div className="px-6">
          <ErrorPanel onRetry={refetch} />
        </div>
      )}

      {isLoading && (
        <div className="px-6 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} height={48} />
          ))}
        </div>
      )}

      {!isLoading && !isError && contactos.length === 0 && (
        <EmptyState message="No hay contactos aún. Crea el primer contacto." />
      )}

      {!isLoading && !isError && contactos.length > 0 && filteredContactos.length === 0 && showOrphansOnly && (
        <EmptyState message="Todos los contactos tienen cliente asignado" />
      )}

      {!isLoading && !isError && contactos.length > 0 && filteredContactos.length === 0 && !showOrphansOnly && (
        <EmptyState message="Sin resultados para tu búsqueda." />
      )}

      {!isLoading && !isError && filteredContactos.length > 0 && (
        <div className="px-6">
          <Table
            columns={columns}
            data={filteredContactos}
            variant="fullWidth"
            onRowClick={(row) =>
              navigate({ to: '/contactos/$contactoId', params: { contactoId: row.id } })
            }
            emptyMessage="No hay contactos registrados"
          />
        </div>
      )}

      <Suspense fallback={null}>
        {isCreateOpen && (
          <ContactoFormDialog
            open={isCreateOpen}
            onOpenChange={setIsCreateOpen}
          />
        )}
      </Suspense>

      {editingContacto && (
        <Dialog
          open={!!editingContacto}
          onOpenChange={(open) => { if (!open) setEditingContacto(null) }}
        >
          <DialogContent showCloseButton>
            <DialogHeader>
              <DialogTitle>Editar contacto</DialogTitle>
            </DialogHeader>
            <ContactoForm
              contactoId={editingContacto.id}
              defaultValues={{
                nombre: editingContacto.nombre,
                cargo: editingContacto.cargo,
                telefono: editingContacto.telefono,
                email: editingContacto.email,
              }}
              initialClienteId={editingContacto.clienteId}
              onSuccess={() => setEditingContacto(null)}
              onCancel={() => setEditingContacto(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {deletingContacto && (
        <Dialog
          open={!!deletingContacto}
          onOpenChange={(open) => { if (!open) setDeletingContacto(null) }}
        >
          <DialogContent className="p-0 overflow-hidden" showCloseButton={false}>
            <Alert
              title="¿Eliminar este contacto?"
              description={`Estás a punto de eliminar a ${deletingContacto.nombre}. Esta acción no se puede deshacer.`}
              onCancel={() => setDeletingContacto(null)}
              onConfirm={() => deleteMutation.mutateAsync(deletingContacto.id)}
              confirmText="Eliminar"
              isProcess={deleteMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
