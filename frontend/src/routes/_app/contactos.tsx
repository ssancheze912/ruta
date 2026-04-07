import { createFileRoute, Outlet, useChildMatches } from '@tanstack/react-router'
import { ContactoListView } from '@/modules/crm/contactos/presentation/ContactoListView'

function ContactosRoute() {
  const children = useChildMatches()
  if (children.length > 0) return <Outlet />
  return <ContactoListView />
}

export const Route = createFileRoute('/_app/contactos')({
  component: ContactosRoute,
})
