import { createFileRoute, Outlet, useChildMatches } from '@tanstack/react-router'
import { ClienteListView } from '@/modules/crm/clientes/presentation/ClienteListView'

function ClientesRoute() {
  const children = useChildMatches()
  if (children.length > 0) return <Outlet />
  return <ClienteListView />
}

export const Route = createFileRoute('/_app/clientes')({
  component: ClientesRoute,
})
