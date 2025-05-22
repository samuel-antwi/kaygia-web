<script setup lang="ts">
import { AlertTriangle, Loader2 } from "lucide-vue-next";

interface Props {
  currentStatus: string;
  isUpdating: boolean;
}

interface Emits {
  (e: 'update-status', status: string): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

// List of valid project statuses
const projectStatuses = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "REVIEW", label: "Under Review" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

// Get status color for labels
const getStatusColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return "text-amber-600";
    case "APPROVED":
      return "text-blue-600";
    case "IN_PROGRESS":
      return "text-purple-600";
    case "REVIEW":
      return "text-cyan-600";
    case "COMPLETED":
      return "text-green-600";
    case "CANCELLED":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};

const handleStatusUpdate = (newStatus: any) => {
  if (newStatus && typeof newStatus === 'string') {
    emit('update-status', newStatus);
  }
};
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Status Management</CardTitle>
    </CardHeader>
    <CardContent class="space-y-4">
      <p class="text-sm text-muted-foreground">
        Current Status:
        <span class="font-medium" :class="getStatusColor(currentStatus)">
          {{ currentStatus }}
        </span>
      </p>

      <div class="relative">
        <Select
          :model-value="currentStatus"
          @update:model-value="handleStatusUpdate"
          :disabled="isUpdating"
        >
          <SelectTrigger class="w-full">
            <SelectValue placeholder="Select new status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="status in projectStatuses"
              :key="status.value"
              :value="status.value"
            >
              {{ status.label }}
            </SelectItem>
          </SelectContent>
        </Select>

        <!-- Loading spinner overlay -->
        <div
          v-if="isUpdating"
          class="absolute inset-0 flex items-center justify-center bg-background/50 rounded"
        >
          <Loader2 class="h-4 w-4 animate-spin" />
        </div>
      </div>

      <Alert variant="destructive" class="mt-3">
        <AlertTriangle class="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          Changing the project status may trigger notifications to the client.
        </AlertDescription>
      </Alert>
    </CardContent>
  </Card>
</template>