import { describe, it, expect } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { useCreateCliente } from './useCreateCliente'
import type { Cliente } from '../domain/Cliente'

const BASE = 'http://localhost:5000/api/v1'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

const validPayload = {
  nombre: 'Empresa Test',
  nit: '900-test-1',
  telefono: '3001234567',
  ciudad: 'Bogotá',
}

const mockCreated: Cliente = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  nombre: 'Empresa Test',
  nit: '900-test-1',
  telefono: '3001234567',
  ciudad: 'Bogotá',
  createdAt: '2026-03-14T10:00:00Z',
  updatedAt: '2026-03-14T10:00:00Z',
}

describe('useCreateCliente', () => {
  it('returns created cliente on success', async () => {
    server.use(
      http.post(`${BASE}/clientes`, () => HttpResponse.json(mockCreated, { status: 201 })),
    )

    const { result } = renderHook(() => useCreateCliente(), { wrapper: createWrapper() })

    await act(async () => {
      await result.current.mutateAsync(validPayload)
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.nombre).toBe('Empresa Test')
    expect(result.current.data?.nit).toBe('900-test-1')
  })

  it('surfaces 409 error when NIT is duplicate', async () => {
    server.use(
      http.post(`${BASE}/clientes`, () =>
        HttpResponse.json({ title: 'Conflict', detail: 'El NIT/RUC ya está registrado.' }, { status: 409 }),
      ),
    )

    const { result } = renderHook(() => useCreateCliente(), { wrapper: createWrapper() })

    await act(async () => {
      try {
        await result.current.mutateAsync(validPayload)
      } catch {
        // expected — mutation throws on error
      }
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('invalidates clientes query on success', async () => {
    server.use(
      http.post(`${BASE}/clientes`, () => HttpResponse.json(mockCreated, { status: 201 })),
    )

    const queryClient = new QueryClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children)

    const { result } = renderHook(() => useCreateCliente(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync(validPayload)
    })

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['clientes'] })
  })
})
