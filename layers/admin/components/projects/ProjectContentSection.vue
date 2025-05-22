<script setup lang="ts">
import { Edit3, Palette, Eye } from "lucide-vue-next";

interface Props {
  contentReadiness?: string | null;
  brandAssetsStatus?: string | null;
  competitorReferences?: string | null;
}

defineProps<Props>();

// Format content readiness
const formatContentReadiness = (readiness: string | null | undefined): string => {
  if (!readiness) return "N/A";
  switch (readiness) {
    case "client_provides":
      return "Client Provides";
    case "need_copywriting":
      return "Need Copywriting";
    case "mixed":
      return "Mixed";
    default:
      return readiness;
  }
};

// Format brand assets status
const formatBrandAssetsStatus = (status: string | null | undefined): string => {
  if (!status) return "N/A";
  switch (status) {
    case "complete":
      return "Complete";
    case "partial":
      return "Partial";
    case "none":
      return "None";
    default:
      return status;
  }
};
</script>

<template>
  <div>
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center text-lg">
          <Palette class="h-5 w-5 mr-2 text-primary" />
          Content & Assets
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-if="contentReadiness" class="space-y-1">
            <h4 class="text-sm font-medium flex items-center">
              <Edit3 class="h-4 w-4 mr-2 text-muted-foreground" />
              Content Readiness
            </h4>
            <p class="text-sm text-muted-foreground">
              {{ formatContentReadiness(contentReadiness) }}
            </p>
          </div>

          <div v-if="brandAssetsStatus" class="space-y-1">
            <h4 class="text-sm font-medium flex items-center">
              <Palette class="h-4 w-4 mr-2 text-muted-foreground" />
              Brand Assets Status
            </h4>
            <p class="text-sm text-muted-foreground">
              {{ formatBrandAssetsStatus(brandAssetsStatus) }}
            </p>
          </div>
        </div>

        <div v-if="competitorReferences" class="space-y-1">
          <h4 class="text-sm font-medium flex items-center">
            <Eye class="h-4 w-4 mr-2 text-muted-foreground" />
            Competitor References
          </h4>
          <p class="text-sm text-muted-foreground">
            {{ competitorReferences }}
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>