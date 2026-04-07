import { useMemo } from 'react'
import { createRootRoute, Outlet, useRouterState, useNavigate } from '@tanstack/react-router'
import { LayoutBase, NavigationBar } from 'siesa-ui-kit'
import type { NavigationRailGroupMenuItem, NavigationBarItem } from 'siesa-ui-kit'
import { UsersIcon, UserIcon } from '@heroicons/react/24/outline'
import { NotFoundView } from '@/shared/components/NotFoundView'

function RootComponent() {
  const routerState = useRouterState()
  const navigate = useNavigate()
  const currentPath = routerState.location.pathname

  const navigationItems: NavigationRailGroupMenuItem[] = useMemo(() => [
    {
      id: 'clientes',
      label: 'Clientes',
      icon: <UsersIcon className="w-5 h-5" />,
      active: currentPath.startsWith('/clientes'),
    },
    {
      id: 'contactos',
      label: 'Contactos',
      icon: <UserIcon className="w-5 h-5" />,
      active: currentPath.startsWith('/contactos'),
    },
  ], [currentPath])

  const navBarItems: NavigationBarItem[] = useMemo(() => [
    {
      id: 'clientes',
      label: 'Clientes',
      icon: <UsersIcon className="w-5 h-5" />,
      active: currentPath.startsWith('/clientes'),
    },
    {
      id: 'contactos',
      label: 'Contactos',
      icon: <UserIcon className="w-5 h-5" />,
      active: currentPath.startsWith('/contactos'),
    },
  ], [currentPath])

  const activeNavBarId = currentPath.startsWith('/contactos')
    ? 'contactos'
    : currentPath.startsWith('/clientes')
      ? 'clientes'
      : undefined

  return (
    <>
      <LayoutBase
        productName="Siesa Agents"
        className="!m-0 !p-0"
        siesaLogoPath="/images/logos/Siesa_Logosimbolo_Azul.svg"
        siesaLogoWidth="32px"
        siesaLogoHeight="32px"
        navigationItems={navigationItems}
        navigationRailProps={{
          onItemClick: (item) => {
            if (item.id === 'clientes') void navigate({ to: '/clientes' })
            if (item.id === 'contactos') void navigate({ to: '/contactos' })
          },
          labels: {
            collapseButton: 'Colapsar menú',
            searchPlaceholder: 'Buscar módulo',
          },
        }}
        contentClassName="p-0"
      >
        <Outlet />
      </LayoutBase>

      {/* Mobile bottom navigation — visible only below lg breakpoint */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <NavigationBar
          items={navBarItems}
          activeItemId={activeNavBarId}
          onItemClick={(id) => {
            if (id === 'clientes') void navigate({ to: '/clientes' })
            if (id === 'contactos') void navigate({ to: '/contactos' })
          }}
          ariaLabel="Navegación principal"
        />
      </div>
    </>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundView,
})
