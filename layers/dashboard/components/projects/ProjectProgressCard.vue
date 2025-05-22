<script setup lang="ts">
import { Calendar, Clock, CheckCircle, AlertCircle } from "lucide-vue-next";

interface Props {
  status: string;
  createdAt: Date | string;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  timelinePreference?: string | null;
}

defineProps<Props>();

// Calculate progress percentage based on status
const getProgressPercentage = (status: string): number => {
  switch (status) {
    case "PENDING":
      return 0;
    case "APPROVED":
      return 20;
    case "IN_PROGRESS":
      return 60;
    case "REVIEW":
      return 85;
    case "COMPLETED":
      return 100;
    case "CANCELLED":
      return 0;
    default:
      return 0;
  }
};

// Get current phase description
const getCurrentPhase = (status: string): string => {
  switch (status) {
    case "PENDING":
      return "Awaiting Approval";
    case "APPROVED":
      return "Project Planning";
    case "IN_PROGRESS":
      return "Development";
    case "REVIEW":
      return "Final Review";
    case "COMPLETED":
      return "Project Complete";
    case "CANCELLED":
      return "Project Cancelled";
    default:
      return "Unknown Phase";
  }
};

// Get status color
const getStatusColor = (status: string): string => {
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

// Format date
const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return "TBD";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Calculate estimated completion (rough estimate)
const getEstimatedCompletion = (createdAt: Date | string, timelinePreference?: string | null): string => {
  const created = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
  const weeksToAdd = timelinePreference === "rush" ? 4 : 
                    timelinePreference === "standard" ? 10 : 
                    timelinePreference === "flexible" ? 16 : 10;
  
  const estimated = new Date(created);
  estimated.setDate(estimated.getDate() + (weeksToAdd * 7));
  
  return formatDate(estimated);
};
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center justify-between">
        <span>Project Progress</span>
        <Badge :class="getStatusColor(status)" variant="outline">
          {{ getCurrentPhase(status) }}
        </Badge>
      </CardTitle>
    </CardHeader>
    <CardContent class="space-y-6">
      <!-- Progress Bar -->
      <div class="space-y-2">
        <div class="flex justify-between text-sm">
          <span>Progress</span>
          <span class="font-medium">{{ getProgressPercentage(status) }}%</span>
        </div>
        <div class="w-full bg-muted rounded-full h-3">
          <div 
            class="h-3 rounded-full transition-all duration-500"
            :class="status === 'COMPLETED' ? 'bg-green-500' : status === 'CANCELLED' ? 'bg-red-500' : 'bg-primary'"
            :style="{ width: `${getProgressPercentage(status)}%` }"
          ></div>
        </div>
      </div>

      <!-- Timeline Information -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-1">
          <h4 class="text-sm font-medium flex items-center">
            <Calendar class="h-4 w-4 mr-2 text-muted-foreground" />
            Project Started
          </h4>
          <p class="text-sm text-muted-foreground">
            {{ formatDate(startDate || createdAt) }}
          </p>
        </div>

        <div class="space-y-1">
          <h4 class="text-sm font-medium flex items-center">
            <Clock class="h-4 w-4 mr-2 text-muted-foreground" />
            Estimated Completion
          </h4>
          <p class="text-sm text-muted-foreground">
            {{ endDate ? formatDate(endDate) : getEstimatedCompletion(createdAt, timelinePreference) }}
          </p>
        </div>
      </div>

      <!-- Project Phases -->
      <div class="space-y-3">
        <h4 class="text-sm font-medium">Project Phases</h4>
        <div class="space-y-2">
          <div class="flex items-center space-x-3">
            <CheckCircle :class="getProgressPercentage(status) >= 20 ? 'text-green-500' : 'text-muted-foreground'" class="h-4 w-4" />
            <span class="text-sm" :class="getProgressPercentage(status) >= 20 ? 'text-foreground' : 'text-muted-foreground'">
              Project Planning & Discovery
            </span>
          </div>
          <div class="flex items-center space-x-3">
            <CheckCircle :class="getProgressPercentage(status) >= 40 ? 'text-green-500' : 'text-muted-foreground'" class="h-4 w-4" />
            <span class="text-sm" :class="getProgressPercentage(status) >= 40 ? 'text-foreground' : 'text-muted-foreground'">
              Design & Wireframing
            </span>
          </div>
          <div class="flex items-center space-x-3">
            <CheckCircle :class="getProgressPercentage(status) >= 60 ? 'text-green-500' : 'text-muted-foreground'" class="h-4 w-4" />
            <span class="text-sm" :class="getProgressPercentage(status) >= 60 ? 'text-foreground' : 'text-muted-foreground'">
              Development & Build
            </span>
          </div>
          <div class="flex items-center space-x-3">
            <CheckCircle :class="getProgressPercentage(status) >= 85 ? 'text-green-500' : 'text-muted-foreground'" class="h-4 w-4" />
            <span class="text-sm" :class="getProgressPercentage(status) >= 85 ? 'text-foreground' : 'text-muted-foreground'">
              Testing & Review
            </span>
          </div>
          <div class="flex items-center space-x-3">
            <CheckCircle :class="getProgressPercentage(status) >= 100 ? 'text-green-500' : 'text-muted-foreground'" class="h-4 w-4" />
            <span class="text-sm" :class="getProgressPercentage(status) >= 100 ? 'text-foreground' : 'text-muted-foreground'">
              Launch & Deployment
            </span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>