<script setup lang="ts">
import { Mail, Phone, MapPin } from "lucide-vue-next";
import { z } from "zod";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";

// Set page meta information
useHead({
  title: "Contact Us | Kaygia Web Development Agency",
  meta: [
    {
      name: "description",
      content:
        "Get in touch with Kaygia Web Development Agency for your web development needs. Contact us for a free consultation.",
    },
  ],
});

// Contact information
const contactInfo = [
  {
    icon: Phone,
    title: "Phone",
    details: "+44 (0) 20 1234 5678",
    link: "tel:+442012345678",
  },
  {
    icon: Mail,
    title: "Email",
    details: "hello@kaygia.com",
    link: "mailto:hello@kaygia.com",
  },
  {
    icon: MapPin,
    title: "Office",
    details: "123 Tech Street, London, EC2A 1NT",
    link: "https://maps.google.com",
  },
];

// Service options
const serviceOptions = [
  { value: "website-design", label: "Website Design & Development" },
  { value: "ecommerce", label: "E-Commerce Solutions" },
  { value: "web-app", label: "Web Application Development" },
  { value: "maintenance", label: "Website Maintenance" },
  { value: "seo", label: "SEO & Digital Marketing" },
  { value: "other", label: "Other Services" },
];

// Form state
const isSubmitting = ref(false);
const formSubmitted = ref(false);

// Define the form schema with Zod
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  service: z.string().min(1, "Please select a service"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  agreement: z.boolean().refine((val) => val === true, {
    message: "You must agree to our privacy policy",
  }),
});

// Type inference
type FormValues = z.infer<typeof formSchema>;

// Create form using vee-validate + zod
const form = useForm<FormValues>({
  validationSchema: toTypedSchema(formSchema),
  initialValues: {
    name: "",
    email: "",
    service: "",
    message: "",
    agreement: false,
  },
});

// Type-safe way to access errors
const getFieldError = (fieldName: keyof FormValues) => {
  return form.errors.value[fieldName];
};

// Form submission handler
const onSubmit = form.handleSubmit(async (values) => {
  isSubmitting.value = true;

  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Reset form
    form.resetForm();
    formSubmitted.value = true;
  } catch (error) {
    console.error("Form submission error:", error);
  } finally {
    isSubmitting.value = false;
  }
});
</script>

<template>
  <div class="relative min-h-screen bg-gray-100">
    <!-- Background Pattern -->
    <div
      class="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-[0.02]"
    />

    <!-- Main Content -->
    <div class="relative">
      <div
        class="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-32"
      >
        <!-- Hero Section -->
        <div class="max-w-3xl mx-auto text-center mb-16 lg:mb-24">
          <h1
            class="text-4xl md:text-5xl lg:text-6xl text-gray-800 font-bold mb-6"
          >
            Let's Build <br />
            Something Amazing
          </h1>
          <p
            class="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Have a project in mind? We're here to turn your vision into reality.
            Get in touch for a free consultation.
          </p>
        </div>

        <!-- Main Grid -->
        <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <!-- Left Column - Contact Form -->
          <div
            class="relative bg-card rounded-2xl p-4 lg:p-6 shadow-lg border border-border/50 order-2 lg:order-1"
          >
            <!-- Decorative Elements -->
            <div
              class="absolute -top-4 -left-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl"
            />
            <div
              class="absolute -bottom-4 -right-4 w-32 h-32 bg-secondary/10 rounded-full blur-2xl"
            />

            <!-- Form Content -->
            <div class="relative">
              <div v-if="formSubmitted" class="text-center py-12">
                <div
                  class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <Mail class="h-8 w-8 text-primary" />
                </div>
                <h3 class="text-2xl font-bold mb-4">Message Sent!</h3>
                <p class="text-muted-foreground mb-8">
                  Thank you for reaching out. We'll get back to you within 24
                  hours.
                </p>
                <Button
                  variant="outline"
                  size="lg"
                  @click="formSubmitted = false"
                >
                  Send Another Message
                </Button>
              </div>

              <form v-else @submit="onSubmit" class="space-y-6">
                <div class="grid sm:grid-cols-2 gap-6">
                  <!-- Name -->
                  <FormField v-slot="{ componentField }" name="name">
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          class="h-12"
                          placeholder="Your full name"
                          v-bind="componentField"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </FormField>

                  <!-- Email -->
                  <FormField v-slot="{ componentField }" name="email">
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          class="h-12"
                          type="email"
                          placeholder="your.email@example.com"
                          v-bind="componentField"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </FormField>
                </div>

                <!-- Service -->
                <FormField v-slot="{ componentField }" name="service">
                  <FormItem>
                    <FormLabel>Service Interested In</FormLabel>
                    <FormControl>
                      <Select v-bind="componentField">
                        <SelectTrigger class="h-12">
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            v-for="option in serviceOptions"
                            :key="option.value"
                            :value="option.value"
                          >
                            {{ option.label }}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <!-- Message -->
                <FormField v-slot="{ componentField }" name="message">
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about your project or inquiry"
                        rows="4"
                        v-bind="componentField"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <!-- Privacy Agreement -->
                <FormField v-slot="{ field, handleChange }" name="agreement">
                  <FormItem
                    class="flex flex-row items-start space-x-3 space-y-0 rounded-lg p-4 border border-border/50"
                  >
                    <FormControl>
                      <Checkbox
                        :checked="field.value"
                        @update:checked="
                          (checked: boolean) => handleChange(checked)
                        "
                        :id="field.name"
                      />
                    </FormControl>
                    <div class="space-y-1 leading-none">
                      <FormLabel class="text-sm font-normal" :for="field.name">
                        I agree to the
                        <a
                          href="#"
                          class="text-primary hover:text-primary/80 underline underline-offset-4"
                          >Privacy Policy</a
                        >
                      </FormLabel>
                      <p
                        v-if="getFieldError('agreement')"
                        class="text-sm font-medium text-destructive"
                      >
                        {{ getFieldError("agreement") }}
                      </p>
                    </div>
                  </FormItem>
                </FormField>

                <!-- Submit Button -->
                <Button
                  type="submit"
                  size="lg"
                  class="w-full h-12"
                  :disabled="
                    isSubmitting || Object.keys(form.errors.value).length > 0
                  "
                >
                  <span v-if="isSubmitting" class="flex items-center gap-2">
                    <span
                      class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                    ></span>
                    Sending...
                  </span>
                  <span v-else>Send Message</span>
                </Button>
              </form>
            </div>
          </div>

          <!-- Right Column - Contact Info -->
          <div class="space-y-8 lg:sticky lg:top-8 order-1 lg:order-2">
            <div>
              <h2 class="text-3xl font-bold mb-4">Get in Touch</h2>
              <p class="text-lg text-muted-foreground leading-relaxed">
                Whether you have a question about our services, pricing, or just
                want to say hello, we're here to help.
              </p>
            </div>

            <div class="grid gap-6">
              <div
                v-for="(item, index) in contactInfo"
                :key="index"
                class="group relative bg-card hover:bg-primary/5 rounded-xl p-6 transition-all duration-300 border border-border/50"
              >
                <div class="flex items-start gap-4">
                  <div
                    class="p-3 rounded-lg bg-primary/10 text-primary shrink-0"
                  >
                    <component :is="item.icon" class="h-6 w-6" />
                  </div>
                  <div>
                    <h3 class="font-semibold mb-1">{{ item.title }}</h3>
                    <a
                      :href="item.link"
                      class="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {{ item.details }}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Business Hours -->
            <div class="bg-card rounded-xl p-6 border border-border/50">
              <h3 class="font-semibold mb-2">Business Hours</h3>
              <p class="text-muted-foreground">
                Monday - Friday: 9:00 AM - 6:00 PM (GMT)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bg-grid-pattern {
  background-image: linear-gradient(
      to right,
      rgb(var(--primary) / 0.1) 1px,
      transparent 1px
    ),
    linear-gradient(to bottom, rgb(var(--primary) / 0.1) 1px, transparent 1px);
  background-size: 4rem 4rem;
}
</style>
