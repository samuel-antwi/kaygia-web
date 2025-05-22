<script setup lang="ts">
import { ArrowLeft, Settings } from "lucide-vue-next";

interface Props {
  title: string;
  type: string;
  status: string;
  projectId?: string;
  showManageButton?: boolean;
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
      <CardHeader>
        <div class="flex flex-row items-start justify-between space-y-0">
          <div class="space-y-2">
            <CardTitle class="text-2xl">{{ title }}</CardTitle>
            <div class="flex items-center space-x-4">
              <CardDescription>Project Type: {{ type }}</CardDescription>
              <Badge 
                :class="getStatusColor(status) + ' bg-opacity-10 border-opacity-20'" 
                variant="outline"
              >
                {{ status }}
              </Badge>
            </div>
          </div>
          <Button 
            v-if="showManageButton && projectId" 
            as-child 
            class="flex items-center"
          >
            <NuxtLink :to="`/admin/projects/${projectId}/manage`">
              <Settings class="h-4 w-4 mr-2" />
              Manage Project
            </NuxtLink>
          </Button>
        </div>
      </CardHeader>
    </Card>
  </div>
</template>