'use client'

import { useToast } from '@/hooks/use-toast'
import type { ApiResponse } from '@/lib/api-response'

interface UseApiOptions {
  showSuccess?: boolean
  showError?: boolean
  successMessage?: string
  errorMessage?: string
}

const DEFAULT_OPTIONS: UseApiOptions = {
  showSuccess: true,
  showError: true,
  successMessage: 'Operation completed successfully',
  errorMessage: 'An error occurred. Please try again.',
}

/**
 * Hook for making API calls with automatic toast notifications
 */
export function useApi() {
  const { toast } = useToast()

  const apiCall = async <T = any>(
    url: string,
    options?: RequestInit,
    toastOptions?: UseApiOptions
  ): Promise<ApiResponse<T> | null> => {
    const finalOptions = { ...DEFAULT_OPTIONS, ...toastOptions }

    try {
      const response = await fetch(url, options)
      const data: ApiResponse<T> = await response.json()

      if (response.ok && data.success !== false) {
        // Success response
        if (finalOptions.showSuccess && data.message) {
          toast({
            variant: 'default',
            title: 'Success',
            description: data.message || finalOptions.successMessage,
          })
        }
        return data
      } else {
        // Error response
        const errorMessage =
          (data as any).error || finalOptions.errorMessage
        if (finalOptions.showError) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: errorMessage,
          })
        }
        return data as ApiResponseError
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : finalOptions.errorMessage

      if (finalOptions.showError) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: errorMessage,
        })
      }

      return {
        success: false,
        error: errorMessage,
      } as any
    }
  }

  const get = async <T = any>(
    url: string,
    toastOptions?: UseApiOptions
  ): Promise<ApiResponse<T> | null> => {
    return apiCall<T>(url, { method: 'GET' }, toastOptions)
  }

  const post = async <T = any>(
    url: string,
    body?: any,
    toastOptions?: UseApiOptions
  ): Promise<ApiResponse<T> | null> => {
    return apiCall<T>(
      url,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
      toastOptions
    )
  }

  const put = async <T = any>(
    url: string,
    body?: any,
    toastOptions?: UseApiOptions
  ): Promise<ApiResponse<T> | null> => {
    return apiCall<T>(
      url,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
      toastOptions
    )
  }

  const patch = async <T = any>(
    url: string,
    body?: any,
    toastOptions?: UseApiOptions
  ): Promise<ApiResponse<T> | null> => {
    return apiCall<T>(
      url,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
      toastOptions
    )
  }

  const del = async <T = any>(
    url: string,
    toastOptions?: UseApiOptions
  ): Promise<ApiResponse<T> | null> => {
    return apiCall<T>(url, { method: 'DELETE' }, toastOptions)
  }

  return {
    apiCall,
    get,
    post,
    put,
    patch,
    delete: del,
  }
}

// Type for error responses
export interface ApiResponseError {
  success: false
  error: string
  code?: string
  details?: any
}
