<script setup lang="ts">
import { User2, Mail, Building } from "lucide-vue-next";

interface Client {
  id: string;
  name: string | null;
  email: string;
  company: string | null;
}

interface Props {
  client: Client;
}

defineProps<Props>();
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Client Information</CardTitle>
    </CardHeader>
    <CardContent class="space-y-4">
      <div class="flex items-center">
        <User2 class="h-4 w-4 mr-2 text-muted-foreground" />
        <span>{{ client?.name || "Unknown Client" }}</span>
      </div>
      <div class="flex items-center">
        <Mail class="h-4 w-4 mr-2 text-muted-foreground" />
        <span>{{ client?.email }}</span>
      </div>
      <div v-if="client?.company" class="flex items-center">
        <Building class="h-4 w-4 mr-2 text-muted-foreground" />
        <span>{{ client?.company }}</span>
      </div>

      <div class="mt-2">
        <NuxtLink :to="`/admin/users/${client.id}`">
          <Button variant="outline" size="sm" class="w-full">
            View Client Profile
          </Button>
        </NuxtLink>
      </div>
    </CardContent>
  </Card>
</template>