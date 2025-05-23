<script setup lang="ts">
import { Trash2, AlertTriangle } from "lucide-vue-next";

interface Props {
  open: boolean;
  title?: string;
  description?: string;
  itemName?: string;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: "Are you sure?",
  description: "This action cannot be undone.",
  loading: false
});

const emit = defineEmits<{
  'update:open': [value: boolean];
  'confirm': [];
}>();

const handleConfirm = () => {
  emit('confirm');
};

const handleOpenChange = (value: boolean) => {
  if (!props.loading) {
    emit('update:open', value);
  }
};
</script>

<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent>
      <DialogHeader>
        <div class="flex items-center gap-2">
          <div class="p-2 bg-red-100 rounded-lg">
            <AlertTriangle class="h-5 w-5 text-red-600" />
          </div>
          <DialogTitle>{{ title }}</DialogTitle>
        </div>
        <DialogDescription class="pt-2">
          <span v-if="itemName" class="block mb-2">
            You are about to delete <strong class="font-semibold">{{ itemName }}</strong>.
          </span>
          {{ description }}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button 
          variant="outline" 
          @click="handleOpenChange(false)"
          :disabled="loading"
        >
          Cancel
        </Button>
        <Button 
          variant="destructive"
          @click="handleConfirm"
          :disabled="loading"
        >
          <Trash2 v-if="!loading" class="h-4 w-4 mr-2" />
          <span v-if="loading">Deleting...</span>
          <span v-else>Delete</span>
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>