<script setup lang="ts">
import { CheckIcon, XIcon, Loader2 } from "lucide-vue-next";
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
  };
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
</script>

<template>
  <div class="space-y-6">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="space-y-2">
        <Label for="name">Name</Label>
        <Input
          id="name"
          v-model="formData.name"
          :class="{ 'border-destructive': errors.name }"
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
        />
        <p v-if="errors.company" class="text-sm text-destructive">
          {{ errors.company }}
        </p>
      </div>

      <div class="flex justify-end space-x-2">
        <Button variant="outline" type="button" @click="emit('cancel')">
          <XIcon class="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button type="submit" :disabled="isSubmitting">
          <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
          <CheckIcon v-else class="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </form>
  </div>
</template>
