import { useToast } from '@/components/ui/toast/use-toast'

export const useErrorHandler = () => {
  const { toast } = useToast()
  const router = useRouter()

  // Handle API errors with appropriate user feedback
  const handleError = (error: any, options?: {
    showToast?: boolean
    fallbackMessage?: string
    redirect?: string
  }) => {
    const {
      showToast = true,
      fallbackMessage = 'An unexpected error occurred',
      redirect
    } = options || {}

    console.error('Error:', error)

    // Get error details
    const statusCode = error?.response?.status || error?.statusCode || 500
    const message = error?.data?.message || error?.response?.data?.message || error?.message || fallbackMessage

    // Handle specific status codes
    switch (statusCode) {
      case 401:
        // Unauthorized - redirect to login
        if (showToast) {
          toast({
            title: 'Session Expired',
            description: 'Please log in again to continue.',
            variant: 'destructive'
          })
        }
        router.push('/auth/login')
        break

      case 403:
        // Forbidden
        if (showToast) {
          toast({
            title: 'Access Denied',
            description: message || 'You do not have permission to perform this action.',
            variant: 'destructive'
          })
        }
        if (redirect) router.push(redirect)
        break

      case 404:
        // Not found
        if (showToast) {
          toast({
            title: 'Not Found',
            description: message || 'The requested resource was not found.',
            variant: 'destructive'
          })
        }
        if (redirect) router.push(redirect)
        break

      case 409:
        // Conflict (e.g., duplicate entry)
        if (showToast) {
          toast({
            title: 'Conflict',
            description: message || 'This record already exists.',
            variant: 'destructive'
          })
        }
        break

      case 422:
        // Validation error
        if (showToast) {
          toast({
            title: 'Validation Error',
            description: message || 'Please check your input and try again.',
            variant: 'destructive'
          })
        }
        break

      case 429:
        // Too many requests
        if (showToast) {
          toast({
            title: 'Too Many Requests',
            description: 'Please slow down and try again later.',
            variant: 'destructive'
          })
        }
        break

      case 500:
      case 502:
      case 503:
        // Server errors
        if (showToast) {
          toast({
            title: 'Server Error',
            description: 'Something went wrong on our end. Please try again later.',
            variant: 'destructive'
          })
        }
        break

      default:
        // Generic error
        if (showToast) {
          toast({
            title: 'Error',
            description: message,
            variant: 'destructive'
          })
        }
    }

    return {
      statusCode,
      message,
      handled: true
    }
  }

  // Wrap async functions with error handling
  const withErrorHandling = async <T>(
    fn: () => Promise<T>,
    options?: Parameters<typeof handleError>[1]
  ): Promise<T | null> => {
    try {
      return await fn()
    } catch (error) {
      handleError(error, options)
      return null
    }
  }

  // Create a safe fetch wrapper
  const safeFetch = async <T = any>(
    url: string,
    options?: any
  ): Promise<{ data: T | null; error: any | null }> => {
    try {
      const data = await $fetch<T>(url, options)
      return { data: data as T, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  return {
    handleError,
    withErrorHandling,
    safeFetch
  }
}