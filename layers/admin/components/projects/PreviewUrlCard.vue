<script setup lang="ts">
import { ref, computed } from "vue";
import { ExternalLink, Lock, Eye, EyeOff, Copy, Check, Calendar, Power, AlertTriangle } from "lucide-vue-next";
import { useToast } from "@/components/ui/toast/use-toast";

interface Props {
  projectId: string;
  projectTitle: string;
  previewUrl?: string | null;
  previewPassword?: string | null;
  previewEnabled?: boolean;
  previewExpiresAt?: Date | string | null;
}

const props = defineProps<Props>();
const { toast } = useToast();

const isEditing = ref(false);
const showPassword = ref(false);
const isCopied = ref(false);
const isSubmitting = ref(false);

const formData = ref({
  previewUrl: props.previewUrl || "",
  previewPassword: props.previewPassword || "",
  previewEnabled: props.previewEnabled ?? true,
  previewExpiresAt: props.previewExpiresAt ? new Date(props.previewExpiresAt).toISOString().split('T')[0] : ""
});

// Update form when props change
const updateFormData = () => {
  formData.value = {
    previewUrl: props.previewUrl || "",
    previewPassword: props.previewPassword || "",
    previewEnabled: props.previewEnabled ?? true,
    previewExpiresAt: props.previewExpiresAt ? new Date(props.previewExpiresAt).toISOString().split('T')[0] : ""
  };
};

// Check if preview is expired
const isExpired = computed(() => {
  if (!props.previewExpiresAt) return false;
  return new Date(props.previewExpiresAt) < new Date();
});

// Toggle preview enabled
const togglePreviewEnabled = async () => {
  isSubmitting.value = true;

  try {
    const response = await $fetch(`/api/admin/projects/${props.projectId}/preview`, {
      method: "PUT",
      body: {
        previewUrl: props.previewUrl,
        previewPassword: props.previewPassword,
        previewEnabled: !props.previewEnabled,
        previewExpiresAt: props.previewExpiresAt
      }
    });

    if (response.success) {
      toast({
        title: "Success",
        description: props.previewEnabled ? "Preview disabled" : "Preview enabled"
      });
      window.location.reload(); // Reload to get updated data
    }
  } catch (error: any) {
    toast({
      title: "Error",
      description: error?.data?.message || "Failed to toggle preview",
      variant: "destructive"
    });
  } finally {
    isSubmitting.value = false;
  }
};

// Save preview URL
const savePreviewUrl = async () => {
  isSubmitting.value = true;

  try {
    const response = await $fetch(`/api/admin/projects/${props.projectId}/preview`, {
      method: "PUT",
      body: {
        previewUrl: formData.value.previewUrl || null,
        previewPassword: formData.value.previewPassword || null,
        previewEnabled: formData.value.previewEnabled,
        previewExpiresAt: formData.value.previewExpiresAt || null
      }
    });

    if (response.success) {
      toast({
        title: "Success",
        description: "Preview URL updated successfully"
      });
      isEditing.value = false;
    }
  } catch (error: any) {
    toast({
      title: "Error",
      description: error?.data?.message || "Failed to update preview URL",
      variant: "destructive"
    });
  } finally {
    isSubmitting.value = false;
  }
};

// Cancel editing
const cancelEdit = () => {
  updateFormData();
  isEditing.value = false;
};

// Copy preview URL to clipboard
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    isCopied.value = true;
    toast({
      title: "Copied!",
      description: "Preview URL copied to clipboard"
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

// Copy full preview details
const copyPreviewDetails = () => {
  const details = `Preview URL for ${props.projectTitle}:\n${props.previewUrl}${props.previewPassword ? `\n\nPassword: ${props.previewPassword}` : ''}`;
  copyToClipboard(details);
};
</script>

<template>
  <Card>
    <CardHeader>
      <div class="flex items-center justify-between">
        <CardTitle class="flex items-center gap-2">
          <ExternalLink class="h-5 w-5" />
          Preview URL
        </CardTitle>
        <div class="flex items-center gap-2">
          <Badge 
            v-if="previewUrl && !previewEnabled" 
            variant="outline" 
            class="text-red-600 bg-red-50 border-red-200"
          >
            <Power class="h-3 w-3 mr-1" />
            Disabled
          </Badge>
          <Badge 
            v-else-if="previewUrl && isExpired" 
            variant="outline" 
            class="text-amber-600 bg-amber-50 border-amber-200"
          >
            <AlertTriangle class="h-3 w-3 mr-1" />
            Expired
          </Badge>
          <Badge 
            v-else-if="previewUrl" 
            variant="outline" 
            class="text-green-600 bg-green-50 border-green-200"
          >
            <Eye class="h-3 w-3 mr-1" />
            Client Visible
          </Badge>
          <Button 
            v-if="!isEditing" 
            variant="outline" 
            size="sm"
            @click="isEditing = true"
          >
            {{ previewUrl ? 'Edit' : 'Add Preview' }}
          </Button>
        </div>
      </div>
      <CardDescription>
        Share a preview or staging URL with your client
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div v-if="isEditing" class="space-y-4">
        <!-- Edit Form -->
        <div class="space-y-2">
          <Label for="preview-url">Preview URL</Label>
          <Input
            id="preview-url"
            v-model="formData.previewUrl"
            placeholder="https://project-name.vercel.app"
            type="url"
          />
          <p class="text-xs text-muted-foreground">
            Enter the Vercel, Netlify, or any staging URL
          </p>
        </div>

        <div class="space-y-2">
          <Label for="preview-password">Password Protection (Optional)</Label>
          <div class="relative">
            <Input
              id="preview-password"
              v-model="formData.previewPassword"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter password if site is protected"
            />
            <Button
              variant="ghost"
              size="sm"
              class="absolute right-0 top-0 h-full px-3"
              @click="showPassword = !showPassword"
            >
              <Eye v-if="!showPassword" class="h-4 w-4" />
              <EyeOff v-else class="h-4 w-4" />
            </Button>
          </div>
          <p class="text-xs text-muted-foreground">
            If your preview site requires a password
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="preview-expires">Expiration Date (Optional)</Label>
            <Input
              id="preview-expires"
              v-model="formData.previewExpiresAt"
              type="date"
              :min="new Date().toISOString().split('T')[0]"
            />
            <p class="text-xs text-muted-foreground">
              Auto-hide preview after this date
            </p>
          </div>

          <div class="space-y-2">
            <Label>Preview Status</Label>
            <div class="flex items-center space-x-2">
              <Checkbox
                id="preview-enabled"
                v-model:checked="formData.previewEnabled"
              />
              <Label for="preview-enabled" class="cursor-pointer">
                Enable preview for client
              </Label>
            </div>
            <p class="text-xs text-muted-foreground">
              Uncheck to hide from client immediately
            </p>
          </div>
        </div>

        <div class="flex justify-end gap-2">
          <Button variant="outline" @click="cancelEdit" :disabled="isSubmitting">
            Cancel
          </Button>
          <Button @click="savePreviewUrl" :disabled="isSubmitting">
            {{ isSubmitting ? 'Saving...' : 'Save Preview URL' }}
          </Button>
        </div>
      </div>

      <div v-else-if="previewUrl" class="space-y-4">
        <!-- Display Preview URL -->
        <div class="p-4 bg-muted rounded-lg space-y-3">
          <div class="flex items-start justify-between">
            <div class="space-y-1 flex-1">
              <p class="text-sm font-medium">Preview URL</p>
              <a 
                :href="previewUrl" 
                target="_blank"
                class="text-sm text-blue-600 hover:underline break-all flex items-center gap-1"
              >
                {{ previewUrl }}
                <ExternalLink class="h-3 w-3 flex-shrink-0" />
              </a>
            </div>
            <Button
              variant="ghost"
              size="sm"
              @click="copyToClipboard(previewUrl)"
            >
              <Check v-if="isCopied" class="h-4 w-4 text-green-600" />
              <Copy v-else class="h-4 w-4" />
            </Button>
          </div>

          <div v-if="previewPassword" class="space-y-1">
            <p class="text-sm font-medium flex items-center gap-1">
              <Lock class="h-3 w-3" />
              Password Protected
            </p>
            <div class="flex items-center justify-between">
              <p class="text-sm text-muted-foreground">
                Password: {{ showPassword ? previewPassword : '••••••••' }}
              </p>
              <Button
                variant="ghost"
                size="sm"
                @click="showPassword = !showPassword"
              >
                <Eye v-if="!showPassword" class="h-4 w-4" />
                <EyeOff v-else class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div v-if="previewExpiresAt" class="flex items-center justify-between text-sm p-3 bg-muted rounded-lg">
          <div class="flex items-center gap-2">
            <Calendar class="h-4 w-4 text-muted-foreground" />
            <span class="text-muted-foreground">
              {{ isExpired ? 'Expired on' : 'Expires on' }}
            </span>
            <span class="font-medium">
              {{ new Date(previewExpiresAt).toLocaleDateString() }}
            </span>
          </div>
        </div>

        <div class="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            @click="togglePreviewEnabled"
            :disabled="isSubmitting"
            class="flex-1"
          >
            <Power class="h-4 w-4 mr-2" />
            {{ previewEnabled ? 'Disable Preview' : 'Enable Preview' }}
          </Button>
          <Button variant="outline" size="sm" @click="copyPreviewDetails" class="flex-1">
            <Copy class="h-4 w-4 mr-2" />
            Copy Details
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            asChild 
            class="flex-1"
            :disabled="!previewEnabled || isExpired"
          >
            <a :href="previewUrl" target="_blank">
              <ExternalLink class="h-4 w-4 mr-2" />
              Open Preview
            </a>
          </Button>
        </div>
      </div>

      <div v-else class="text-center py-6 text-muted-foreground">
        <ExternalLink class="h-12 w-12 mx-auto mb-3 opacity-20" />
        <p class="text-sm">No preview URL set</p>
        <p class="text-xs mt-1">Add a preview URL to share with your client</p>
      </div>
    </CardContent>
  </Card>
</template>