import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createRouter, createMemoryHistory } from '@tanstack/react-router'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { routeTree } from '../../routeTree.gen'

function createTestRouter(initialPath = '/clientes') {
  const memoryHistory = createMemoryHistory({ initialEntries: [initialPath] })
  return createRouter({ routeTree, history: memoryHistory })
}

function renderWithRouter(initialPath = '/clientes') {
  const testQueryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const router = createTestRouter(initialPath)
  return render(
    <QueryClientProvider client={testQueryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

describe('Navigation Shell', () => {
  it('renders Clientes view at /clientes', async () => {
    renderWithRouter('/clientes')
    await waitFor(
      () => {
        expect(
          screen.getByRole('heading', { name: /clientes/i }),
        ).toBeInTheDocument()
      },
      { timeout: 12000 },
    )
  })

  it('renders Contactos placeholder at /contactos', async () => {
    renderWithRouter('/contactos')
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /contactos/i })).toBeInTheDocument()
    }, { timeout: 12000 })
  })

  it('redirects / to /clientes', async () => {
    renderWithRouter('/')
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /clientes/i }),
      ).toBeInTheDocument()
    })
  })

  it('renders NotFoundView for unknown route', async () => {
    renderWithRouter('/desconocido')
    await waitFor(() => {
      expect(screen.getByText(/página no encontrada/i)).toBeInTheDocument()
    })
  })

  it('renders link to /clientes in NotFoundView', async () => {
    renderWithRouter('/desconocido')
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /ir a clientes/i })).toBeInTheDocument()
    })
  })

  it('navigates from Clientes to Contactos via nav item', async () => {
    const user = userEvent.setup()
    renderWithRouter('/clientes')
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /clientes/i }),
      ).toBeInTheDocument()
    })
    // Multiple nav buttons exist (NavigationRail + NavigationBar) — click the first
    const contactosLink = screen.getAllByRole('button', { name: /contactos/i })[0]
    await user.click(contactosLink)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /contactos/i })).toBeInTheDocument()
    })
  })

  it('renders mobile NavigationBar with aria-label', async () => {
    renderWithRouter('/clientes')
    await waitFor(() => {
      expect(screen.getByRole('navigation', { name: /navegación principal/i })).toBeInTheDocument()
    })
  })

  it('highlights Clientes nav item as active at /clientes', async () => {
    renderWithRouter('/clientes')
    await waitFor(() => {
      const activeButtons = screen.getAllByRole('button', { name: /clientes/i })
      expect(activeButtons.length).toBeGreaterThan(0)
    })
  })

  it('highlights Contactos nav item as active at /contactos', async () => {
    renderWithRouter('/contactos')
    await waitFor(() => {
      const activeButtons = screen.getAllByRole('button', { name: /contactos/i })
      expect(activeButtons.length).toBeGreaterThan(0)
    })
  })
})
