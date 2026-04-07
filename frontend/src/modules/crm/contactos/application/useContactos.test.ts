import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useContactos } from './useContactos'
import { contactoRepository } from '../infrastructure/contactoApiRepository'
import type { Contacto } from '../domain/Contacto'

vi.mock('../infrastructure/contactoApiRepository', () => ({
  contactoRepository: {
    getAll: vi.fn(),
    getById: vi.fn(),
  },
}))

const mockContactos: Contacto[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    nombre: 'Ana García',
    cargo: 'Gerente',
    telefono: '3001234567',
    email: 'ana@empresa.com',
    clienteId: '550e8400-e29b-41d4-a716-446655440000',
    createdAt: '2026-03-13T10:00:00Z',
    updatedAt: '2026-03-13T10:00:00Z',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    nombre: 'Carlos López',
    cargo: 'Comercial',
    telefono: '3009876543',
    email: 'carlos@libre.com',
    clienteId: null,
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

describe('useContactos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns contact list on success', async () => {
    vi.mocked(contactoRepository.getAll).mockResolvedValue(mockContactos)

    const { result } = renderHook(() => useContactos(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(2)
    expect(result.current.data?.[0].nombre).toBe('Ana García')
  })

  it('returns empty array when no contacts', async () => {
    vi.mocked(contactoRepository.getAll).mockResolvedValue([])

    const { result } = renderHook(() => useContactos(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(0)
  })

  it('sets isError true on network failure', async () => {
    vi.mocked(contactoRepository.getAll).mockRejectedValue(
      new Error('Network error'),
    )

    const { result } = renderHook(() => useContactos(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
