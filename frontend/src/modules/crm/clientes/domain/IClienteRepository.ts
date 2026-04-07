import type { Cliente } from './Cliente'

export interface CreateClienteDto {
  nombre: string
  nit: string
  telefono: string
  ciudad: string
}

export interface UpdateClienteDto {
  nombre: string
  nit: string
  telefono: string
  ciudad: string
}

export interface DeleteClienteResult {
  contactosDesasociados: number
}

export interface IClienteRepository {
  getAll(): Promise<Cliente[]>
  getById(id: string): Promise<Cliente>
  create(data: CreateClienteDto): Promise<Cliente>
  update(id: string, data: UpdateClienteDto): Promise<Cliente>
  delete(id: string): Promise<DeleteClienteResult>
}
