<script setup lang="ts">
import { Badge } from "@/components/ui/badge";
import { useFormatting } from "../../composables/useFormatting";

interface RecentItemsProps {
  title: string;
  items: any[];
  itemType: "tickets" | "projects";
  viewAllLink: string;
}

// Define props
const props = defineProps<RecentItemsProps>();

// Use the formatting composable
const { formatDate, getTicketStatusColor, getProjectStatusColor } =
  useFormatting();
</script>

<template>
  <Card v-if="props.items && props.items.length > 0">
    <CardHeader>
      <CardTitle>{{ props.title }}</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{{
              props.itemType === "tickets" ? "Subject" : "Title"
            }}</TableHead>
            <TableHead v-if="props.itemType === 'projects'">Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="item in props.items" :key="item.id">
            <TableCell class="font-medium">{{
              props.itemType === "tickets" ? item.subject : item.title
            }}</TableCell>
            <TableCell v-if="props.itemType === 'projects'">{{
              item.type
            }}</TableCell>
            <TableCell>
              <Badge
                variant="outline"
                :class="
                  props.itemType === 'tickets'
                    ? getTicketStatusColor(item.status)
                    : getProjectStatusColor(item.status)
                "
              >
                {{ item.status }}
              </Badge>
            </TableCell>
            <TableCell>{{ formatDate(item.createdAt) }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <div class="mt-4 flex justify-center">
        <NuxtLink :to="props.viewAllLink">
          <Button variant="outline" size="sm">
            View All {{ props.itemType === "tickets" ? "Tickets" : "Projects" }}
          </Button>
        </NuxtLink>
      </div>
    </CardContent>
  </Card>
</template>
