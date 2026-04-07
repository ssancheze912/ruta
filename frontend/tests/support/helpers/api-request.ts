import type { APIRequestContext } from '@playwright/test'

const API_URL = process.env.API_URL ?? 'http://localhost:5000/api/v1'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

type ApiRequestParams = {
  request: APIRequestContext
  method: HttpMethod
  path: string
  data?: unknown
  headers?: Record<string, string>
}

/**
 * Pure function wrapper around Playwright's APIRequestContext.
 * Always throws on non-2xx responses for fast failure.
 */
export async function apiRequest<T>({
  request,
  method,
  path,
  data,
  headers = {},
}: ApiRequestParams): Promise<T> {
  const url = `${API_URL}${path}`

  const response = await request.fetch(url, {
    method,
    data: data ? JSON.stringify(data) : undefined,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  })

  if (!response.ok()) {
    const body = await response.text()
    throw new Error(`API ${method} ${url} failed: ${response.status()} ${body}`)
  }

  const text = await response.text()
  return text ? (JSON.parse(text) as T) : (undefined as T)
}
