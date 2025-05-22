<script setup lang="ts">
import { Server, Globe, Link, Zap, Search, Database } from "lucide-vue-next";

interface Props {
  hostingPreference?: string | null;
  domainStatus?: string | null;
  integrationsNeeded?: string[] | null;
  performanceRequirements?: string | null;
  seoRequirements?: string | null;
  cmsRequired?: boolean | null;
}

defineProps<Props>();

// Format hosting preference
const formatHostingPreference = (preference: string | null | undefined): string => {
  if (!preference) return "N/A";
  switch (preference) {
    case "client_managed":
      return "Client Managed";
    case "agency_managed":
      return "Agency Managed";
    case "cloud_provider":
      return "Cloud Provider";
    default:
      return preference;
  }
};

// Format domain status
const formatDomainStatus = (status: string | null | undefined): string => {
  if (!status) return "N/A";
  switch (status) {
    case "new_domain":
      return "New Domain";
    case "existing_domain":
      return "Existing Domain";
    case "subdomain":
      return "Subdomain";
    default:
      return status;
  }
};

// Format boolean values
const formatBoolean = (value: boolean | null | undefined): string => {
  if (value === null || value === undefined) return "N/A";
  return value ? "Yes" : "No";
};
</script>

<template>
  <div v-if="hostingPreference || domainStatus || integrationsNeeded?.length || performanceRequirements || seoRequirements || cmsRequired !== null">
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center text-lg">
          <Server class="h-5 w-5 mr-2 text-primary" />
          Technical Requirements
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-if="hostingPreference" class="space-y-1">
            <h4 class="text-sm font-medium flex items-center">
              <Server class="h-4 w-4 mr-2 text-muted-foreground" />
              Hosting Preference
            </h4>
            <p class="text-sm text-muted-foreground">
              {{ formatHostingPreference(hostingPreference) }}
            </p>
          </div>

          <div v-if="domainStatus" class="space-y-1">
            <h4 class="text-sm font-medium flex items-center">
              <Globe class="h-4 w-4 mr-2 text-muted-foreground" />
              Domain Status
            </h4>
            <p class="text-sm text-muted-foreground">
              {{ formatDomainStatus(domainStatus) }}
            </p>
          </div>

          <div v-if="cmsRequired !== null" class="space-y-1">
            <h4 class="text-sm font-medium flex items-center">
              <Database class="h-4 w-4 mr-2 text-muted-foreground" />
              CMS Required
            </h4>
            <p class="text-sm text-muted-foreground">
              {{ formatBoolean(cmsRequired) }}
            </p>
          </div>
        </div>

        <div v-if="performanceRequirements" class="space-y-1">
          <h4 class="text-sm font-medium flex items-center">
            <Zap class="h-4 w-4 mr-2 text-muted-foreground" />
            Performance Requirements
          </h4>
          <p class="text-sm text-muted-foreground">
            {{ performanceRequirements }}
          </p>
        </div>

        <div v-if="seoRequirements" class="space-y-1">
          <h4 class="text-sm font-medium flex items-center">
            <Search class="h-4 w-4 mr-2 text-muted-foreground" />
            SEO Requirements
          </h4>
          <p class="text-sm text-muted-foreground">
            {{ seoRequirements }}
          </p>
        </div>

        <div v-if="integrationsNeeded?.length" class="space-y-2">
          <h4 class="text-sm font-medium flex items-center">
            <Link class="h-4 w-4 mr-2 text-muted-foreground" />
            Integrations Needed
          </h4>
          <div class="flex flex-wrap gap-2">
            <Badge v-for="integration in integrationsNeeded" :key="integration" variant="secondary">
              {{ integration }}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>