<script setup lang="ts">
import { FileText, Target, Users, Calendar, CircleDollarSign } from "lucide-vue-next";

interface Props {
  title: string;
  description?: string | null;
  type: string;
  targetAudience?: string | null;
  businessGoals?: string | null;
  budget?: number | null;
  preferredLaunchDate?: Date | string | null;
}

defineProps<Props>();

// Format currency
const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "To be determined";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);
};

// Format date
const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return "To be determined";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

// Format project type
const formatProjectType = (type: string): string => {
  switch (type) {
    case "WEBSITE":
      return "Business Website";
    case "E_COMMERCE":
      return "E-Commerce Store";
    case "WEB_APP":
      return "Web Application";
    case "LANDING_PAGE":
      return "Landing Page";
    default:
      return type;
  }
};
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-xl">{{ title }}</CardTitle>
      <CardDescription>{{ formatProjectType(type) }}</CardDescription>
    </CardHeader>
    <CardContent class="space-y-6">
      <!-- Project Description -->
      <div v-if="description" class="space-y-2">
        <h4 class="text-sm font-medium flex items-center">
          <FileText class="h-4 w-4 mr-2 text-muted-foreground" />
          Project Description
        </h4>
        <p class="text-sm text-muted-foreground leading-relaxed">
          {{ description }}
        </p>
      </div>

      <!-- Project Details Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Target Audience -->
        <div v-if="targetAudience" class="space-y-2">
          <h4 class="text-sm font-medium flex items-center">
            <Users class="h-4 w-4 mr-2 text-muted-foreground" />
            Target Audience
          </h4>
          <p class="text-sm text-muted-foreground">
            {{ targetAudience }}
          </p>
        </div>

        <!-- Business Goals -->
        <div v-if="businessGoals" class="space-y-2">
          <h4 class="text-sm font-medium flex items-center">
            <Target class="h-4 w-4 mr-2 text-muted-foreground" />
            Business Goals
          </h4>
          <p class="text-sm text-muted-foreground">
            {{ businessGoals }}
          </p>
        </div>

        <!-- Budget -->
        <div class="space-y-2">
          <h4 class="text-sm font-medium flex items-center">
            <CircleDollarSign class="h-4 w-4 mr-2 text-muted-foreground" />
            Project Budget
          </h4>
          <p class="text-sm text-muted-foreground">
            {{ formatCurrency(budget) }}
          </p>
        </div>

        <!-- Launch Date -->
        <div class="space-y-2">
          <h4 class="text-sm font-medium flex items-center">
            <Calendar class="h-4 w-4 mr-2 text-muted-foreground" />
            Target Launch Date
          </h4>
          <p class="text-sm text-muted-foreground">
            {{ formatDate(preferredLaunchDate) }}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
</template>