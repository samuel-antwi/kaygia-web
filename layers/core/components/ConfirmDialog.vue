<script setup lang="ts">
import { computed } from 'vue';
import { Trash2, AlertTriangle, RefreshCw } from 'lucide-vue-next';
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
  showIcon?: boolean;
  loadingText?: string;
  iconType?: 'delete' | 'restore' | 'none';
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Confirm Deletion',
  description: 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmText: 'Delete',
  cancelText: 'Cancel',
  variant: 'danger',
  loading: false,
  showWarning: true,
  warningText: 'This action cannot be undone.',
  showIcon: true,
  loadingText: 'Processing...',
  iconType: 'delete'
});

const emit = defineEmits<{
  'update:open': [value: boolean];
  'confirm': [];
  'cancel': [];
}>();

// Computed property for dynamic description
const finalDescription = computed(() => {
  // Only auto-generate delete description if no description is provided and itemName exists
  if (!props.description && props.itemName && props.iconType === 'delete') {
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
          <div 
            v-if="showIcon && iconType !== 'none'" 
            :class="[
              'p-2 rounded-lg',
              iconType === 'delete' ? 'bg-destructive/10' : 'bg-primary/10'
            ]"
          >
            <Trash2 
              v-if="iconType === 'delete'" 
              :class="[
                'h-4 w-4',
                iconType === 'delete' ? 'text-destructive' : 'text-primary'
              ]" 
            />
            <RefreshCw 
              v-else-if="iconType === 'restore'" 
              class="h-4 w-4 text-primary" 
            />
          </div>
          {{ title }}
        </DialogTitle>
        <DialogDescription class="pt-2">
          {{ finalDescription }}
        </DialogDescription>
      </DialogHeader>
      
      <Alert 
        v-if="showWarning && warningText" 
        :class="[
          'mt-4',
          variant === 'danger' ? 'border-destructive/20 bg-destructive/5' : 'border-primary/20 bg-primary/5'
        ]"
      >
        <AlertTriangle 
          :class="[
            'h-4 w-4',
            variant === 'danger' ? 'text-destructive' : 'text-primary'
          ]" 
        />
        <AlertDescription 
          :class="variant === 'danger' ? 'text-destructive/90' : 'text-primary/90'"
        >
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
          <template v-if="!loading && showIcon && iconType !== 'none'">
            <Trash2 v-if="iconType === 'delete'" class="h-4 w-4 mr-2" />
            <RefreshCw v-else-if="iconType === 'restore'" class="h-4 w-4 mr-2" />
          </template>
          <div v-if="loading" class="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
          {{ loading ? loadingText : confirmText }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>