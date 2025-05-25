declare module '#app' {
  interface NuxtApp {
    $errorToast: (message: string, title?: string) => void
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $errorToast: (message: string, title?: string) => void
  }
}

export {}