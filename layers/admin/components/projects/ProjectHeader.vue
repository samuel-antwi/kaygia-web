<script setup lang="ts">
import { ArrowLeft } from "lucide-vue-next";

interface Props {
  title: string;
  type: string;
  status: string;
}

defineProps<Props>();

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
</script>

<template>
  <div>
    <!-- Back Button -->
    <NuxtLink
      to="/admin/projects"
      class="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
    >
      <ArrowLeft class="w-4 h-4 mr-1" />
      Back to Projects
    </NuxtLink>

    <!-- Project Header -->
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle class="text-xl">{{ title }}</CardTitle>
          <CardDescription>Project Type: {{ type }}</CardDescription>
        </div>
        <div :class="getStatusColor(status)" class="font-semibold">
          {{ status }}
        </div>
      </CardHeader>
    </Card>
  </div>
</template>