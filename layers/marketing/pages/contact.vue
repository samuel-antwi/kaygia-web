<script setup lang="ts">
import { Mail, Phone, MapPin, Send, Clock } from "lucide-vue-next";
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
    details: "+1 (555) 123-4567",
    link: "tel:+15551234567",
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
    details: "123 Tech Street, San Francisco, CA 94107",
    link: "https://maps.google.com",
  },
  {
    icon: Clock,
    title: "Business Hours",
    details: "Monday - Friday: 9am - 5pm",
    link: null,
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
  phone: z.string().optional(),
  service: z.string().optional(),
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
    phone: "",
    service: "",
    message: "",
    agreement: false,
  },
  validateOnMount: false,
});

// Type-safe way to access errors
const getFieldError = (fieldName: keyof FormValues) => {
  return form.errors.value[fieldName];
};

// Form submission handler
const onSubmit = form.handleSubmit(async (values) => {
  isSubmitting.value = true;

  try {
    // Log form values to verify
    console.log("Form values submitted:", values);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Reset form
    form.resetForm();
    formSubmitted.value = true;
  } catch (error) {
    console.error("Form submission error:", error);
    // Handle error (would add toast notification in real implementation)
  } finally {
    isSubmitting.value = false;
  }
});
</script>

<template>
  <div class="min-h-screen bg-muted/50">
    <div class="container mx-auto py-16 px-4 sm:px-6 lg:py-24">
      <!-- Hero Section -->
      <div class="max-w-4xl mx-auto text-center mb-20">
        <h1 class="text-5xl font-bold tracking-tight sm:text-6xl mb-6">
          Get in Touch
        </h1>
        <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
          Have a project in mind or just want to say hello? We'd love to hear
          from you! Our team is ready to help turn your vision into reality.
        </p>
      </div>

      <!-- Contact Information Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
        <div
          v-for="(item, index) in contactInfo"
          :key="index"
          class="group bg-card rounded-xl p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center text-center border border-border/50 hover:border-primary/20"
        >
          <div
            class="bg-primary/5 p-4 rounded-xl mb-6 group-hover:bg-primary/10 transition-colors duration-300"
          >
            <component :is="item.icon" class="h-7 w-7 text-primary" />
          </div>
          <h3 class="text-lg font-semibold mb-3">{{ item.title }}</h3>
          <p class="text-muted-foreground mb-4">{{ item.details }}</p>
          <a
            v-if="item.link"
            :href="item.link"
            class="text-primary hover:text-primary/80 text-sm font-medium inline-flex items-center gap-2 group-hover:translate-x-1 transition-transform duration-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            Connect
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-arrow-right"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>

      <!-- Contact Form and Map -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <!-- Contact Form -->
        <div
          class="bg-card rounded-xl p-8 lg:p-10 shadow-sm border border-border/50"
        >
          <h2 class="text-3xl font-bold mb-8">Send Us a Message</h2>

          <div
            v-if="formSubmitted"
            class="bg-primary/5 border border-primary/10 p-8 rounded-xl text-center"
          >
            <div class="mb-6 flex justify-center">
              <div class="bg-primary/10 rounded-full p-4">
                <Send class="h-8 w-8 text-primary" />
              </div>
            </div>
            <h3 class="text-2xl font-semibold mb-3">Thank You!</h3>
            <p class="text-muted-foreground mb-6">
              Your message has been sent successfully. We'll get back to you as
              soon as possible.
            </p>
            <Button size="lg" variant="outline" @click="formSubmitted = false">
              Send Another Message
            </Button>
          </div>

          <form v-else @submit="onSubmit" class="space-y-6">
            <!-- Name -->
            <FormField v-slot="{ componentField }" name="name">
              <FormItem>
                <FormLabel class="text-sm font-medium">Name</FormLabel>
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
                <FormLabel class="text-sm font-medium">Email</FormLabel>
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

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Phone (Optional) -->
              <FormField v-slot="{ componentField }" name="phone">
                <FormItem>
                  <FormLabel class="text-sm font-medium"
                    >Phone (Optional)</FormLabel
                  >
                  <FormControl>
                    <Input
                      class="h-12"
                      type="tel"
                      placeholder="Your phone number"
                      v-bind="componentField"
                    />
                  </FormControl>
                </FormItem>
              </FormField>

              <!-- Service -->
              <FormField v-slot="{ componentField }" name="service">
                <FormItem>
                  <FormLabel class="text-sm font-medium"
                    >Service Interested In</FormLabel
                  >
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
                </FormItem>
              </FormField>
            </div>

            <!-- Message -->
            <FormField v-slot="{ componentField }" name="message">
              <FormItem>
                <FormLabel class="text-sm font-medium">Message</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us about your project or inquiry"
                    rows="5"
                    v-bind="componentField"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- Privacy Agreement -->
            <FormField v-slot="{ field, handleChange }" name="agreement">
              <FormItem
                class="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 bg-primary/5 border border-primary/10"
              >
                <FormControl>
                  <Checkbox
                    :checked="field.value"
                    @update:checked="(checked: boolean) => handleChange(checked)"
                    :id="field.name"
                  />
                </FormControl>
                <div class="space-y-1 leading-none">
                  <FormLabel
                    class="text-sm font-normal leading-relaxed"
                    :for="field.name"
                  >
                    By submitting this form, I agree to the
                    <a
                      href="#"
                      class="text-primary hover:text-primary/80 underline underline-offset-4"
                      >Privacy Policy</a
                    >
                    and consent to being contacted regarding my inquiry.
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
              class="w-full"
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
              <span v-else class="flex items-center gap-2">
                Send Message
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-send"
                >
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
              </span>
            </Button>
          </form>
        </div>

        <!-- Map and Office Info -->
        <div class="space-y-8">
          <!-- Map embed with overlay -->
          <div class="relative overflow-hidden rounded-xl shadow-sm">
            <div
              class="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent z-10 pointer-events-none"
            ></div>
            <img
              src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80"
              alt="Office location map"
              class="w-full aspect-[4/3] object-cover"
            />
          </div>

          <!-- FAQ Section -->
          <div class="bg-card rounded-xl p-8 shadow-sm border border-border/50">
            <h3 class="text-2xl font-bold mb-6">Frequently Asked Questions</h3>
            <Accordion type="single" collapsible class="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger class="text-left">
                  How do I get started with a new project?
                </AccordionTrigger>
                <AccordionContent class="text-muted-foreground">
                  Getting started is easy! Simply fill out our contact form with
                  your project details, and we'll get back to you within 24
                  hours to schedule a free consultation.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger class="text-left">
                  What is your typical timeline for projects?
                </AccordionTrigger>
                <AccordionContent class="text-muted-foreground">
                  Our timeline varies depending on the project scope. Simple
                  websites typically take 2-4 weeks, while complex web
                  applications may take 2-3 months or more. We'll provide a
                  detailed timeline during our initial consultation.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger class="text-left">
                  Do you offer ongoing support?
                </AccordionTrigger>
                <AccordionContent class="text-muted-foreground">
                  Yes, we offer various support and maintenance packages to keep
                  your website running smoothly. These include regular updates,
                  security monitoring, content updates, and technical support.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
