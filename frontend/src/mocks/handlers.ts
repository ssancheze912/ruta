import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('http://localhost:5000/api/v1/clientes', () => {
    return HttpResponse.json([])
  }),
  http.get('http://localhost:5000/api/v1/contactos', () => {
    return HttpResponse.json([])
  }),
]
