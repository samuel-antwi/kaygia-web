<script setup lang="ts">
import { ref, computed } from "vue";
import { ExternalLink, Lock, Eye, EyeOff, Copy, Check, AlertCircle } from "lucide-vue-next";
import { useToast } from "@/components/ui/toast/use-toast";

interface Props {
  previewUrl?: string | null;
  previewPassword?: string | null;
  previewEnabled?: boolean;
  previewExpiresAt?: Date | string | null;
  projectTitle: string;
}

const props = defineProps<Props>();
const { toast } = useToast();

const showPassword = ref(false);
const isCopied = ref(false);

// Check if preview is expired
const isExpired = computed(() => {
  if (!props.previewExpiresAt) return false;
  return new Date(props.previewExpiresAt) < new Date();
});

// Check if preview should be shown
const shouldShowPreview = computed(() => {
  return props.previewUrl && props.previewEnabled !== false && !isExpired.value;
});

// Copy to clipboard
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    isCopied.value = true;
    toast({
      title: "Copied!",
      description: "Copied to clipboard"
    });
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to copy to clipboard",
      variant: "destructive"
    });
  }
};
</script>

<template>
  <Card v-if="shouldShowPreview">
    <CardHeader>
      <CardTitle class="flex items-center justify-between">
        <span class="flex items-center gap-2">
          <ExternalLink class="h-5 w-5" />
          Preview Site
        </span>
        <Badge v-if="previewPassword" variant="outline" class="text-amber-600 bg-amber-50 border-amber-200">
          <Lock class="h-3 w-3 mr-1" />
          Password Protected
        </Badge>
      </CardTitle>
      <CardDescription>
        View the latest development version of your project
      </CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <!-- Preview URL -->
      <div class="p-4 bg-muted rounded-lg space-y-3">
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium">Preview URL</p>
            <Button
              variant="ghost"
              size="sm"
              @click="copyToClipboard(previewUrl!)"
            >
              <Check v-if="isCopied" class="h-4 w-4 text-green-600" />
              <Copy v-else class="h-4 w-4" />
            </Button>
          </div>
          <a 
            :href="previewUrl || ''" 
            target="_blank"
            class="text-sm text-blue-600 hover:underline break-all flex items-center gap-1"
          >
            {{ previewUrl }}
            <ExternalLink class="h-3 w-3 flex-shrink-0" />
          </a>
        </div>

        <!-- Password if exists -->
        <div v-if="previewPassword" class="pt-3 border-t space-y-2">
          <p class="text-sm font-medium flex items-center gap-1">
            <Lock class="h-3 w-3" />
            Access Password
          </p>
          <div class="flex items-center justify-between">
            <p class="text-sm font-mono">
              {{ showPassword ? previewPassword : '••••••••' }}
            </p>
            <div class="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                @click="showPassword = !showPassword"
              >
                <Eye v-if="!showPassword" class="h-4 w-4" />
                <EyeOff v-else class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                @click="copyToClipboard(previewPassword!)"
              >
                <Copy class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Button -->
      <Button variant="default" class="w-full" asChild>
        <a :href="previewUrl || ''" target="_blank">
          <ExternalLink class="h-4 w-4 mr-2" />
          Open Preview Site
        </a>
      </Button>

      <!-- Info Alert -->
      <Alert>
        <AlertCircle class="h-4 w-4" />
        <AlertTitle>Development Preview</AlertTitle>
        <AlertDescription>
          This is a preview of your project in development. Features may be incomplete and content may change.
        </AlertDescription>
      </Alert>
    </CardContent>
  </Card>
</template>