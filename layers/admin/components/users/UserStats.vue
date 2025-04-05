<script setup lang="ts">
import { computed } from "vue";
import { TicketIcon, LayoutList } from "lucide-vue-next";
import { useFormatting } from "../../composables/useFormatting";

interface UserStatsProps {
  stats: {
    totalTickets: number;
    totalProjects: number;
    ticketsByStatus: Record<string, number>;
    projectsByStatus: Record<string, number>;
  };
}

// Define props
const props = defineProps<UserStatsProps>();

// Use the formatting composable
const { getTicketStatusColor, getProjectStatusColor } = useFormatting();

// Computed property to get project status entries with values > 0
const projectStatusEntries = computed(() => {
  if (!props.stats?.projectsByStatus) return [];

  return Object.entries(props.stats.projectsByStatus)
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({ status, count }));
});
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Overview</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Tickets Card -->
        <Card>
          <CardHeader class="pb-2">
            <div class="flex items-center justify-between">
              <CardTitle class="text-sm font-medium">Total Tickets</CardTitle>
              <TicketIcon class="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">
              {{ props.stats.totalTickets }}
            </div>
            <div class="text-xs text-muted-foreground mt-1">
              Tickets by status
            </div>
            <div class="flex flex-wrap gap-2 mt-2">
              <div
                v-for="(count, status) in props.stats.ticketsByStatus"
                :key="status"
                class="text-xs flex items-center gap-1"
                :class="getTicketStatusColor(status)"
              >
                <span>{{ status }}:</span>
                <span class="font-semibold">{{ count }}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Projects Card -->
        <Card>
          <CardHeader class="pb-2">
            <div class="flex items-center justify-between">
              <CardTitle class="text-sm font-medium">Total Projects</CardTitle>
              <LayoutList class="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">
              {{ props.stats.totalProjects }}
            </div>
            <div class="text-xs text-muted-foreground mt-1">
              Projects by status
            </div>
            <div class="flex flex-wrap gap-2 mt-2">
              <div
                v-for="item in projectStatusEntries"
                :key="item.status"
                class="text-xs flex items-center gap-1"
                :class="getProjectStatusColor(item.status)"
              >
                <span>{{ item.status }}:</span>
                <span class="font-semibold">{{ item.count }}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </CardContent>
  </Card>
</template>
