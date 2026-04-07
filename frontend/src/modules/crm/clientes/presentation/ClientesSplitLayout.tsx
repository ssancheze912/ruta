import { useNavigate } from '@tanstack/react-router'
import { ClienteListView } from './ClienteListView'

interface ClientesSplitLayoutProps {
  selectedId?: string
  children: React.ReactNode
}

export function ClientesSplitLayout({ selectedId, children }: ClientesSplitLayoutProps) {
  const navigate = useNavigate()

  return (
    <div className="flex h-full">
      {/* Panel izquierdo — lista de clientes (280px fijo) */}
      <div className="w-[280px] flex-shrink-0 border-r border-slate-200 overflow-hidden flex flex-col">
        <ClienteListView
          selectedId={selectedId}
          onSelect={(id) =>
            navigate({ to: '/clientes/$clienteId', params: { clienteId: id } })
          }
        />
      </div>

      {/* Panel derecho */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
