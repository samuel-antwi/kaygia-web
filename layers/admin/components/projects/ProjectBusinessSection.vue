<script setup lang="ts">
import { Target, TrendingUp, Users, Shield } from "lucide-vue-next";

interface Props {
  targetAudience?: string | null;
  businessGoals?: string | null;
  successMetrics?: string | null;
  complianceRequirements?: string[] | null;
}

defineProps<Props>();
</script>

<template>
  <div>
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center text-lg">
          <Target class="h-5 w-5 mr-2 text-primary" />
          Business Context
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div v-if="targetAudience" class="space-y-1">
          <h4 class="text-sm font-medium flex items-center">
            <Users class="h-4 w-4 mr-2 text-muted-foreground" />
            Target Audience
          </h4>
          <p class="text-sm text-muted-foreground">
            {{ targetAudience }}
          </p>
        </div>

        <div v-if="businessGoals" class="space-y-1">
          <h4 class="text-sm font-medium flex items-center">
            <Target class="h-4 w-4 mr-2 text-muted-foreground" />
            Business Goals
          </h4>
          <p class="text-sm text-muted-foreground">
            {{ businessGoals }}
          </p>
        </div>

        <div v-if="successMetrics" class="space-y-1">
          <h4 class="text-sm font-medium flex items-center">
            <TrendingUp class="h-4 w-4 mr-2 text-muted-foreground" />
            Success Metrics
          </h4>
          <p class="text-sm text-muted-foreground">
            {{ successMetrics }}
          </p>
        </div>

        <div v-if="complianceRequirements?.length" class="space-y-2">
          <h4 class="text-sm font-medium flex items-center">
            <Shield class="h-4 w-4 mr-2 text-muted-foreground" />
            Compliance Requirements
          </h4>
          <div class="flex flex-wrap gap-2">
            <Badge v-for="requirement in complianceRequirements" :key="requirement" variant="secondary">
              {{ requirement }}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>