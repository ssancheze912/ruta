import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { useClientes } from './useClientes'
import type { Cliente } from '../domain/Cliente'

const mockClientes: Cliente[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    nombre: 'Empresa ABC',
    nit: '900123456-1',
    telefono: '6014567890',
    ciudad: 'Bogotá',
    createdAt: '2026-03-13T10:00:00Z',
    updatedAt: '2026-03-13T10:00:00Z',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    nombre: 'Constructora XYZ',
    nit: '800987654-2',
    telefono: null,
    ciudad: 'Medellín',
    createdAt: '2026-03-13T11:00:00Z',
    updatedAt: '2026-03-13T11:00:00Z',
  },
]

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useClientes', () => {
  it('returns cliente list on success', async () => {
    server.use(
      http.get('http://localhost:5000/api/v1/clientes', () =>
        HttpResponse.json(mockClientes),
      ),
    )

    const { result } = renderHook(() => useClientes(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.clientes).toHaveLength(2)
    expect(result.current.clientes[0].nombre).toBe('Empresa ABC')
    expect(result.current.isError).toBe(false)
  })

  it('returns empty array when no clientes', async () => {
    // default handler returns [] — no override needed

    const { result } = renderHook(() => useClientes(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.clientes).toHaveLength(0)
    expect(result.current.isError).toBe(false)
  })

  it('sets isError true on network failure', async () => {
    server.use(
      http.get('http://localhost:5000/api/v1/clientes', () =>
        HttpResponse.error(),
      ),
    )

    const { result } = renderHook(() => useClientes(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.clientes).toHaveLength(0)
  })
})
