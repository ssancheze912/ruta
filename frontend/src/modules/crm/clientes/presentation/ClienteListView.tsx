import { lazy, Suspense, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { Button, Input, Table } from 'siesa-ui-kit'
import type { TableColumn } from 'siesa-ui-kit'
import { useClientes } from '../application/useClientes'
import { useDeleteCliente } from '../application/useDeleteCliente'
import type { Cliente } from '../domain/Cliente'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorPanel } from '@/shared/components/ErrorPanel'
import { ClienteDeleteDialog } from './ClienteDeleteDialog'

const ClienteFormDialog = lazy(() =>
  import('./ClienteFormDialog').then((m) => ({ default: m.ClienteFormDialog })),
)

export function ClienteListView() {
  const navigate = useNavigate()
  const { clientes = [], isLoading, isError, refetch } = useClientes()
  const deleteMutation = useDeleteCliente()
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)
  const [deletingCliente, setDeletingCliente] = useState<Cliente | null>(null)

  const filteredClientes = useMemo(() => {
    if (!searchTerm.trim()) return clientes
    const q = searchTerm.toLowerCase()
    return clientes.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        c.nit.toLowerCase().includes(q),
    )
  }, [clientes, searchTerm])

  const columns: TableColumn<Cliente>[] = [
    { header: 'Nombre', accessor: 'nombre', sortable: true },
    { header: 'NIT/RUC', accessor: 'nit' },
    { header: 'Teléfono', accessor: 'telefono' },
    { header: 'Ciudad', accessor: 'ciudad' },
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
              navigate({ to: '/clientes/$clienteId', params: { clienteId: row.id } })
            }}
          >
            Ver
          </Button>
          <Button
            type="plain"
            size="xs"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              setEditingCliente(row)
            }}
          >
            Editar
          </Button>
          <Button
            type="plain"
            size="xs"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              setDeletingCliente(row)
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
        <h1 className="text-xl font-semibold text-slate-900">Clientes</h1>
        <Button onClick={() => setIsCreateOpen(true)}>Nuevo cliente</Button>
      </div>

      {/* Search */}
      <div className="mb-4 max-w-sm px-6">
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nombre o NIT/RUC"
          aria-label="Buscar clientes"
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

      {!isLoading && !isError && clientes.length === 0 && (
        <EmptyState message="No hay clientes aún. Crea el primer cliente." />
      )}

      {!isLoading && !isError && clientes.length > 0 && filteredClientes.length === 0 && (
        <EmptyState message="Sin resultados para tu búsqueda." />
      )}

      {!isLoading && !isError && filteredClientes.length > 0 && (
        <div className="px-6">
          <Table
            columns={columns}
            data={filteredClientes}
            variant="fullWidth"
            onRowClick={(row) =>
              navigate({ to: '/clientes/$clienteId', params: { clienteId: row.id } })
            }
            emptyMessage="No hay clientes registrados"
          />
        </div>
      )}

      <Suspense fallback={null}>
        {isCreateOpen && (
          <ClienteFormDialog
            open={isCreateOpen}
            onOpenChange={setIsCreateOpen}
            onSuccess={() => setIsCreateOpen(false)}
          />
        )}
        {editingCliente && (
          <ClienteFormDialog
            open={!!editingCliente}
            onOpenChange={(open) => { if (!open) setEditingCliente(null) }}
            onSuccess={() => setEditingCliente(null)}
            clienteId={editingCliente.id}
            defaultValues={{
              nombre: editingCliente.nombre,
              nit: editingCliente.nit,
              telefono: editingCliente.telefono,
              ciudad: editingCliente.ciudad,
            }}
          />
        )}
      </Suspense>

      {deletingCliente && (
        <ClienteDeleteDialog
          open={!!deletingCliente}
          onOpenChange={(open) => { if (!open) setDeletingCliente(null) }}
          clienteNombre={deletingCliente.nombre}
          onConfirm={async () => {
            await deleteMutation.mutateAsync(deletingCliente.id)
            setDeletingCliente(null)
          }}
          isPending={deleteMutation.isPending}
        />
      )}
    </div>
  )
}
