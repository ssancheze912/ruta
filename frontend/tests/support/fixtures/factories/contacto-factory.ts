import { faker } from '@faker-js/faker'
import type { APIRequestContext } from '@playwright/test'
import { apiRequest } from '../../helpers/api-request'

export interface Contacto {
  id: string
  nombre: string
  cargo: string
  telefono: string
  email: string
  clienteId: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateContactoDto {
  nombre: string
  cargo: string
  telefono: string
  email: string
}

/**
 * Factory for Contacto entities.
 * Tracks created IDs for auto-cleanup in afterEach/afterAll.
 */
export class ContactoFactory {
  private createdIds: string[] = []

  constructor(private readonly request: APIRequestContext) {}

  /**
   * Create a Contacto via API with sensible defaults.
   * Override any field by passing partial data.
   */
  async create(overrides: Partial<CreateContactoDto> = {}): Promise<Contacto> {
    const payload: CreateContactoDto = {
      nombre: faker.person.fullName(),
      cargo: faker.person.jobTitle(),
      telefono: faker.phone.number({ style: 'national' }),
      email: faker.internet.email(),
      ...overrides,
    }

    const contacto = await apiRequest<Contacto>({
      request: this.request,
      method: 'POST',
      path: '/contactos',
      data: payload,
    })

    this.createdIds.push(contacto.id)
    return contacto
  }

  /**
   * Assign a contacto to a cliente via the API.
   * Does NOT register the contacto for cleanup — caller is responsible.
   */
  async assignCliente(contactoId: string, clienteId: string | null): Promise<Contacto> {
    return apiRequest<Contacto>({
      request: this.request,
      method: 'PUT',
      path: `/contactos/${contactoId}/cliente`,
      data: { clienteId },
    })
  }

  /** Delete all contactos created by this factory instance. */
  async cleanup(): Promise<void> {
    for (const id of this.createdIds) {
      await apiRequest<void>({
        request: this.request,
        method: 'DELETE',
        path: `/contactos/${id}`,
      }).catch(() => {
        // Ignore 404 — already deleted by test
      })
    }
    this.createdIds = []
  }
}
