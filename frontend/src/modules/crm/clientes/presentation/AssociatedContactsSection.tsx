import { useNavigate } from '@tanstack/react-router'
import Skeleton from 'react-loading-skeleton'
import { Button, Table } from 'siesa-ui-kit'
import type { TableColumn } from 'siesa-ui-kit'
import { useContactosByCliente } from '@/modules/crm/contactos/application/useContactosByCliente'
import { useAssignContactoCliente } from '@/modules/crm/contactos/application/useAssignContactoCliente'
import type { Contacto } from '@/modules/crm/contactos/domain/Contacto'
import { ErrorPanel } from '@/shared/components/ErrorPanel'
import { AssociarContactoDialog } from './AssociarContactoDialog'

interface AssociatedContactsSectionProps {
  clienteId: string
}

export function AssociatedContactsSection({ clienteId }: AssociatedContactsSectionProps) {
  const navigate = useNavigate()
  const { data: contactos = [], isLoading, isError, refetch } = useContactosByCliente(clienteId)
  const { mutateAsync, isPending } = useAssignContactoCliente()

  const handleDisassociate = async (contacto: Contacto) => {
    try {
      await mutateAsync({ contactoId: contacto.id, clienteId: null, currentClienteId: clienteId })
    } catch {
      // onError en el hook maneja el toast
    }
  }

  const handleAssociate = async (contacto: Contacto) => {
    try {
      await mutateAsync({ contactoId: contacto.id, clienteId, currentClienteId: clienteId })
    } catch {
      // onError en el hook maneja el toast
    }
  }

  const columns: TableColumn<Contacto>[] = [
    { header: 'Nombre', accessor: 'nombre', sortable: true },
    { header: 'Cargo', accessor: 'cargo' },
    { header: 'Teléfono', accessor: 'telefono' },
    { header: 'Email', accessor: 'email' },
    {
      header: '',
      accessor: 'id',
      align: 'right',
      width: '120px',
      render: (_value, row) => (
        <Button
          type="plain"
          size="xs"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation()
            handleDisassociate(row)
          }}
          disabled={isPending}
        >
          Desasociar
        </Button>
      ),
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} height={40} />
        ))}
      </div>
    )
  }

  if (isError) {
    return <ErrorPanel message="No se pudieron cargar los contactos." onRetry={refetch} />
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <AssociarContactoDialog onSelect={handleAssociate} isLoading={isPending} />
      </div>

      {contactos.length === 0 ? (
        <p className="text-sm text-slate-500">Sin contactos asociados aún.</p>
      ) : (
        <Table
          columns={columns}
          data={contactos}
          variant="fullWidth"
          onRowClick={(row) =>
            navigate({ to: '/contactos/$contactoId', params: { contactoId: row.id } })
          }
        />
      )}
    </div>
  )
}
