import { faker } from '@faker-js/faker'
import type { APIRequestContext } from '@playwright/test'
import { apiRequest } from '../../helpers/api-request'

export interface Cliente {
  id: string
  nombre: string
  nit: string
  telefono: string | null
  ciudad: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateClienteDto {
  nombre: string
  nit: string
  telefono?: string
  ciudad?: string
}

/**
 * Factory for Cliente entities.
 * Tracks created IDs for auto-cleanup in afterEach/afterAll.
 */
export class ClienteFactory {
  private createdIds: string[] = []

  constructor(private readonly request: APIRequestContext) {}

  /**
   * Create a Cliente via API with sensible defaults.
   * Override any field by passing partial data.
   */
  async create(overrides: Partial<CreateClienteDto> = {}): Promise<Cliente> {
    const payload: CreateClienteDto = {
      nombre: faker.company.name(),
      nit: faker.string.numeric(9),
      telefono: faker.phone.number({ style: 'national' }),
      ciudad: faker.location.city(),
      ...overrides,
    }

    const cliente = await apiRequest<Cliente>({
      request: this.request,
      method: 'POST',
      path: '/clientes',
      data: payload,
    })

    this.createdIds.push(cliente.id)
    return cliente
  }

  /** Delete all clients created by this factory instance. */
  async cleanup(): Promise<void> {
    for (const id of this.createdIds) {
      await apiRequest<void>({
        request: this.request,
        method: 'DELETE',
        path: `/clientes/${id}`,
      }).catch(() => {
        // Ignore 404 — already deleted by test
      })
    }
    this.createdIds = []
  }
}
