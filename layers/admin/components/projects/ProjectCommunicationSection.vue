<script setup lang="ts">
import { MessageSquare, MapPin, Briefcase, Users } from "lucide-vue-next";

interface Props {
  communicationPreference?: string | null;
  timezone?: string | null;
  keyStakeholders?: string | null;
  approvalProcess?: string | null;
}

defineProps<Props>();

// Format communication preference
const formatCommunicationPreference = (preference: string | null | undefined): string => {
  if (!preference) return "N/A";
  switch (preference) {
    case "email":
      return "Email Updates";
    case "slack":
      return "Slack Integration";
    case "meetings":
      return "Regular Meetings";
    default:
      return preference;
  }
};
</script>

<template>
  <div>
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center text-lg">
          <MessageSquare class="h-5 w-5 mr-2 text-primary" />
          Communication & Process
        </CardTitle>
        <CardDescription>Legacy communication preferences from older projects</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-if="communicationPreference" class="space-y-1">
            <h4 class="text-sm font-medium flex items-center">
              <MessageSquare class="h-4 w-4 mr-2 text-muted-foreground" />
              Communication Preference
            </h4>
            <p class="text-sm text-muted-foreground">
              {{ formatCommunicationPreference(communicationPreference) }}
            </p>
          </div>

          <div v-if="timezone" class="space-y-1">
            <h4 class="text-sm font-medium flex items-center">
              <MapPin class="h-4 w-4 mr-2 text-muted-foreground" />
              Timezone
            </h4>
            <p class="text-sm text-muted-foreground">
              {{ timezone }}
            </p>
          </div>
        </div>

        <div v-if="keyStakeholders" class="space-y-1">
          <h4 class="text-sm font-medium flex items-center">
            <Users class="h-4 w-4 mr-2 text-muted-foreground" />
            Key Stakeholders
          </h4>
          <p class="text-sm text-muted-foreground">
            {{ keyStakeholders }}
          </p>
        </div>

        <div v-if="approvalProcess" class="space-y-1">
          <h4 class="text-sm font-medium flex items-center">
            <Briefcase class="h-4 w-4 mr-2 text-muted-foreground" />
            Approval Process
          </h4>
          <p class="text-sm text-muted-foreground">
            {{ approvalProcess }}
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>