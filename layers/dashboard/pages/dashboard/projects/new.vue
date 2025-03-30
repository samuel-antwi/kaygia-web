<script setup lang="ts">
import { ArrowLeft } from "lucide-vue-next";
import { useProjectStore } from "~/layers/dashboard/stores/projectStore";
import type { CreateProjectPayload } from "../../../types/project";

definePageMeta({
  layout: "dashboard",
  middleware: "auth",
});

// Initialize the project store
const projectStore = useProjectStore();
const router = useRouter();

// Form data for new project
const projectData = reactive<CreateProjectPayload>({
  title: "",
  description: "",
  type: "WEBSITE",
  budget: undefined,
  requirements: "",
});

// Form validation state
const formErrors = reactive({
  title: "",
  type: "",
  general: "",
});

// Loading state
const isSubmitting = ref(false);

// Project type options
const projectTypes = [
  { value: "WEBSITE", label: "Website" },
  { value: "E_COMMERCE", label: "E-Commerce" },
  { value: "WEB_APP", label: "Web Application" },
  { value: "MOBILE_APP", label: "Mobile App" },
  { value: "BRANDING", label: "Branding" },
  { value: "MARKETING", label: "Marketing" },
  { value: "OTHER", label: "Other" },
];

// Validate the form
const validateForm = (): boolean => {
  let isValid = true;

  // Reset errors
  formErrors.title = "";
  formErrors.type = "";
  formErrors.general = "";

  // Validate title
  if (!projectData.title.trim()) {
    formErrors.title = "Title is required";
    isValid = false;
  }

  // Validate type
  if (!projectData.type) {
    formErrors.type = "Project type is required";
    isValid = false;
  }

  return isValid;
};

// Handle form submission
const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;

  try {
    const result = await projectStore.createProject(projectData);

    if (result.success && result.project) {
      // Redirect to the project list or the new project
      router.push(`/dashboard/projects/${result.project.id}`);
    } else {
      formErrors.general = result.error || "Failed to create project";
    }
  } catch (error) {
    formErrors.general = "An unexpected error occurred";
    console.error("Error creating project:", error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div>
    <Button variant="ghost" class="mb-4" as-child>
      <NuxtLink to="/dashboard/projects" class="flex items-center">
        <ArrowLeft class="mr-2 h-4 w-4" />
        Back to Projects
      </NuxtLink>
    </Button>

    <div class="mb-6">
      <h2 class="text-2xl sm:text-3xl font-bold mb-2">Request New Project</h2>
      <p class="text-muted-foreground">
        Fill out the form below to request a new project.
      </p>
    </div>

    <Card class="max-w-3xl">
      <CardHeader>
        <CardTitle>Project Information</CardTitle>
        <CardDescription>
          Provide details about your project requirements.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Error alert -->
          <Alert v-if="formErrors.general" variant="destructive">
            <AlertCircle class="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{{ formErrors.general }}</AlertDescription>
          </Alert>

          <!-- Project Title -->
          <div class="space-y-2">
            <Label for="title"
              >Project Title <span class="text-destructive">*</span></Label
            >
            <Input
              id="title"
              v-model="projectData.title"
              placeholder="Enter a name for your project"
              :class="{ 'border-destructive': formErrors.title }"
              class="h-14"
            />
            <p v-if="formErrors.title" class="text-sm text-destructive">
              {{ formErrors.title }}
            </p>
          </div>

          <!-- Project Type -->
          <div class="space-y-2">
            <Label for="type"
              >Project Type <span class="text-destructive">*</span></Label
            >
            <Select v-model="projectData.type">
              <SelectTrigger
                class="h-14"
                :class="{ 'border-destructive': formErrors.type }"
              >
                <SelectValue placeholder="Select project type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="type in projectTypes"
                  :key="type.value"
                  :value="type.value"
                >
                  {{ type.label }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="formErrors.type" class="text-sm text-destructive">
              {{ formErrors.type }}
            </p>
          </div>

          <!-- Project Description -->
          <div class="space-y-2">
            <Label for="description">Project Description</Label>
            <Textarea
              id="description"
              v-model="projectData.description"
              placeholder="Briefly describe your project"
              rows="4"
            />
          </div>

          <!-- Budget -->
          <div class="space-y-2">
            <Label for="budget">Estimated Budget (£)</Label>
            <Input
              id="budget"
              v-model="projectData.budget"
              type="number"
              min="0"
              placeholder="Enter your budget"
              class="h-14"
            />
          </div>

          <!-- Requirements -->
          <div class="space-y-2">
            <Label for="requirements">Project Requirements</Label>
            <Textarea
              id="requirements"
              v-model="projectData.requirements"
              placeholder="Detail any specific requirements or features for your project"
              rows="6"
            />
          </div>

          <!-- Submit Button -->
          <div class="pt-4">
            <Button type="submit" class="w-full h-14" :disabled="isSubmitting">
              <span v-if="isSubmitting" class="mr-2">
                <div
                  class="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                ></div>
              </span>
              {{
                isSubmitting ? "Creating Project..." : "Submit Project Request"
              }}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
