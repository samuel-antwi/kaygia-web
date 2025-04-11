<script setup lang="ts">
import { useToast } from "../../../../components/ui/toast/use-toast";
import PasswordChangeForm from "../../components/PasswordChangeForm.vue";
import { z } from "zod";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { User, Building, Mail, Shield } from "lucide-vue-next";

definePageMeta({
  layout: "dashboard",
  middleware: "auth",
});

// Get user data from auth composable
// Note: nuxt-auth-utils might require a dedicated refresh function
// exposed via useAuth to update the session immediately after PATCH.
const { user, loading } = useAuth();
const { toast } = useToast();

// Force fetch user profile directly to ensure data is available
const { data: profileData } = useFetch<{
  success?: boolean;
  user?: {
    id: string;
    email: string;
    name?: string | null;
    company?: string | null;
    role?: string;
    updatedAt?: string;
  };
  error?: string;
}>("/api/user/profile", {
  key: "settings-profile-" + Date.now(),
});

// Define validation schema using zod
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  company: z.string().min(1, "Company name is required"),
});

// Convert Zod schema to VeeValidate schema
const validationSchema = toTypedSchema(formSchema);

// Initialize form
const form = useForm({
  validationSchema,
  initialValues: {
    name: "",
    company: "",
  },
});

// Email is handled separately since it's read-only
const userEmail = ref("");

// Update form values when profile data is available
watch(
  profileData,
  (newData) => {
    if (newData?.success && newData?.user) {
      form.setValues({
        name: newData.user.name || "",
        company: newData.user.company || "",
      });
      userEmail.value = newData.user.email || "";
    }
  },
  { immediate: true }
);

// Form submission state
const isSubmitting = ref(false);
const submitError = ref<string | null>(null);

// Handle profile update submission
const onSubmit = form.handleSubmit(async (values) => {
  if (isSubmitting.value) return; // Prevent double submission

  isSubmitting.value = true;
  submitError.value = null;

  try {
    // Use useFetch to call the API endpoint
    const { data, error } = await useFetch("/api/profile", {
      method: "PATCH",
      body: {
        name: values.name.trim(),
        company: values.company.trim(),
      },
    });

    // Check for network or server errors returned by useFetch
    if (error.value) {
      // Throw H3Error to be caught below
      throw error.value;
    }

    // Check if the API operation itself was successful (based on our backend response)
    if (data.value?.success && data.value.user) {
      // Update local profile data with the latest data from the API
      profileData.value = {
        success: true,
        user: {
          ...profileData.value?.user,
          ...data.value.user,
        },
      };

      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved.",
        variant: "default",
      });
    } else {
      // Handle cases where the API returns success: false or unexpected data format
      submitError.value =
        "Failed to update profile due to unexpected response.";
      toast({
        title: "Update Failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  } catch (err: any) {
    console.error("Error updating profile:", err);
    submitError.value =
      err.data?.statusMessage ||
      err.message ||
      "An unexpected error occurred while updating profile.";
    toast({
      title: "Update Failed",
      description: submitError.value || "An unexpected error occurred",
      variant: "destructive",
    });
  } finally {
    isSubmitting.value = false;
  }
});

// Active tab management for mobile view
const activeTab = ref("profile");

const tabs = [
  {
    label: "Profile",
    value: "profile",
    icon: User,
  },
  {
    label: "Security",
    value: "security",
    icon: Shield,
  },
];
</script>

<template>
  <div class="container py-8 space-y-6">
    <!-- Tabs -->
    <div class="flex items-center w-full justify-between md:hidden">
      <div
        class="inline-flex items-center justify-center p-1 bg-muted rounded-lg"
      >
        <button
          v-for="tab in tabs"
          :key="tab.value"
          @click="activeTab = tab.value"
          class="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-md"
          :class="[
            activeTab === tab.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          ]"
        >
          <component :is="tab.icon" class="h-4 w-4" />
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Desktop Layout -->
    <div class="hidden md:grid md:grid-cols-[1fr_320px] gap-6">
      <div class="space-y-6">
        <!-- Profile Card -->
        <Card class="shadow-sm border-border/40">
          <CardHeader class="bg-muted/30 space-y-2">
            <div class="flex items-center gap-2.5">
              <User class="h-5 w-5 text-primary" />
              <CardTitle>Profile Information</CardTitle>
            </div>
            <CardDescription>
              Update your personal and company details
            </CardDescription>
          </CardHeader>
          <CardContent class="pt-6">
            <div
              v-if="loading && !profileData"
              class="py-8 flex justify-center"
            >
              <div
                class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"
              ></div>
            </div>
            <form v-else @submit="onSubmit" class="space-y-5">
              <!-- Name -->
              <FormField v-slot="{ componentField }" name="name">
                <FormItem>
                  <div class="flex items-baseline justify-between">
                    <FormLabel for="name" class="text-sm font-medium"
                      >Full Name</FormLabel
                    >
                  </div>
                  <div class="relative">
                    <div
                      class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
                    >
                      <User class="h-4 w-4 text-muted-foreground" />
                    </div>
                    <FormControl>
                      <Input
                        id="name"
                        v-bind="componentField"
                        placeholder="Your full name"
                        class="h-11 pl-10"
                        :disabled="isSubmitting"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              </FormField>

              <!-- Email (Read-only) -->
              <div class="space-y-2">
                <Label for="email" class="text-sm font-medium"
                  >Email Address</Label
                >
                <div class="relative">
                  <div
                    class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
                  >
                    <Mail class="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="email"
                    :value="userEmail"
                    placeholder="Your email address"
                    disabled
                    class="h-11 pl-10 bg-muted/40 cursor-not-allowed"
                  />
                </div>
                <p class="text-xs text-muted-foreground">
                  Email address cannot be changed
                </p>
              </div>

              <!-- Company -->
              <FormField v-slot="{ componentField }" name="company">
                <FormItem>
                  <FormLabel for="company" class="text-sm font-medium"
                    >Company Name</FormLabel
                  >
                  <div class="relative">
                    <div
                      class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
                    >
                      <Building class="h-4 w-4 text-muted-foreground" />
                    </div>
                    <FormControl>
                      <Input
                        id="company"
                        v-bind="componentField"
                        placeholder="Your company name"
                        class="h-11 pl-10"
                        :disabled="isSubmitting"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              </FormField>

              <!-- Update Button -->
              <div class="pt-2">
                <Button
                  type="submit"
                  class="w-full h-11"
                  :disabled="isSubmitting || loading"
                >
                  <span v-if="isSubmitting" class="mr-2">
                    <div
                      class="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                    ></div>
                  </span>
                  {{ isSubmitting ? "Updating..." : "Save Changes" }}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <!-- Password Change Card -->
        <Card class="shadow-sm border-border/40">
          <CardHeader class="bg-muted/30 space-y-2">
            <div class="flex items-center gap-2.5">
              <Shield class="h-5 w-5 text-primary" />
              <CardTitle>Security Details</CardTitle>
            </div>
            <CardDescription class="mt-1.5">
              Update your password and security preferences
            </CardDescription>
          </CardHeader>
          <CardContent class="pt-6">
            <PasswordChangeForm />
          </CardContent>
        </Card>
      </div>

      <!-- Account Overview Card -->
      <div class="w-full">
        <Card class="shadow-sm border-border/40">
          <CardHeader class="bg-muted/30 space-y-2">
            <CardTitle>Account Overview</CardTitle>
          </CardHeader>
          <CardContent class="pt-6">
            <div class="space-y-4">
              <div
                class="h-24 w-24 rounded-full bg-primary/10 mx-auto flex items-center justify-center"
              >
                <User class="h-12 w-12 text-primary/80" />
              </div>

              <div class="text-center space-y-1.5 mt-2">
                <h3 class="font-medium">
                  {{ form.values.name || "Your Name" }}
                </h3>
                <p class="text-sm text-muted-foreground">{{ userEmail }}</p>
              </div>

              <div class="pt-4 space-y-3">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-muted-foreground">Account Type</span>
                  <Badge>{{
                    profileData?.user?.role
                      ? profileData.user.role === "ADMIN"
                        ? "Administrator"
                        : profileData.user.role === "SUPER_ADMIN"
                          ? "Super Admin"
                          : "Client"
                      : "Client"
                  }}</Badge>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-muted-foreground">Last Updated</span>
                  <span>{{
                    profileData?.user?.updatedAt
                      ? new Date(
                          profileData.user.updatedAt
                        ).toLocaleDateString()
                      : "Never updated"
                  }}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Mobile Layout -->
    <div class="md:hidden space-y-6">
      <div v-if="activeTab === 'profile'">
        <!-- Profile Card for Mobile -->
        <Card class="shadow-sm border-border/40">
          <CardHeader class="space-y-2">
            <div class="flex items-center gap-2.5">
              <User class="h-5 w-5 text-primary" />
              <CardTitle>Profile Information</CardTitle>
            </div>
            <CardDescription>
              Update your personal and company details
            </CardDescription>
          </CardHeader>
          <CardContent class="pt-6">
            <div
              v-if="loading && !profileData"
              class="py-8 flex justify-center"
            >
              <div
                class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"
              ></div>
            </div>
            <form v-else @submit="onSubmit" class="space-y-4">
              <!-- Name -->
              <FormField v-slot="{ componentField }" name="name">
                <FormItem>
                  <FormLabel for="name">Full Name</FormLabel>
                  <div class="relative">
                    <div
                      class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
                    >
                      <User class="h-4 w-4 text-muted-foreground" />
                    </div>
                    <FormControl>
                      <Input
                        id="name"
                        v-bind="componentField"
                        placeholder="Your full name"
                        class="h-11 pl-10"
                        :disabled="isSubmitting"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              </FormField>

              <!-- Email (Read-only) -->
              <div class="space-y-2">
                <Label for="email">Email Address</Label>
                <div class="relative">
                  <div
                    class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
                  >
                    <Mail class="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="email"
                    :value="userEmail"
                    placeholder="Your email address"
                    disabled
                    class="h-11 pl-10 bg-muted/40 cursor-not-allowed"
                  />
                </div>
                <p class="text-xs text-muted-foreground">
                  Email address cannot be changed
                </p>
              </div>

              <!-- Company -->
              <FormField v-slot="{ componentField }" name="company">
                <FormItem>
                  <FormLabel for="company">Company Name</FormLabel>
                  <div class="relative">
                    <div
                      class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
                    >
                      <Building class="h-4 w-4 text-muted-foreground" />
                    </div>
                    <FormControl>
                      <Input
                        id="company"
                        v-bind="componentField"
                        placeholder="Your company name"
                        class="h-11 pl-10"
                        :disabled="isSubmitting"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              </FormField>

              <!-- Update Button -->
              <div class="pt-2">
                <Button
                  type="submit"
                  class="w-full h-11"
                  :disabled="isSubmitting || loading"
                >
                  <span v-if="isSubmitting" class="mr-2">
                    <div
                      class="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                    ></div>
                  </span>
                  {{ isSubmitting ? "Updating..." : "Save Changes" }}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div v-if="activeTab === 'security'">
        <!-- Password Card for Mobile -->
        <Card class="shadow-sm border-border/40">
          <CardHeader class="space-y-2">
            <div class="flex items-center gap-2.5">
              <Shield class="h-5 w-5 text-primary" />
              <CardTitle>Security Details</CardTitle>
            </div>
            <CardDescription>
              Update your password and security preferences
            </CardDescription>
          </CardHeader>
          <CardContent class="pt-6">
            <PasswordChangeForm />
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-icon {
  @apply absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground;
}

.form-input {
  @apply h-11 pl-10;
}

.card-header-icon {
  @apply inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary;
}
</style>
