<script setup lang="ts">
import { ArrowLeft, ArrowRight, CheckCircle, Globe, Paintbrush, ShoppingCart, Smartphone, Megaphone, Settings as SettingsIcon, Package, AlertCircle } from "lucide-vue-next";
import { useProjectStore } from "#layers/dashboard/stores/projectStore";
import type { CreateProjectPayload, ProjectType } from "../../../types/project";

definePageMeta({
  layout: "dashboard",
  middleware: "auth",
});

// Initialize the project store
const projectStore = useProjectStore();
const router = useRouter();

// Multi-step form state
const currentStep = ref(1);
const totalSteps = 4;

// Form data for new project
const projectData = reactive<CreateProjectPayload>({
  title: "",
  description: "",
  type: "WEBSITE",
  budget: undefined,
  requirements: "",
  timelinePreference: "",
  preferredLaunchDate: "",
  maintenanceRequired: false,
  hostingPreference: "",
  domainStatus: "",
  integrationsNeeded: [],
  performanceRequirements: "",
  seoRequirements: "",
  contentReadiness: "",
  brandAssetsStatus: "",
  competitorReferences: "",
  cmsRequired: false,
  targetAudience: "",
  businessGoals: "",
  successMetrics: "",
  complianceRequirements: [],
  keyStakeholders: "",
  approvalProcess: "",
});

// Form validation state
const formErrors = reactive({
  title: "",
  type: "",
  timelinePreference: "",
  hostingPreference: "",
  contentReadiness: "",
  targetAudience: "",
  communicationPreference: "",
  general: "",
});

// Loading state
const isSubmitting = ref(false);

// Enhanced project types with descriptions and icons
const projectTypes = [
  { 
    value: "WEBSITE", 
    label: "Business Website", 
    icon: Globe,
    description: "Professional website to showcase your business and services",
    features: ["Responsive design", "SEO optimized", "Contact forms", "Content management"]
  },
  { 
    value: "E_COMMERCE", 
    label: "E-Commerce Store", 
    icon: ShoppingCart,
    description: "Online store to sell your products with payment integration",
    features: ["Product catalog", "Shopping cart", "Payment gateway", "Inventory management"]
  },
  { 
    value: "WEB_APP", 
    label: "Web Application", 
    icon: Package,
    description: "Custom web application with advanced functionality",
    features: ["User authentication", "Database integration", "API development", "Admin dashboard"]
  },
  { 
    value: "LANDING_PAGE", 
    label: "Landing Page", 
    icon: Paintbrush,
    description: "High-converting single page for campaigns or products",
    features: ["Conversion focused", "A/B testing ready", "Analytics integration", "Lead capture"]
  },
];

// Budget ranges
const budgetRanges = [
  { value: 2500, label: "£1,000 - £5,000", description: "Perfect for small business websites" },
  { value: 10000, label: "£5,000 - £15,000", description: "Ideal for e-commerce or web applications" },
  { value: 25000, label: "£15,000 - £35,000", description: "Complex applications and integrations" },
  { value: 50000, label: "£35,000+", description: "Enterprise solutions and custom development" },
];

// Timeline preferences
const timelineOptions = [
  { value: "rush", label: "Rush Job (2-4 weeks)", premium: true, description: "Priority development with dedicated resources" },
  { value: "standard", label: "Standard (6-12 weeks)", description: "Normal development timeline with quality assurance" },
  { value: "flexible", label: "Flexible (3-6 months)", description: "Best value with flexible scheduling" },
];

// Hosting preferences
const hostingOptions = [
  { value: "agency_managed", label: "Agency Managed", description: "We handle all hosting and maintenance" },
  { value: "cloud_provider", label: "Cloud Provider", description: "AWS, Google Cloud, or Azure hosting" },
  { value: "client_managed", label: "Client Managed", description: "You manage your own hosting solution" },
];

// Domain status options
const domainOptions = [
  { value: "new_domain", label: "Need New Domain", description: "Help me register a new domain name" },
  { value: "existing_domain", label: "Have Existing Domain", description: "I already own the domain" },
  { value: "subdomain", label: "Use Subdomain", description: "Create a subdomain of existing domain" },
];

// Content readiness options
const contentOptions = [
  { value: "client_provides", label: "I'll Provide Content", description: "I have all text, images, and copy ready" },
  { value: "need_copywriting", label: "Need Copywriting Help", description: "I need help creating content" },
  { value: "mixed", label: "Partial Content", description: "I have some content but need help with the rest" },
];

// Brand assets status
const brandAssetsOptions = [
  { value: "complete", label: "Complete Brand Package", description: "Logo, guidelines, and assets ready" },
  { value: "partial", label: "Some Brand Assets", description: "Have logo but need additional materials" },
  { value: "none", label: "Need Complete Branding", description: "Starting from scratch with brand identity" },
];


// Validation functions
const validateStep = (step: number): boolean => {
  // Reset errors for current step
  Object.keys(formErrors).forEach(key => {
    if (key !== 'general') formErrors[key as keyof typeof formErrors] = "";
  });

  let isValid = true;

  switch (step) {
    case 1: // Project Basics
      if (!projectData.title.trim()) {
        formErrors.title = "Project title is required";
        isValid = false;
      }
      if (!projectData.type) {
        formErrors.type = "Project type is required";
        isValid = false;
      }
      if (!projectData.timelinePreference) {
        formErrors.timelinePreference = "Timeline preference is required";
        isValid = false;
      }
      break;
    case 2: // Technical Requirements
      if (!projectData.hostingPreference) {
        formErrors.hostingPreference = "Hosting preference is required";
        isValid = false;
      }
      break;
    case 3: // Content & Design
      if (!projectData.contentReadiness) {
        formErrors.contentReadiness = "Content readiness status is required";
        isValid = false;
      }
      break;
    case 4: // Business Goals
      if (!projectData.targetAudience?.trim()) {
        formErrors.targetAudience = "Target audience information is required";
        isValid = false;
      }
      break;
  }

  return isValid;
};

// Navigation functions
const nextStep = () => {
  if (validateStep(currentStep.value) && currentStep.value < totalSteps) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const goToStep = (step: number) => {
  if (step <= currentStep.value || step === currentStep.value + 1) {
    currentStep.value = step;
  }
};

// Handle form submission
const handleSubmit = async () => {
  if (!validateStep(currentStep.value)) {
    return;
  }

  isSubmitting.value = true;

  try {
    const result = await projectStore.createProject(projectData);

    if (result.success && result.project) {
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

// Computed properties
const progressPercentage = computed(() => (currentStep.value / totalSteps) * 100);
const canGoBack = computed(() => currentStep.value > 1);
const canGoNext = computed(() => currentStep.value < totalSteps);
const isLastStep = computed(() => currentStep.value === totalSteps);

const selectedProjectType = computed(() => 
  projectTypes.find(type => type.value === projectData.type)
);

const estimatedTimeline = computed(() => {
  const base = selectedProjectType.value?.value === 'WEBSITE' ? 6 : 
               selectedProjectType.value?.value === 'E_COMMERCE' ? 10 : 
               selectedProjectType.value?.value === 'WEB_APP' ? 14 : 8;
  
  const multiplier = projectData.timelinePreference === 'rush' ? 0.5 : 
                    projectData.timelinePreference === 'flexible' ? 1.5 : 1;
  
  return Math.round(base * multiplier);
});
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <!-- Header -->
    <div class="mb-8">
      <Button variant="ghost" class="mb-4" as-child>
        <NuxtLink to="/dashboard/projects" class="flex items-center">
          <ArrowLeft class="mr-2 h-4 w-4" />
          Back to Projects
        </NuxtLink>
      </Button>

      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold">Request New Project</h1>
          <p class="text-muted-foreground mt-2">
            Let's gather all the details to create the perfect solution for you
          </p>
        </div>
        <div class="text-sm text-muted-foreground">
          Step {{ currentStep }} of {{ totalSteps }}
        </div>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="mb-8">
      <div class="flex justify-between text-sm font-medium text-muted-foreground mb-2">
        <span>Project Basics</span>
        <span>Technical</span>
        <span>Content & Design</span>
        <span>Business & Timeline</span>
      </div>
      <div class="w-full bg-muted rounded-full h-2">
        <div 
          class="bg-primary h-2 rounded-full transition-all duration-300"
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>
      <div class="flex justify-between mt-2">
        <button
          v-for="step in totalSteps"
          :key="step"
          @click="goToStep(step)"
          class="w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors"
          :class="[
            step <= currentStep 
              ? 'bg-primary border-primary text-primary-foreground' 
              : 'border-muted-foreground/30 text-muted-foreground hover:border-primary'
          ]"
        >
          <CheckCircle v-if="step < currentStep" class="h-4 w-4" />
          <span v-else>{{ step }}</span>
        </button>
      </div>
    </div>

    <!-- Form Steps -->
    <Card class="min-h-[600px]">
      <CardContent class="p-8">
        <!-- Step 1: Project Basics -->
        <div v-if="currentStep === 1" class="space-y-8">
          <div class="text-center mb-8">
            <h2 class="text-2xl font-bold mb-2">Project Basics</h2>
            <p class="text-muted-foreground">Tell us about your project vision</p>
          </div>

          <!-- Project Title -->
          <div class="space-y-2">
            <Label for="title">Project Title <span class="text-destructive">*</span></Label>
            <Input
              id="title"
              v-model="projectData.title"
              placeholder="e.g., Modern E-commerce Website for Fashion Brand"
              :class="{ 'border-destructive': formErrors.title }"
              class="h-12"
            />
            <p v-if="formErrors.title" class="text-sm text-destructive">
              {{ formErrors.title }}
            </p>
          </div>

          <!-- Project Type Selection -->
          <div class="space-y-4">
            <Label>Project Type <span class="text-destructive">*</span></Label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="type in projectTypes"
                :key="type.value"
                @click="projectData.type = type.value as ProjectType"
                class="p-4 border rounded-lg cursor-pointer transition-all hover:border-primary"
                :class="[
                  projectData.type === type.value 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border'
                ]"
              >
                <div class="flex items-start space-x-3">
                  <div class="p-2 bg-primary/10 rounded-lg">
                    <component :is="type.icon" class="h-5 w-5 text-primary" />
                  </div>
                  <div class="flex-1">
                    <h3 class="font-semibold">{{ type.label }}</h3>
                    <p class="text-sm text-muted-foreground mt-1">{{ type.description }}</p>
                    <div class="flex flex-wrap gap-1 mt-2">
                      <Badge v-for="feature in type.features.slice(0, 2)" :key="feature" variant="secondary" class="text-xs">
                        {{ feature }}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p v-if="formErrors.type" class="text-sm text-destructive">
              {{ formErrors.type }}
            </p>
          </div>

          <!-- Timeline Preference -->
          <div class="space-y-4">
            <Label>Timeline Preference <span class="text-destructive">*</span></Label>
            <div class="space-y-3">
              <div
                v-for="timeline in timelineOptions"
                :key="timeline.value"
                @click="projectData.timelinePreference = timeline.value"
                class="p-4 border rounded-lg cursor-pointer transition-all hover:border-primary"
                :class="[
                  projectData.timelinePreference === timeline.value 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border'
                ]"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <div class="flex items-center space-x-2">
                      <h3 class="font-semibold">{{ timeline.label }}</h3>
                      <Badge v-if="timeline.premium" variant="destructive" class="text-xs">Premium</Badge>
                    </div>
                    <p class="text-sm text-muted-foreground">{{ timeline.description }}</p>
                  </div>
                  <div class="w-4 h-4 border-2 rounded-full border-primary"
                       :class="projectData.timelinePreference === timeline.value ? 'bg-primary' : ''">
                  </div>
                </div>
              </div>
            </div>
            <p v-if="formErrors.timelinePreference" class="text-sm text-destructive">
              {{ formErrors.timelinePreference }}
            </p>
          </div>

          <!-- Budget Range -->
          <div class="space-y-4">
            <Label>Budget Range</Label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="range in budgetRanges"
                :key="range.value"
                @click="projectData.budget = range.value"
                class="p-4 border rounded-lg cursor-pointer transition-all hover:border-primary"
                :class="[
                  projectData.budget === range.value 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border'
                ]"
              >
                <h3 class="font-semibold">{{ range.label }}</h3>
                <p class="text-sm text-muted-foreground">{{ range.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: Technical Requirements -->
        <div v-if="currentStep === 2" class="space-y-8">
          <div class="text-center mb-8">
            <h2 class="text-2xl font-bold mb-2">Technical Requirements</h2>
            <p class="text-muted-foreground">Let's understand your technical needs</p>
          </div>

          <!-- Hosting Preference -->
          <div class="space-y-4">
            <Label>Hosting Preference <span class="text-destructive">*</span></Label>
            <div class="space-y-3">
              <div
                v-for="hosting in hostingOptions"
                :key="hosting.value"
                @click="projectData.hostingPreference = hosting.value"
                class="p-4 border rounded-lg cursor-pointer transition-all hover:border-primary"
                :class="[
                  projectData.hostingPreference === hosting.value 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border'
                ]"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="font-semibold">{{ hosting.label }}</h3>
                    <p class="text-sm text-muted-foreground">{{ hosting.description }}</p>
                  </div>
                  <div class="w-4 h-4 border-2 rounded-full border-primary"
                       :class="projectData.hostingPreference === hosting.value ? 'bg-primary' : ''">
                  </div>
                </div>
              </div>
            </div>
            <p v-if="formErrors.hostingPreference" class="text-sm text-destructive">
              {{ formErrors.hostingPreference }}
            </p>
          </div>

          <!-- Domain Status -->
          <div class="space-y-4">
            <Label>Domain Status</Label>
            <div class="space-y-3">
              <div
                v-for="domain in domainOptions"
                :key="domain.value"
                @click="projectData.domainStatus = domain.value"
                class="p-4 border rounded-lg cursor-pointer transition-all hover:border-primary"
                :class="[
                  projectData.domainStatus === domain.value 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border'
                ]"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="font-semibold">{{ domain.label }}</h3>
                    <p class="text-sm text-muted-foreground">{{ domain.description }}</p>
                  </div>
                  <div class="w-4 h-4 border-2 rounded-full border-primary"
                       :class="projectData.domainStatus === domain.value ? 'bg-primary' : ''">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Performance Requirements -->
          <div class="space-y-2">
            <Label for="performance">Performance Requirements</Label>
            <Textarea
              id="performance"
              v-model="projectData.performanceRequirements"
              placeholder="e.g., High traffic capacity, fast loading times, mobile optimization"
              rows="3"
            />
          </div>

          <!-- SEO Requirements -->
          <div class="space-y-2">
            <Label for="seo">SEO Requirements</Label>
            <Textarea
              id="seo"
              v-model="projectData.seoRequirements"
              placeholder="e.g., Target keywords, local SEO, competitor analysis needed"
              rows="3"
            />
          </div>
        </div>

        <!-- Step 3: Content & Design -->
        <div v-if="currentStep === 3" class="space-y-8">
          <div class="text-center mb-8">
            <h2 class="text-2xl font-bold mb-2">Content & Design</h2>
            <p class="text-muted-foreground">Help us understand your content and design needs</p>
          </div>

          <!-- Content Readiness -->
          <div class="space-y-4">
            <Label>Content Readiness <span class="text-destructive">*</span></Label>
            <div class="space-y-3">
              <div
                v-for="content in contentOptions"
                :key="content.value"
                @click="projectData.contentReadiness = content.value"
                class="p-4 border rounded-lg cursor-pointer transition-all hover:border-primary"
                :class="[
                  projectData.contentReadiness === content.value 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border'
                ]"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="font-semibold">{{ content.label }}</h3>
                    <p class="text-sm text-muted-foreground">{{ content.description }}</p>
                  </div>
                  <div class="w-4 h-4 border-2 rounded-full border-primary"
                       :class="projectData.contentReadiness === content.value ? 'bg-primary' : ''">
                  </div>
                </div>
              </div>
            </div>
            <p v-if="formErrors.contentReadiness" class="text-sm text-destructive">
              {{ formErrors.contentReadiness }}
            </p>
          </div>

          <!-- Brand Assets Status -->
          <div class="space-y-4">
            <Label>Brand Assets Status</Label>
            <div class="space-y-3">
              <div
                v-for="brand in brandAssetsOptions"
                :key="brand.value"
                @click="projectData.brandAssetsStatus = brand.value"
                class="p-4 border rounded-lg cursor-pointer transition-all hover:border-primary"
                :class="[
                  projectData.brandAssetsStatus === brand.value 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border'
                ]"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="font-semibold">{{ brand.label }}</h3>
                    <p class="text-sm text-muted-foreground">{{ brand.description }}</p>
                  </div>
                  <div class="w-4 h-4 border-2 rounded-full border-primary"
                       :class="projectData.brandAssetsStatus === brand.value ? 'bg-primary' : ''">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- CMS Required -->
          <div class="space-y-4">
            <div class="flex items-center space-x-2">
              <Checkbox 
                :model-value="projectData.cmsRequired" 
                @update:model-value="projectData.cmsRequired = $event as boolean"
              />
              <Label>Content Management System (CMS) Required</Label>
            </div>
            <p class="text-sm text-muted-foreground">
              Allow easy content updates without technical knowledge
            </p>
          </div>

          <!-- Competitor References -->
          <div class="space-y-2">
            <Label for="competitors">Competitor/Reference Websites</Label>
            <Textarea
              id="competitors"
              v-model="projectData.competitorReferences"
              placeholder="e.g., website1.com - like their navigation, website2.com - like their color scheme"
              rows="4"
            />
          </div>
        </div>

        <!-- Step 4: Business Goals & Timeline -->
        <div v-if="currentStep === 4" class="space-y-8">
          <div class="text-center mb-8">
            <h2 class="text-2xl font-bold mb-2">Business Goals & Timeline</h2>
            <p class="text-muted-foreground">Help us understand your business objectives and project timeline</p>
          </div>

          <!-- Target Audience -->
          <div class="space-y-2">
            <Label for="audience">Target Audience <span class="text-destructive">*</span></Label>
            <Textarea
              id="audience"
              v-model="projectData.targetAudience"
              placeholder="e.g., Young professionals aged 25-35, tech-savvy, value quality and convenience"
              rows="3"
              :class="{ 'border-destructive': formErrors.targetAudience }"
            />
            <p v-if="formErrors.targetAudience" class="text-sm text-destructive">
              {{ formErrors.targetAudience }}
            </p>
          </div>

          <!-- Business Goals -->
          <div class="space-y-2">
            <Label for="goals">Business Goals</Label>
            <Textarea
              id="goals"
              v-model="projectData.businessGoals"
              placeholder="e.g., Increase online sales by 50%, generate more qualified leads, improve brand awareness"
              rows="3"
            />
          </div>

          <!-- Success Metrics -->
          <div class="space-y-2">
            <Label for="metrics">Success Metrics</Label>
            <Textarea
              id="metrics"
              v-model="projectData.successMetrics"
              placeholder="e.g., 1000+ monthly visitors, 5% conversion rate, 100+ newsletter signups per month"
              rows="3"
            />
          </div>

          <!-- Preferred Launch Date -->
          <div class="space-y-2">
            <Label for="launch-date">Preferred Launch Date</Label>
            <Input
              id="launch-date"
              type="date"
              v-model="projectData.preferredLaunchDate"
              class="h-12"
            />
          </div>

          <!-- Key Stakeholders -->
          <div class="space-y-2">
            <Label for="stakeholders">Key Stakeholders</Label>
            <Textarea
              id="stakeholders"
              v-model="projectData.keyStakeholders"
              placeholder="e.g., John Smith (CEO) - final approvals, Jane Doe (Marketing Manager) - content review"
              rows="3"
            />
          </div>

          <!-- Project Description -->
          <div class="space-y-2">
            <Label for="description">Detailed Project Description</Label>
            <Textarea
              id="description"
              v-model="projectData.description"
              placeholder="Provide a comprehensive description of your project, including specific features and functionality you need"
              rows="5"
            />
          </div>

          <!-- Project Summary -->
          <Card class="bg-muted/50">
            <CardHeader>
              <CardTitle class="flex items-center space-x-2">
                <CheckCircle class="h-5 w-5 text-green-600" />
                <span>Project Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Project Type:</strong> {{ selectedProjectType?.label }}
                </div>
                <div>
                  <strong>Timeline:</strong> {{ projectData.timelinePreference }}
                </div>
                <div>
                  <strong>Budget Range:</strong> 
                  {{ budgetRanges.find(b => b.value === projectData.budget)?.label || 'Not specified' }}
                </div>
                <div>
                  <strong>Estimated Duration:</strong> ~{{ estimatedTimeline }} weeks
                </div>
              </div>
              
              <div v-if="projectData.timelinePreference === 'rush'" class="p-3 bg-orange-100 border border-orange-200 rounded-lg">
                <p class="text-sm text-orange-800">
                  <strong>Rush Job Notice:</strong> Priority development may include additional fees for dedicated resources and expedited delivery.
                </p>
              </div>
            </CardContent>
          </Card>

          <!-- Error Display -->
          <Alert v-if="formErrors.general" variant="destructive">
            <AlertCircle class="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{{ formErrors.general }}</AlertDescription>
          </Alert>
        </div>
      </CardContent>

      <!-- Navigation Footer -->
      <div class="border-t p-6">
        <div class="flex justify-between items-center">
          <Button 
            variant="outline" 
            @click="prevStep"
            :disabled="!canGoBack"
            class="flex items-center space-x-2"
          >
            <ArrowLeft class="h-4 w-4" />
            <span>Previous</span>
          </Button>

          <div class="text-sm text-muted-foreground">
            Step {{ currentStep }} of {{ totalSteps }}
          </div>

          <Button 
            v-if="!isLastStep"
            @click="nextStep"
            :disabled="!canGoNext"
            class="flex items-center space-x-2"
          >
            <span>Next</span>
            <ArrowRight class="h-4 w-4" />
          </Button>

          <Button 
            v-else
            @click="handleSubmit"
            :disabled="isSubmitting"
            class="flex items-center space-x-2"
          >
            <span v-if="isSubmitting" class="mr-2">
              <div class="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
            </span>
            <span>{{ isSubmitting ? "Creating Project..." : "Submit Project Request" }}</span>
          </Button>
        </div>
      </div>
    </Card>
  </div>
</template>