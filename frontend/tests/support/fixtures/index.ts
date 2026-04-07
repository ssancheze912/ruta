import { test as base } from '@playwright/test'
import { ClienteFactory } from './factories/cliente-factory'
import { ContactoFactory } from './factories/contacto-factory'

type TestFixtures = {
  clienteFactory: ClienteFactory
  contactoFactory: ContactoFactory
}

/**
 * Extended test object with CRM domain fixtures.
 *
 * Usage:
 *   import { test, expect } from '../support/fixtures'
 *
 * Each factory automatically cleans up after itself when the fixture tears down.
 */
export const test = base.extend<TestFixtures>({
  clienteFactory: async ({ request }, use) => {
    const factory = new ClienteFactory(request)
    await use(factory)
    await factory.cleanup()
  },

  contactoFactory: async ({ request }, use) => {
    const factory = new ContactoFactory(request)
    await use(factory)
    await factory.cleanup()
  },
})

export { expect } from '@playwright/test'
