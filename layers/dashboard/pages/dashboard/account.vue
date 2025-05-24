<script setup lang="ts">
import { reactive, watch, ref } from "vue";
import { z } from "zod";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { useToast } from "../../../../components/ui/toast/use-toast";
import PasswordChangeForm from "../../components/PasswordChangeForm.vue";
import { User, Settings, Camera, Upload, Trash2 } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

definePageMeta({
  layout: "dashboard",
  middleware: "auth",
});

// Get user data from auth composable
const { user, loading: authLoading } = useAuth(); // Renamed loading to authLoading to avoid conflict
const { toast } = useToast();

// Avatar upload state
const isUploadingAvatar = ref(false);
const avatarPreview = ref<string | null>(null);
const fileInput = ref<HTMLInputElement>();
const showDeleteDialog = ref(false);

// Set initial avatar preview when user data loads
watch(user, (newUser) => {
  if (newUser?.avatarUrl) {
    avatarPreview.value = newUser.avatarUrl;
  }
}, { immediate: true });

// Define Zod schema for profile form validation
const profileSchema = z.object({
  name: z.string().min(1, "Name cannot be empty"),
  email: z.string().email(), // Included for form state, but will be read-only
  company: z.string().min(1, "Company cannot be empty"), // Company is required
});

// Convert Zod schema to VeeValidate schema
const validationSchema = toTypedSchema(profileSchema);

// Use the form hook from VeeValidate
const form = useForm({
  validationSchema: validationSchema,
  initialValues: {
    name: user.value?.name ?? "",
    email: user.value?.email ?? "",
    company: user.value?.company ?? "",
  },
  // Keep existing values if the form is already dirty (optional, depends on desired UX)
  // keepValuesOnUnmount: true,
});

// Watch for user data to become available and reset the form to ensure initial values are set
watch(
  user,
  (currentUser) => {
    // Only reset form if currentUser is loaded (truthy) and form might not have initialized correctly
    // This prevents resetting with empty strings if user is initially null/undefined
    if (currentUser) {
      form.resetForm({
        values: {
          name: currentUser.name ?? "",
          email: currentUser.email ?? "",
          company: currentUser.company ?? "",
        },
        // Optionally reset errors and touched state as well
        // errors: {},
        // touched: {},
      });
    }
  },
  { immediate: true } // Run immediately in case user data is already available
);

// Handle profile update submission using VeeValidate's handleSubmit
const onSubmit = form.handleSubmit(async (values) => {
  // isSubmitting is handled by form.isSubmitting
  // submitError is handled by FormMessage component

  try {
    // Use useFetch to call the API endpoint with validated values
    const { data, error } = await useFetch("/api/profile", {
      method: "PATCH",
      body: {
        name: values.name.trim(),
        company: values.company?.trim() || null, // Send null if empty/undefined
      },
    });

    // Check for network or server errors returned by useFetch
    if (error.value) {
      throw error.value; // Throw H3Error to be caught below
    }

    // Check if the API operation itself was successful
    if (data.value?.success && data.value.user) {
      // Session update is handled by backend. useAuth should reflect changes.
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved.",
        variant: "default",
      });
      // Optionally reset form dirty state if desired after successful save
      // form.resetForm({ values: values });
    } else {
      // Handle unexpected API response format
      toast({
        title: "Update Failed",
        description: "Failed to update profile due to unexpected response.", // Removed data.value?.message as it might not exist
        variant: "destructive",
      });
    }
  } catch (err: any) {
    console.error("Error updating profile:", err);
    const errorMessage =
      err.data?.statusMessage ||
      err.message ||
      "An unexpected error occurred while updating profile.";
    toast({
      title: "Update Failed",
      description: errorMessage,
      variant: "destructive",
    });
    // Optionally set form-level error if needed, though toast is usually sufficient
    // form.setErrors({ root: errorMessage });
  }
  // form.isSubmitting is automatically managed by VeeValidate
});

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
    const { data, error } = await useFetch('/api/profile/avatar', {
      method: 'POST',
      body: { avatarDataUrl: dataUrl },
    });
    
    if (error.value) {
      toast({
        title: "Error",
        description: "Failed to upload avatar",
        variant: "destructive",
      });
      // Reset preview on error
      avatarPreview.value = user.value?.avatarUrl || null;
    } else if (data.value?.success) {
      toast({
        title: "Success",
        description: "Avatar uploaded successfully",
      });
      // Update local user data if needed
      if (data.value.user && user.value) {
        user.value.avatarUrl = data.value.user.avatarUrl;
      }
    }
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to upload avatar",
      variant: "destructive",
    });
    avatarPreview.value = user.value?.avatarUrl || null;
  } finally {
    isUploadingAvatar.value = false;
    // Clear file input
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  }
}

// Delete avatar
async function deleteAvatar() {
  isUploadingAvatar.value = true;
  showDeleteDialog.value = false; // Close dialog
  
  try {
    const { error } = await useFetch('/api/profile/avatar', {
      method: 'DELETE',
    });
    
    if (error.value) {
      toast({
        title: "Error",
        description: "Failed to delete avatar",
        variant: "destructive",
      });
    } else {
      avatarPreview.value = null;
      if (user.value) {
        user.value.avatarUrl = null;
      }
      toast({
        title: "Success",
        description: "Avatar removed successfully",
      });
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
  <div class="max-w-4xl mx-auto">
    <!-- Header Section -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-foreground">Account Settings</h1>
      <p class="text-muted-foreground mt-2">
        Manage your account information and security preferences.
      </p>
    </div>

    <!-- Modern Settings Layout -->
    <div class="space-y-8">
      <!-- Profile Header Section -->
      <div class="relative">
        <!-- Background Pattern -->
        <div class="absolute inset-0 bg-gradient-to-r from-primary/5 via-purple-500/5 to-pink-500/5 rounded-3xl"></div>
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,theme(colors.primary.500/10),transparent_50%)] rounded-3xl"></div>
        
        <Card class="relative border-0 shadow-xl bg-white/50 backdrop-blur-sm">
          <CardContent class="p-8">
            <div class="flex flex-col lg:flex-row items-center lg:items-start gap-8">
              <!-- Avatar Section -->
              <div class="flex flex-col items-center gap-4">
                <div class="relative group">
                  <div class="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-xl"></div>
                  <Avatar class="h-32 w-32 border-4 border-white shadow-2xl relative">
                    <AvatarImage v-if="avatarPreview" :src="avatarPreview" />
                    <AvatarFallback class="text-3xl bg-gradient-to-br from-primary to-purple-600 text-white">
                      {{ user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U' }}
                    </AvatarFallback>
                  </Avatar>
                  <div v-if="isUploadingAvatar" class="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                    <div class="animate-spin h-8 w-8 border-3 border-white border-t-transparent rounded-full"></div>
                  </div>
                  <button
                    @click="() => fileInput?.click()"
                    :disabled="isUploadingAvatar"
                    class="absolute -bottom-2 -right-2 p-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-105 disabled:opacity-50"
                  >
                    <Camera class="h-4 w-4" />
                  </button>
                </div>
                
                <div class="text-center space-y-2">
                  <h2 class="text-2xl font-bold">{{ user?.name || 'Unnamed User' }}</h2>
                  <p class="text-muted-foreground">{{ user?.email }}</p>
                  <Badge v-if="user?.company" variant="secondary" class="bg-blue-100 text-blue-700 border-blue-200">
                    {{ user.company }}
                  </Badge>
                </div>
                
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleAvatarSelect"
                />
                <div class="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    @click="fileInput?.click()"
                    :disabled="isUploadingAvatar"
                    class="bg-white/80 backdrop-blur-sm"
                  >
                    <Upload class="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
                  
                  <Button
                    v-if="avatarPreview"
                    type="button"
                    variant="ghost"
                    size="sm"
                    @click="showDeleteDialog = true"
                    :disabled="isUploadingAvatar"
                    class="text-destructive hover:text-destructive bg-white/80 backdrop-blur-sm"
                  >
                    <Trash2 class="h-4 w-4" />
                  </Button>
                </div>
                <p class="text-xs text-muted-foreground text-center max-w-48">Square image recommended. Max 5MB.</p>
              </div>
              
              <!-- Quick Stats -->
              <div class="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                <div class="text-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20">
                  <div class="text-2xl font-bold text-green-600">Active</div>
                  <div class="text-sm text-muted-foreground">Account Status</div>
                </div>
                <div class="text-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20">
                  <div class="text-2xl font-bold text-blue-600">{{ user?.emailVerified ? 'Verified' : 'Pending' }}</div>
                  <div class="text-sm text-muted-foreground">Email Status</div>
                </div>
                <div class="text-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20">
                  <div class="text-2xl font-bold text-purple-600">{{ new Date(user?.createdAt || Date.now()).getFullYear() }}</div>
                  <div class="text-sm text-muted-foreground">Member Since</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Settings Cards Grid -->
      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Profile Information Card -->
        <Card class="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-slate-50/50">
          <CardHeader class="pb-4">
            <div class="flex items-center space-x-3">
              <div class="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-xl text-white shadow-lg">
                <User class="h-5 w-5" />
              </div>
              <div>
                <CardTitle class="text-xl">Profile Information</CardTitle>
                <CardDescription>Update your personal details and company information</CardDescription>
              </div>
            </div>
          </CardHeader>
        <CardContent class="space-y-6">
          <div v-if="authLoading && !user" class="space-y-4">
            <div class="flex items-center space-x-2 text-muted-foreground">
              <div class="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <span>Loading your profile...</span>
            </div>
            <!-- Skeleton loaders -->
            <div class="space-y-4">
              <div class="space-y-2">
                <div class="h-4 bg-muted rounded w-16"></div>
                <div class="h-12 bg-muted rounded"></div>
              </div>
              <div class="space-y-2">
                <div class="h-4 bg-muted rounded w-20"></div>
                <div class="h-12 bg-muted rounded"></div>
              </div>
              <div class="space-y-2">
                <div class="h-4 bg-muted rounded w-24"></div>
                <div class="h-12 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        <form v-else @submit="onSubmit" class="space-y-4">
          <!-- Name Field -->
          <FormField v-slot="{ componentField }" name="name">
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  v-bind="componentField"
                  class="h-12"
                  :disabled="form.isSubmitting.value"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Email Field (Read-only) -->
          <FormField v-slot="{ componentField }" name="email">
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  id="email"
                  v-bind="componentField"
                  disabled
                  class="h-12 bg-muted/50 cursor-not-allowed"
                />
              </FormControl>
              <FormDescription>Email cannot be changed.</FormDescription>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Company Field -->
          <FormField v-slot="{ componentField }" name="company">
            <FormItem>
              <FormLabel>Company</FormLabel>
              <FormControl>
                <Input
                  id="company"
                  type="text"
                  placeholder="Your company name"
                  v-bind="componentField"
                  class="h-12"
                  :disabled="form.isSubmitting.value"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Update Button -->
          <div class="pt-6 border-t">
            <div class="flex items-center justify-between">
              <div class="text-sm text-muted-foreground">
                Changes will be saved to your account
              </div>
              <Button
                type="submit"
                class="h-10 px-6"
                :disabled="form.isSubmitting.value || authLoading"
              >
                <span v-if="form.isSubmitting.value" class="mr-2">
                  <div
                    class="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                  ></div>
                </span>
                {{ form.isSubmitting.value ? "Saving..." : "Save Changes" }}
              </Button>
            </div>
          </div>
        </form>
        </CardContent>
      </Card>

        <!-- Security & Password Section -->
        <Card class="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-orange-50/30">
          <CardHeader class="pb-4">
            <div class="flex items-center space-x-3">
              <div class="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl text-white shadow-lg">
                <Settings class="h-5 w-5" />
              </div>
              <div>
                <CardTitle class="text-xl">Security Settings</CardTitle>
                <CardDescription>Manage your password and account security</CardDescription>
              </div>
            </div>
          </CardHeader>
        <CardContent>
          <PasswordChangeForm />
        </CardContent>
      </Card>

      </div>
    </div>
    
    <!-- Delete Avatar Confirmation Dialog -->
    <DeleteConfirmDialog
      v-model:open="showDeleteDialog"
      title="Remove Profile Picture"
      description="Are you sure you want to remove your profile picture?"
      confirm-text="Remove Picture"
      :loading="isUploadingAvatar"
      @confirm="deleteAvatar"
    />
  </div>
</template>

<style scoped>
/* Add any page-specific styles here */
</style>
