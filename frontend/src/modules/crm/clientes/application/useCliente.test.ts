import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { useCliente } from './useCliente'
import type { Cliente } from '../domain/Cliente'

const BASE = 'http://localhost:5000/api/v1'

const mockCliente: Cliente = {
  id: '550e8400-e29b-41d4-a716-446655440099',
  nombre: 'Empresa Detalle',
  nit: '900000099-9',
  telefono: '+57 1 000 0000',
  ciudad: 'Cali',
  createdAt: '2026-03-13T10:00:00Z',
  updatedAt: '2026-03-13T10:00:00Z',
}

function createWrapper() {
  // Note: useCliente defines its own retry callback — per-query options override defaults in TanStack Query v5
  const queryClient = new QueryClient()
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useCliente', () => {
  it('returns cliente data on success', async () => {
    server.use(
      http.get(`${BASE}/clientes/${mockCliente.id}`, () =>
        HttpResponse.json(mockCliente),
      ),
    )

    const { result } = renderHook(() => useCliente(mockCliente.id), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.nombre).toBe('Empresa Detalle')
    expect(result.current.data?.nit).toBe('900000099-9')
    expect(result.current.data?.ciudad).toBe('Cali')
  })

  it('sets isError true on 404 not found', async () => {
    const id = 'nonexistent-00000000-0000-0000-0000-000000000000'
    server.use(
      http.get(`${BASE}/clientes/${id}`, () =>
        HttpResponse.json({ title: 'Not Found' }, { status: 404 }),
      ),
    )

    const { result } = renderHook(() => useCliente(id), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.data).toBeUndefined()
  })

  it('sets isError true on network failure', async () => {
    const id = '550e8400-e29b-41d4-a716-000000000001'
    server.use(
      http.get(`${BASE}/clientes/${id}`, () => HttpResponse.error()),
    )

    const { result } = renderHook(() => useCliente(id), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('does not fetch when enabled is false', () => {
    const { result } = renderHook(
      () => useCliente(mockCliente.id, { enabled: false }),
      { wrapper: createWrapper() },
    )

    expect(result.current.isLoading).toBe(false)
    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.data).toBeUndefined()
  })
})
