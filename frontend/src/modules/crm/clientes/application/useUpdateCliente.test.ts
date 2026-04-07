import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { useUpdateCliente } from './useUpdateCliente'
import { toast } from '@/shared/lib/toast'

vi.mock('@/shared/lib/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn(), show: vi.fn() },
}))

const BASE = 'http://localhost:5000/api/v1'

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
  return { queryClient, wrapper }
}

const validData = { nombre: 'Actualizado', nit: '900-1', telefono: '300', ciudad: 'Bogotá' }
const clienteId = 'test-id-123'

describe('useUpdateCliente', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns updated cliente, calls toast.success, and invalidates both query keys on 200', async () => {
    server.use(
      http.put(`${BASE}/clientes/${clienteId}`, () =>
        HttpResponse.json(
          { id: clienteId, ...validData, createdAt: '', updatedAt: '' },
          { status: 200 },
        ),
      ),
    )
    const { queryClient, wrapper } = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useUpdateCliente(), { wrapper })
    await act(async () => {
      result.current.mutate({ id: clienteId, data: validData })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(toast.success).toHaveBeenCalledWith('Cliente actualizado correctamente')
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['clientes'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['clientes', clienteId] })
  })

  it('sets isError true on 404', async () => {
    server.use(
      http.put(`${BASE}/clientes/${clienteId}`, () =>
        HttpResponse.json({ title: 'Not Found' }, { status: 404 }),
      ),
    )
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useUpdateCliente(), { wrapper })
    await act(async () => {
      result.current.mutate({ id: clienteId, data: validData })
    })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('sets isError true on 409', async () => {
    server.use(
      http.put(`${BASE}/clientes/${clienteId}`, () =>
        HttpResponse.json({ title: 'Conflict' }, { status: 409 }),
      ),
    )
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useUpdateCliente(), { wrapper })
    await act(async () => {
      result.current.mutate({ id: clienteId, data: validData })
    })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
