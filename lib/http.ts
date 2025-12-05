// HTTP client with error handling, retry logic, and observability

import { trackEvent } from "./events"

export class HTTPError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: unknown,
  ) {
    super(`HTTP ${status}: ${statusText}`)
    this.name = "HTTPError"
  }
}

interface RequestOptions extends RequestInit {
  retry?: number
  retryDelay?: number
  timeout?: number
}

export class HTTPClient {
  private baseUrl: string
  private defaultTimeout: number

  constructor(baseUrl = "", timeout = 30000) {
    this.baseUrl = baseUrl
    this.defaultTimeout = timeout
  }

  private async fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })
      clearTimeout(id)
      return response
    } catch (error) {
      clearTimeout(id)
      throw error
    }
  }

  private async fetchWithRetry(url: string, options: RequestOptions = {}, attempt = 0): Promise<Response> {
    const { retry = 3, retryDelay = 1000, timeout = this.defaultTimeout, ...fetchOptions } = options

    try {
      const response = await this.fetchWithTimeout(url, fetchOptions, timeout)

      if (!response.ok && attempt < retry && response.status >= 500) {
        // Retry on server errors
        await new Promise((resolve) => setTimeout(resolve, retryDelay * Math.pow(2, attempt)))
        return this.fetchWithRetry(url, options, attempt + 1)
      }

      return response
    } catch (error) {
      if (attempt < retry) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay * Math.pow(2, attempt)))
        return this.fetchWithRetry(url, options, attempt + 1)
      }
      throw error
    }
  }

  async request<T = unknown>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const startTime = Date.now()

    try {
      const response = await this.fetchWithRetry(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      })

      const duration = Date.now() - startTime
      const data = await response.json()

      // Track successful API call
      trackEvent("api_request", {
        endpoint,
        method: options.method || "GET",
        status: response.status,
        duration,
        success: response.ok,
      })

      if (!response.ok) {
        throw new HTTPError(response.status, response.statusText, data)
      }

      return data.data || data
    } catch (error) {
      const duration = Date.now() - startTime

      // Track failed API call
      trackEvent("api_error", {
        endpoint,
        method: options.method || "GET",
        duration,
        error: error instanceof Error ? error.message : "Unknown error",
      })

      throw error
    }
  }

  async get<T = unknown>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" })
  }

  async post<T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async put<T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async delete<T = unknown>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" })
  }
}

// Singleton instance
export const http = new HTTPClient()
