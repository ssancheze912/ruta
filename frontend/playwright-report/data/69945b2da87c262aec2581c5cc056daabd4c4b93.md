# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: clientes.spec.ts >> EPIC-SA-F2 — Clientes Create >> TC-F2-11 [P0] Crear cliente con NIT duplicado → 409 Conflict (FR8)
- Location: tests\e2e\clientes.spec.ts:293:3

# Error details

```
Error: API POST http://localhost:5000/api/v1/clientes failed: 409 {"type":"https://tools.ietf.org/html/rfc9110#section-15.5.10","title":"Conflict","status":409,"detail":"El NIT/RUC ya está registrado."}
```

# Test source

```ts
  1  | import type { APIRequestContext } from '@playwright/test'
  2  | 
  3  | const API_URL = process.env.API_URL ?? 'http://localhost:5000/api/v1'
  4  | 
  5  | type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'
  6  | 
  7  | type ApiRequestParams = {
  8  |   request: APIRequestContext
  9  |   method: HttpMethod
  10 |   path: string
  11 |   data?: unknown
  12 |   headers?: Record<string, string>
  13 | }
  14 | 
  15 | /**
  16 |  * Pure function wrapper around Playwright's APIRequestContext.
  17 |  * Always throws on non-2xx responses for fast failure.
  18 |  */
  19 | export async function apiRequest<T>({
  20 |   request,
  21 |   method,
  22 |   path,
  23 |   data,
  24 |   headers = {},
  25 | }: ApiRequestParams): Promise<T> {
  26 |   const url = `${API_URL}${path}`
  27 | 
  28 |   const response = await request.fetch(url, {
  29 |     method,
  30 |     data: data ? JSON.stringify(data) : undefined,
  31 |     headers: {
  32 |       'Content-Type': 'application/json',
  33 |       ...headers,
  34 |     },
  35 |   })
  36 | 
  37 |   if (!response.ok()) {
  38 |     const body = await response.text()
> 39 |     throw new Error(`API ${method} ${url} failed: ${response.status()} ${body}`)
     |           ^ Error: API POST http://localhost:5000/api/v1/clientes failed: 409 {"type":"https://tools.ietf.org/html/rfc9110#section-15.5.10","title":"Conflict","status":409,"detail":"El NIT/RUC ya está registrado."}
  40 |   }
  41 | 
  42 |   const text = await response.text()
  43 |   return text ? (JSON.parse(text) as T) : (undefined as T)
  44 | }
  45 | 
```