<script setup lang="ts">
import {
  FileText,
  ClipboardList,
  Calendar,
  Clock,
  CheckCircle2,
  CircleDollarSign,
  FolderKanban,
} from "lucide-vue-next";

interface Props {
  description?: string | null;
  requirements?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  budget?: number | null;
  type: string;
}

defineProps<Props>();

// Function to format date
const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return "N/A";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Format currency
const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "N/A";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);
};
</script>

<template>
  <Card>
    <CardContent class="pt-6 space-y-4">
      <div v-if="description" class="space-y-1">
        <h4 class="text-sm font-medium flex items-center">
          <FileText class="h-4 w-4 mr-2 text-muted-foreground" />
          Description
        </h4>
        <p class="text-sm text-muted-foreground">
          {{ description }}
        </p>
      </div>

      <div v-if="requirements" class="space-y-1">
        <h4 class="text-sm font-medium flex items-center">
          <ClipboardList class="h-4 w-4 mr-2 text-muted-foreground" />
          Requirements
        </h4>
        <p class="text-sm text-muted-foreground whitespace-pre-line">
          {{ requirements }}
        </p>
      </div>

      <Separator />

      <!-- Project Details Section -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-1">
          <h4 class="text-sm font-medium flex items-center">
            <Calendar class="h-4 w-4 mr-2 text-muted-foreground" />
            Created
          </h4>
          <p class="text-sm text-muted-foreground">
            {{ formatDate(createdAt) }}
          </p>
        </div>

        <div class="space-y-1">
          <h4 class="text-sm font-medium flex items-center">
            <Clock class="h-4 w-4 mr-2 text-muted-foreground" />
            Last Updated
          </h4>
          <p class="text-sm text-muted-foreground">
            {{ formatDate(updatedAt) }}
          </p>
        </div>

        <div class="space-y-1">
          <h4 class="text-sm font-medium flex items-center">
            <Calendar class="h-4 w-4 mr-2 text-muted-foreground" />
            Start Date
          </h4>
          <p class="text-sm text-muted-foreground">
            {{ formatDate(startDate) }}
          </p>
        </div>

        <div class="space-y-1">
          <h4 class="text-sm font-medium flex items-center">
            <CheckCircle2 class="h-4 w-4 mr-2 text-muted-foreground" />
            End Date
          </h4>
          <p class="text-sm text-muted-foreground">
            {{ formatDate(endDate) }}
          </p>
        </div>

        <div class="space-y-1">
          <h4 class="text-sm font-medium flex items-center">
            <CircleDollarSign class="h-4 w-4 mr-2 text-muted-foreground" />
            Budget
          </h4>
          <p class="text-sm text-muted-foreground">
            {{ formatCurrency(budget) }}
          </p>
        </div>

        <div class="space-y-1">
          <h4 class="text-sm font-medium flex items-center">
            <FolderKanban class="h-4 w-4 mr-2 text-muted-foreground" />
            Project Type
          </h4>
          <p class="text-sm text-muted-foreground">{{ type }}</p>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
