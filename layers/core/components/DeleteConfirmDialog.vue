<script setup lang="ts">
import { computed } from 'vue';
import { Trash2, AlertTriangle } from 'lucide-vue-next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  open: boolean;
  title?: string;
  description?: string;
  itemName?: string;
  loading?: boolean;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
  showWarning?: boolean;
  warningText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Confirm Deletion',
  description: 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmText: 'Delete',
  cancelText: 'Cancel',
  variant: 'danger',
  loading: false,
  showWarning: true,
  warningText: 'This action cannot be undone.'
});

const emit = defineEmits<{
  'update:open': [value: boolean];
  'confirm': [];
  'cancel': [];
}>();

// Computed property for dynamic description
const finalDescription = computed(() => {
  if (props.itemName) {
    return `Are you sure you want to delete "${props.itemName}"? This action cannot be undone.`;
  }
  return props.description;
});

// Handle dialog close
function handleClose() {
  if (!props.loading) {
    emit('update:open', false);
    emit('cancel');
  }
}

// Handle confirm
function handleConfirm() {
  emit('confirm');
}
</script>

<template>
  <Dialog :open="open" @update:open="handleClose">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <div class="p-2 bg-destructive/10 rounded-lg">
            <Trash2 class="h-4 w-4 text-destructive" />
          </div>
          {{ title }}
        </DialogTitle>
        <DialogDescription class="pt-2">
          {{ finalDescription }}
        </DialogDescription>
      </DialogHeader>
      
      <Alert v-if="showWarning && warningText" class="mt-4 border-destructive/20 bg-destructive/5">
        <AlertTriangle class="h-4 w-4 text-destructive" />
        <AlertDescription class="text-destructive/90">
          {{ warningText }}
        </AlertDescription>
      </Alert>
      
      <DialogFooter class="flex-col sm:flex-row gap-2 mt-6">
        <Button 
          variant="outline" 
          @click="handleClose"
          :disabled="loading"
          class="w-full sm:w-auto"
        >
          {{ cancelText }}
        </Button>
        <Button 
          :variant="variant === 'danger' ? 'destructive' : 'default'"
          @click="handleConfirm"
          :disabled="loading"
          class="w-full sm:w-auto"
        >
          <Trash2 class="h-4 w-4 mr-2" v-if="!loading" />
          <div v-else class="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
          {{ loading ? 'Deleting...' : confirmText }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>