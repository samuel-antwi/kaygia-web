<script setup lang="ts">
import { computed } from 'vue'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface Props {
  progress: number
  showPercentage?: boolean
  label?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'custom'
  customColor?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  progress: 0,
  showPercentage: false,
  size: 'md',
  variant: 'default',
})

// Ensure progress is between 0 and 100
const normalizedProgress = computed(() => {
  return Math.max(0, Math.min(100, props.progress))
})

// Size classes
const sizeClasses = computed(() => {
  const sizes = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }
  return sizes[props.size]
})

// Variant classes for different colors
const variantClasses = computed(() => {
  if (props.customColor) return props.customColor
  
  const variants = {
    default: 'bg-primary/20',
    success: 'bg-green-500/20',
    warning: 'bg-yellow-500/20',
    danger: 'bg-red-500/20',
    custom: 'bg-primary/20'
  }
  
  // Auto-select variant based on progress if using default
  if (props.variant === 'default') {
    if (normalizedProgress.value === 100) return 'bg-green-500/20'
    if (normalizedProgress.value < 30) return 'bg-red-500/20'
    if (normalizedProgress.value < 60) return 'bg-yellow-500/20'
  }
  
  return variants[props.variant]
})

// Create a custom Progress component that accepts our color customizations
const progressClass = computed(() => {
  return cn(
    'relative w-full overflow-hidden rounded-full',
    sizeClasses.value,
    variantClasses.value,
    props.class
  )
})
</script>

<template>
  <div class="w-full space-y-1">
    <div v-if="label || showPercentage" class="flex justify-between items-center text-sm">
      <span v-if="label" class="text-muted-foreground">{{ label }}</span>
      <span v-if="showPercentage" class="font-medium">{{ normalizedProgress }}%</span>
    </div>
    
    <Progress 
      :model-value="normalizedProgress"
      :class="progressClass"
    />
  </div>
</template>