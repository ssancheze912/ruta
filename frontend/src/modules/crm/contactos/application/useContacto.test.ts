import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useContacto } from './useContacto'
import { contactoRepository } from '../infrastructure/contactoApiRepository'

vi.mock('../infrastructure/contactoApiRepository', () => ({
  contactoRepository: {
    getById: vi.fn(),
  },
}))

const mockGetById = vi.mocked(contactoRepository.getById)

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retryDelay: 0 } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client }, children)
}

beforeEach(() => {
  vi.clearAllMocks()
})

const contactoFake = {
  id: 'abc-123',
  nombre: 'Ana García',
  cargo: 'Gerente',
  telefono: '3001234567',
  email: 'ana@empresa.com',
  clienteId: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

describe('useContacto', () => {
  it('returns contacto data on success', async () => {
    mockGetById.mockResolvedValue(contactoFake)

    const { result } = renderHook(() => useContacto('abc-123'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(contactoFake)
    expect(mockGetById).toHaveBeenCalledWith('abc-123')
  })

  it('sets isError on network failure', async () => {
    mockGetById.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useContacto('abc-123'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('does not retry on 404', async () => {
    const error404 = { response: { status: 404 } }
    mockGetById.mockRejectedValue(error404)

    const { result } = renderHook(() => useContacto('abc-123'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    // Only called once — no retries for 404
    expect(mockGetById).toHaveBeenCalledTimes(1)
  })
})
