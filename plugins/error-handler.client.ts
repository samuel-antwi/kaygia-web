export default defineNuxtPlugin((nuxtApp) => {
  // Handle Vue errors
  nuxtApp.vueApp.config.errorHandler = (error: any, _instance: any, info: string) => {
    console.error('Vue error:', error, info)
    
    // Don't show error page for certain errors
    const ignoredErrors = [
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      'Non-Error promise rejection captured'
    ]
    
    const errorMessage = error?.message || String(error)
    if (ignoredErrors.some(ignored => errorMessage.includes(ignored))) {
      return
    }

    // Show toast for errors based on the context
    const errorToast = nuxtApp.$errorToast as ((message: string, title?: string) => void) | undefined
    const isDev = process.env.NODE_ENV === 'development'
    
    // Determine user-friendly message for production
    const getUserFriendlyMessage = (error: any, info: string) => {
      // Type errors (null reference, undefined, etc.)
      if (errorMessage.includes('Cannot read') || errorMessage.includes('Cannot access')) {
        return 'Something went wrong. Please refresh the page and try again.'
      }
      
      // Function not found errors
      if (errorMessage.includes('is not a function')) {
        return 'A feature is temporarily unavailable. Please try again later.'
      }
      
      // Network errors
      if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
        return 'Connection error. Please check your internet and try again.'
      }
      
      // Generic fallback
      return 'An unexpected error occurred. Please refresh the page.'
    }
    
    // For development, show actual error for debugging
    if (isDev && errorToast) {
      errorToast(errorMessage, 'Vue Error')
      console.error('Development Error Details:', { error, info })
      return
    }
    
    // In production, decide based on error type
    if (info?.includes('warn') || info?.includes('log')) {
      // Minor errors - just show toast
      if (errorToast) {
        errorToast('A minor issue occurred. Please refresh if needed.', 'Warning')
      }
      return
    }

    // For major errors in production, show error page
    if (!isDev) {
      // Log to console for debugging (would go to error tracking service)
      console.error('Production Error:', { error: errorMessage, info })
      
      throw createError({
        statusCode: 500,
        statusMessage: 'Application Error',
        data: {
          error: getUserFriendlyMessage(error, info),
          info
        }
      })
    } else {
      // In development, show toast instead of error page for better DX
      if (errorToast) {
        errorToast(errorMessage, 'Application Error')
      }
    }
  }

  // Handle unhandled promise rejections
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason)
      
      // Prevent default browser behavior
      event.preventDefault()
      
      // Handle specific error types
      if (event.reason?.response?.status === 401) {
        // Session expired - redirect to login
        const errorToast = nuxtApp.$errorToast as ((message: string, title?: string) => void) | undefined
        if (errorToast) {
          errorToast('Please log in again to continue.', 'Session Expired')
        }
        navigateTo('/auth/login')
        return
      }
      
      // Show toast for API errors
      if (event.reason?.data || event.reason?.response) {
        const message = event.reason?.data?.message || 'An error occurred. Please try again.'
        const errorToast = nuxtApp.$errorToast as ((message: string, title?: string) => void) | undefined
        if (errorToast) {
          errorToast(message, 'Error')
        }
        return
      }
      
      // Show toast for other promise rejections
      const errorToast = nuxtApp.$errorToast as ((message: string, title?: string) => void) | undefined
      if (errorToast) {
        const isDev = process.env.NODE_ENV === 'development'
        const rawMessage = event.reason?.message || String(event.reason) || 'An unhandled error occurred'
        
        // In development, show actual error
        if (isDev) {
          errorToast(rawMessage, 'Promise Rejection')
        } else {
          // In production, show user-friendly message
          errorToast('Something went wrong. Please try again.', 'Error')
          console.error('Unhandled Promise Rejection:', event.reason)
        }
      }
    })
  }
})