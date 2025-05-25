<template>
  <!-- This component listens for global error events and shows toasts -->
  <div />
</template>

<script setup lang="ts">
import { useToast } from '@/components/ui/toast/use-toast'

const { toast } = useToast()

// Listen for error toast events
onMounted(() => {
  const handleErrorToast = (event: CustomEvent) => {
    const { title, message } = event.detail
    toast({
      title,
      description: message,
      variant: 'destructive'
    })
  }

  window.addEventListener('app:error:toast', handleErrorToast as any)

  // Cleanup
  onUnmounted(() => {
    window.removeEventListener('app:error:toast', handleErrorToast as any)
  })
})
</script>