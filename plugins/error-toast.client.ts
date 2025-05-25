// This plugin provides global error toasting capabilities
export default defineNuxtPlugin(() => {
  // Provide a global error toast function
  return {
    provide: {
      errorToast: (message: string, title: string = 'Error') => {
        // This will be called from components where useToast is available
        if (typeof window !== 'undefined') {
          // Emit a custom event that components can listen to
          window.dispatchEvent(new CustomEvent('app:error:toast', {
            detail: { title, message }
          }))
        }
      }
    }
  }
})