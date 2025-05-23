<script setup lang="ts">
import { CheckIcon, XIcon, Loader2, Upload, UserCircle, Trash2 } from "lucide-vue-next";
import { z } from "zod";
import { useToast } from "@/components/ui/toast/use-toast";

// Define the expected API response type
interface ApiResponseSuccess {
  success: boolean;
  message: string;
  user: Record<string, any>;
}

const props = defineProps<{
  user: {
    id: string;
    name: string | null;
    email: string;
    company?: string | null;
    avatarUrl?: string | null;
  };
  dialog?: boolean; // Optional prop to indicate if this form is rendered in a dialog
}>();

const emit = defineEmits<{
  profileUpdated: [updatedUser: any];
  cancel: [];
}>();

const { toast } = useToast();
const formData = ref({
  name: props.user.name || "",
  email: props.user.email,
  company: props.user.company || "",
});

const isSubmitting = ref(false);
const errors = ref<Record<string, string>>({});
const isUploadingAvatar = ref(false);
const avatarPreview = ref<string | null>(props.user.avatarUrl || null);
const fileInput = ref<HTMLInputElement>();

// Form validation schema
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  company: z.string().optional(),
});

async function handleSubmit() {
  // Reset errors
  errors.value = {};

  try {
    // Validate form data
    const validatedData = formSchema.parse(formData.value);
    isSubmitting.value = true;

    // Call API to update user profile
    const { data, error } = await useFetch(
      `/api/admin/users/${props.user.id}/profile`,
      {
        method: "PUT",
        body: validatedData,
      }
    );

    if (error.value) {
      const errorData = error.value.data as any;
      if (errorData?.data) {
        // Set validation errors
        Object.entries(errorData.data).forEach(
          ([key, value]: [string, any]) => {
            if (value._errors?.length) {
              errors.value[key] = value._errors[0];
            }
          }
        );
      } else {
        toast({
          title: "Error",
          description: errorData?.message || "Failed to update user profile",
          variant: "destructive",
        });
      }
    } else if (data.value) {
      // Cast to expected type
      const response = data.value as unknown as ApiResponseSuccess;
      toast({
        title: "Success",
        description: "User profile updated successfully",
      });
      emit("profileUpdated", response.user);
    }
  } catch (e) {
    if (e instanceof z.ZodError) {
      // Handle zod validation errors
      e.errors.forEach((err) => {
        if (err.path.length > 0) {
          errors.value[err.path[0]] = err.message;
        }
      });
    } else {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  } finally {
    isSubmitting.value = false;
  }
}

// Handle avatar file selection
function handleAvatarSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    toast({
      title: "Error",
      description: "Please select an image file",
      variant: "destructive",
    });
    return;
  }
  
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    toast({
      title: "Error",
      description: "Image size must be less than 5MB",
      variant: "destructive",
    });
    return;
  }
  
  // Read file and upload
  const reader = new FileReader();
  reader.onload = async (e) => {
    const dataUrl = e.target?.result as string;
    avatarPreview.value = dataUrl;
    await uploadAvatar(dataUrl);
  };
  reader.readAsDataURL(file);
}

// Upload avatar to server
async function uploadAvatar(dataUrl: string) {
  isUploadingAvatar.value = true;
  
  try {
    const { data, error } = await useFetch(
      `/api/admin/users/${props.user.id}/avatar`,
      {
        method: "POST",
        body: { avatarDataUrl: dataUrl },
      }
    );
    
    if (error.value) {
      toast({
        title: "Error",
        description: "Failed to upload avatar",
        variant: "destructive",
      });
      avatarPreview.value = props.user.avatarUrl || null;
    } else if (data.value) {
      const response = data.value as ApiResponseSuccess;
      toast({
        title: "Success",
        description: "Avatar uploaded successfully",
      });
      emit("profileUpdated", response.user);
    }
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to upload avatar",
      variant: "destructive",
    });
    avatarPreview.value = props.user.avatarUrl || null;
  } finally {
    isUploadingAvatar.value = false;
  }
}

// Delete avatar
async function deleteAvatar() {
  if (!confirm("Are you sure you want to remove the avatar?")) return;
  
  isUploadingAvatar.value = true;
  
  try {
    const { error } = await useFetch(
      `/api/admin/users/${props.user.id}/avatar`,
      {
        method: "DELETE",
      }
    );
    
    if (error.value) {
      toast({
        title: "Error",
        description: "Failed to delete avatar",
        variant: "destructive",
      });
    } else {
      avatarPreview.value = null;
      toast({
        title: "Success",
        description: "Avatar removed successfully",
      });
      emit("profileUpdated", { ...props.user, avatarUrl: null });
    }
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to delete avatar",
      variant: "destructive",
    });
  } finally {
    isUploadingAvatar.value = false;
  }
}
</script>

<template>
  <div>
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Avatar Upload Section -->
      <div class="space-y-2">
        <Label>Profile Picture</Label>
        <div class="flex items-center gap-4">
          <div class="relative">
            <Avatar class="h-20 w-20">
              <AvatarImage v-if="avatarPreview" :src="avatarPreview" />
              <AvatarFallback>
                <UserCircle class="h-12 w-12 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div v-if="isUploadingAvatar" class="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
              <Loader2 class="h-6 w-6 animate-spin text-white" />
            </div>
          </div>
          <div class="space-y-2">
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleAvatarSelect"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              @click="fileInput?.click()"
              :disabled="isUploadingAvatar"
            >
              <Upload class="h-4 w-4 mr-2" />
              Upload Photo
            </Button>
            <Button
              v-if="avatarPreview"
              type="button"
              variant="ghost"
              size="sm"
              @click="deleteAvatar"
              :disabled="isUploadingAvatar"
              class="text-destructive hover:text-destructive"
            >
              <Trash2 class="h-4 w-4 mr-2" />
              Remove
            </Button>
            <p class="text-xs text-muted-foreground">Max size: 5MB. JPG, PNG, GIF</p>
          </div>
        </div>
      </div>
      
      <Separator />
      <div class="space-y-2">
        <Label for="name">Name</Label>
        <Input
          id="name"
          v-model="formData.name"
          :class="{ 'border-destructive': errors.name }"
          placeholder="Enter user's name"
        />
        <p v-if="errors.name" class="text-sm text-destructive">
          {{ errors.name }}
        </p>
      </div>

      <div class="space-y-2">
        <Label for="email">Email</Label>
        <Input
          id="email"
          type="email"
          v-model="formData.email"
          :class="{ 'border-destructive': errors.email }"
          placeholder="Enter user's email"
        />
        <p v-if="errors.email" class="text-sm text-destructive">
          {{ errors.email }}
        </p>
      </div>

      <div class="space-y-2">
        <Label for="company">Company (Optional)</Label>
        <Input
          id="company"
          v-model="formData.company"
          :class="{ 'border-destructive': errors.company }"
          placeholder="Enter user's company"
        />
        <p v-if="errors.company" class="text-sm text-destructive">
          {{ errors.company }}
        </p>
      </div>

      <div class="flex justify-end space-x-2 pt-2">
        <Button
          variant="outline"
          type="button"
          @click="emit('cancel')"
          :class="props.dialog ? 'min-w-[80px]' : ''"
        >
          <XIcon v-if="!props.dialog" class="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button
          type="submit"
          :disabled="isSubmitting"
          :class="props.dialog ? 'min-w-[80px]' : ''"
        >
          <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
          <CheckIcon v-else-if="!props.dialog" class="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </form>
  </div>
</template>
