<script setup lang="ts">
import { Clock, Calendar, Settings } from "lucide-vue-next";

interface Props {
  timelinePreference?: string | null;
  preferredLaunchDate?: Date | string | null;
  maintenanceRequired?: boolean | null;
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

// Format timeline preference
const formatTimelinePreference = (preference: string | null | undefined): string => {
  if (!preference) return "N/A";
  switch (preference) {
    case "rush":
      return "Rush Job (2-4 weeks)";
    case "standard":
      return "Standard (6-12 weeks)";
    case "flexible":
      return "Flexible (3-6 months)";
    default:
      return preference;
  }
};

// Format boolean values
const formatBoolean = (value: boolean | null | undefined): string => {
  if (value === null || value === undefined) return "N/A";
  return value ? "Yes" : "No";
};
</script>

<template>
  <div v-if="timelinePreference || preferredLaunchDate || maintenanceRequired !== null">
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center text-lg">
          <Clock class="h-5 w-5 mr-2 text-primary" />
          Timeline & Scope
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-if="timelinePreference" class="space-y-1">
            <h4 class="text-sm font-medium flex items-center">
              <Clock class="h-4 w-4 mr-2 text-muted-foreground" />
              Timeline Preference
            </h4>
            <p class="text-sm text-muted-foreground">
              {{ formatTimelinePreference(timelinePreference) }}
            </p>
          </div>

          <div v-if="preferredLaunchDate" class="space-y-1">
            <h4 class="text-sm font-medium flex items-center">
              <Calendar class="h-4 w-4 mr-2 text-muted-foreground" />
              Preferred Launch Date
            </h4>
            <p class="text-sm text-muted-foreground">
              {{ formatDate(preferredLaunchDate) }}
            </p>
          </div>

          <div v-if="maintenanceRequired !== null" class="space-y-1">
            <h4 class="text-sm font-medium flex items-center">
              <Settings class="h-4 w-4 mr-2 text-muted-foreground" />
              Maintenance Required
            </h4>
            <p class="text-sm text-muted-foreground">
              {{ formatBoolean(maintenanceRequired) }}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>