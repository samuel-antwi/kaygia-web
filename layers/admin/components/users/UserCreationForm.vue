<script setup lang="ts">
import { ref, computed } from "vue";
import { useToast } from "@/components/ui/toast/use-toast";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import {
  AlertTriangle,
  Check,
  Copy,
  EyeIcon,
  EyeOffIcon,
  Loader2,
} from "lucide-vue-next";

// Define validation schema using zod
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["CLIENT", "ADMIN"], {
    required_error: "Please select a role",
  }),
  company: z.string().optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
  sendVerificationEmail: z.boolean().default(true),
  active: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

// Define API response type
interface ApiResponse {
  success: boolean;
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    company: string | null;
    createdAt: string;
    active: boolean;
  };
  message?: string;
  passwordGenerated?: boolean;
  generatedPassword?: string;
  verificationEmailSent?: boolean;
}

// Initialize form
const form = useForm({
  validationSchema: toTypedSchema(formSchema),
  initialValues: {
    name: "",
    email: "",
    role: "CLIENT",
    company: "",
    password: "",
    sendVerificationEmail: true,
    active: true,
  },
});

// Manual tracking of submission state to avoid initial incorrect state
const isSubmitting = ref(false);

// Toast notification
const { toast } = useToast();

// State for showing/hiding password
const showPassword = ref(false);
const toggleShowPassword = () => (showPassword.value = !showPassword.value);

// State for displaying generated password
const generatedPassword = ref("");
const showGeneratedPassword = ref(false);
const toggleShowGeneratedPassword = () => {
  showGeneratedPassword.value = !showGeneratedPassword.value;
};

// State for copy button
const copiedPassword = ref(false);
const copyToClipboard = () => {
  if (generatedPassword.value) {
    navigator.clipboard.writeText(generatedPassword.value);
    copiedPassword.value = true;
    setTimeout(() => {
      copiedPassword.value = false;
    }, 2000);
  }
};

// Form submission handler
const onSubmit = form.handleSubmit(async (values) => {
  if (isSubmitting.value) return; // Prevent double submission

  isSubmitting.value = true;

  try {
    // Call the API to create the user
    const response = await $fetch<ApiResponse>("/api/admin/users", {
      method: "POST",
      body: values,
    });

    // If successful, show success notification
    toast({
      title: "User Created",
      description: response.message || "User created successfully",
      variant: "default",
      duration: 5000,
    });

    // Reset form
    form.resetForm();

    // If a password was generated, display it
    if (response.passwordGenerated && response.generatedPassword) {
      generatedPassword.value = response.generatedPassword;
      showGeneratedPassword.value = true;
    }

    // Emit event for parent component
    emit("user-created", response.user);
  } catch (error: any) {
    console.error("Error creating user:", error);

    // Show error notification
    const errorMessage =
      error.data?.statusMessage ||
      error.data?.message ||
      error.message ||
      "Failed to create user";

    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
      duration: 5000,
    });
  } finally {
    isSubmitting.value = false;
  }
});

// Generate a random password
const generateRandomPassword = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
  const password = Array.from({ length: 12 }, () =>
    characters.charAt(Math.floor(Math.random() * characters.length))
  ).join("");
  form.setFieldValue("password", password);
};

// Helper to check if password exists
const hasPassword = computed(() => Boolean(form.values.password));

// Define events
const emit = defineEmits<{
  (e: "user-created", user: any): void;
}>();
</script>

<template>
  <div>
    <Card class="border shadow-sm">
      <CardHeader class="pb-4">
        <CardTitle class="text-xl">Create New User</CardTitle>
        <CardDescription>
          Add a new user to the system. They will receive an email with
          instructions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit="onSubmit" class="space-y-6">
          <!-- User Name -->
          <FormField v-slot="{ componentField }" name="name">
            <FormItem>
              <FormLabel class="text-sm font-medium">Full Name</FormLabel>
              <FormControl>
                <Input v-bind="componentField" placeholder="Jane Doe" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Email -->
          <FormField v-slot="{ componentField }" name="email">
            <FormItem>
              <FormLabel class="text-sm font-medium">Email Address</FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  type="email"
                  placeholder="jane.doe@example.com"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <div class="grid gap-5 sm:grid-cols-2">
            <!-- Company -->
            <FormField v-slot="{ componentField }" name="company">
              <FormItem>
                <FormLabel class="text-sm font-medium"
                  >Company (Optional)</FormLabel
                >
                <FormControl>
                  <Input v-bind="componentField" placeholder="Company Name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- Role Selection -->
            <FormField v-slot="{ value, handleChange }" name="role">
              <FormItem>
                <FormLabel class="text-sm font-medium">User Role</FormLabel>
                <Select :value="value" @update:value="handleChange">
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Roles</SelectLabel>
                      <SelectItem value="CLIENT">Client</SelectItem>
                      <SelectItem value="ADMIN">Administrator</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            </FormField>
          </div>

          <!-- Password -->
          <FormField v-slot="{ componentField, value }" name="password">
            <FormItem>
              <div class="flex items-center justify-between">
                <FormLabel class="text-sm font-medium"
                  >Password (Optional)</FormLabel
                >
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  @click="generateRandomPassword"
                  class="h-8 text-xs"
                >
                  Generate Password
                </Button>
              </div>
              <FormControl>
                <div class="relative">
                  <Input
                    v-bind="componentField"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="Leave blank to auto-generate"
                    autocomplete="new-password"
                  />
                  <button
                    type="button"
                    @click="toggleShowPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <EyeIcon v-if="!showPassword" class="h-5 w-5" />
                    <EyeOffIcon v-else class="h-5 w-5" />
                  </button>
                </div>
              </FormControl>
              <FormMessage />
              <p v-if="!value" class="text-xs text-muted-foreground">
                If left blank, a secure password will be generated and displayed
                after creating the user.
              </p>
            </FormItem>
          </FormField>

          <!-- Options -->
          <div
            class="grid gap-3 sm:grid-cols-2 bg-muted/40 p-3 rounded-md mt-2"
          >
            <FormField
              v-slot="{ value, handleChange }"
              name="sendVerificationEmail"
            >
              <FormItem class="flex items-center space-x-2">
                <FormControl>
                  <Checkbox :checked="value" @update:checked="handleChange" />
                </FormControl>
                <FormLabel class="text-sm font-normal">
                  Send email verification
                </FormLabel>
              </FormItem>
            </FormField>
            <FormField v-slot="{ value, handleChange }" name="active">
              <FormItem class="flex items-center space-x-2">
                <FormControl>
                  <Checkbox :checked="value" @update:checked="handleChange" />
                </FormControl>
                <FormLabel class="text-sm font-normal">
                  Account active
                </FormLabel>
              </FormItem>
            </FormField>
          </div>

          <!-- Generated Password Display -->
          <Alert
            v-if="generatedPassword"
            class="mt-4 bg-success/10 border-success"
          >
            <Check class="h-4 w-4 text-success" />
            <AlertTitle>User Created Successfully</AlertTitle>
            <AlertDescription>
              <div class="mt-2">
                <p class="text-sm mb-2">
                  A password has been generated for this user. Please copy it
                  before navigating away:
                </p>
                <div class="relative bg-card p-2 rounded-md border">
                  <p
                    class="font-mono pr-8"
                    :class="{
                      'blur-sm': !showGeneratedPassword,
                    }"
                  >
                    {{ generatedPassword }}
                  </p>
                  <div class="absolute right-2 top-1/2 -translate-y-1/2 flex">
                    <button
                      type="button"
                      @click="toggleShowGeneratedPassword"
                      class="text-muted-foreground hover:text-foreground mr-1"
                    >
                      <EyeIcon v-if="!showGeneratedPassword" class="h-5 w-5" />
                      <EyeOffIcon v-else class="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      @click="copyToClipboard"
                      class="text-muted-foreground hover:text-foreground"
                    >
                      <Copy
                        v-if="!copiedPassword"
                        class="h-5 w-5"
                        aria-label="Copy password"
                      />
                      <Check
                        v-else
                        class="h-5 w-5 text-success"
                        aria-label="Copied!"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <!-- Submit Button -->
          <Button
            type="submit"
            class="w-full mt-2"
            :disabled="isSubmitting"
            size="lg"
          >
            <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
            {{ isSubmitting ? "Creating User..." : "Create User" }}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
