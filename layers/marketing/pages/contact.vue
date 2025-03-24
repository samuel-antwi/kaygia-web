<script setup lang="ts">
import { Mail, Phone, MapPin, Send, Clock } from "lucide-vue-next";

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

// Form data
const formData = reactive({
  name: "",
  email: "",
  phone: "",
  service: "",
  message: "",
  agreement: false,
});

// Form validation
const nameError = ref("");
const emailError = ref("");
const messageError = ref("");
const agreementError = ref("");
const formSubmitted = ref(false);
const isSubmitting = ref(false);

// Service options
const serviceOptions = [
  { value: "website-design", label: "Website Design & Development" },
  { value: "ecommerce", label: "E-Commerce Solutions" },
  { value: "web-app", label: "Web Application Development" },
  { value: "maintenance", label: "Website Maintenance" },
  { value: "seo", label: "SEO & Digital Marketing" },
  { value: "other", label: "Other Services" },
];

// Form submission
const validateForm = () => {
  let isValid = true;

  // Reset errors
  nameError.value = "";
  emailError.value = "";
  messageError.value = "";
  agreementError.value = "";

  // Validate name
  if (!formData.name.trim()) {
    nameError.value = "Name is required";
    isValid = false;
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.email.trim()) {
    emailError.value = "Email is required";
    isValid = false;
  } else if (!emailRegex.test(formData.email.trim())) {
    emailError.value = "Please enter a valid email address";
    isValid = false;
  }

  // Validate message
  if (!formData.message.trim()) {
    messageError.value = "Message is required";
    isValid = false;
  } else if (formData.message.length < 10) {
    messageError.value = "Message must be at least 10 characters";
    isValid = false;
  }

  // Validate agreement - temporarily set to true for testing
  if (!formData.agreement) {
    agreementError.value = "You must agree to our privacy policy";
    isValid = false;
  }

  console.log("Agreement value:", formData.agreement); // Debug log
  return isValid;
};

const submitForm = async () => {
  if (!validateForm()) return;

  isSubmitting.value = true;

  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Reset form
    formData.name = "";
    formData.email = "";
    formData.phone = "";
    formData.service = "";
    formData.message = "";
    formData.agreement = false;

    formSubmitted.value = true;
  } catch (error) {
    console.error("Form submission error:", error);
    // Handle error (would add toast notification in real implementation)
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="container mx-auto py-16 px-4 sm:px-6 lg:py-24">
    <!-- Hero Section -->
    <div class="max-w-3xl mx-auto text-center mb-16">
      <h1 class="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
        Get in Touch
      </h1>
      <p class="text-xl text-muted-foreground">
        Have a project in mind or just want to say hello? We'd love to hear from
        you!
      </p>
    </div>

    <!-- Contact Information Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
      <div
        v-for="(item, index) in contactInfo"
        :key="index"
        class="bg-card rounded-lg p-6 shadow-sm flex flex-col items-center text-center"
      >
        <div class="bg-primary/10 p-3 rounded-full mb-4">
          <component :is="item.icon" class="h-6 w-6 text-primary" />
        </div>
        <h3 class="text-lg font-semibold mb-2">{{ item.title }}</h3>
        <p class="text-muted-foreground mb-4">{{ item.details }}</p>
        <a
          v-if="item.link"
          :href="item.link"
          class="text-primary hover:text-primary/80 text-sm font-medium"
          target="_blank"
          rel="noopener noreferrer"
        >
          Connect
        </a>
      </div>
    </div>

    <!-- Contact Form and Map -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <!-- Contact Form -->
      <div class="bg-card rounded-lg p-8 shadow-sm">
        <h2 class="text-2xl font-bold mb-6">Send Us a Message</h2>

        <div
          v-if="formSubmitted"
          class="bg-primary/10 p-6 rounded-lg text-center"
        >
          <div class="mb-4 flex justify-center">
            <div class="bg-primary/20 rounded-full p-3">
              <Send class="h-6 w-6 text-primary" />
            </div>
          </div>
          <h3 class="text-xl font-semibold mb-2">Thank You!</h3>
          <p class="text-muted-foreground mb-4">
            Your message has been sent successfully. We'll get back to you as
            soon as possible.
          </p>
          <Button variant="outline" @click="formSubmitted = false">
            Send Another Message
          </Button>
        </div>

        <form v-else @submit.prevent="submitForm" class="space-y-6">
          <!-- Name -->
          <div class="space-y-2">
            <Label for="name">Name</Label>
            <Input
              id="name"
              v-model="formData.name"
              type="text"
              placeholder="Your full name"
              :class="{ 'border-destructive': nameError }"
            />
            <p v-if="nameError" class="text-sm text-destructive">
              {{ nameError }}
            </p>
          </div>

          <!-- Email -->
          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input
              id="email"
              v-model="formData.email"
              type="email"
              placeholder="your.email@example.com"
              :class="{ 'border-destructive': emailError }"
            />
            <p v-if="emailError" class="text-sm text-destructive">
              {{ emailError }}
            </p>
          </div>

          <!-- Phone (Optional) -->
          <div class="space-y-2">
            <Label for="phone">Phone (Optional)</Label>
            <Input
              id="phone"
              v-model="formData.phone"
              type="tel"
              placeholder="Your phone number"
            />
          </div>

          <!-- Service -->
          <div class="space-y-2">
            <Label for="service">Service Interested In</Label>
            <Select v-model="formData.service">
              <SelectTrigger>
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
          </div>

          <!-- Message -->
          <div class="space-y-2">
            <Label for="message">Message</Label>
            <Textarea
              id="message"
              v-model="formData.message"
              placeholder="Tell us about your project or inquiry"
              rows="4"
              :class="{ 'border-destructive': messageError }"
            />
            <p v-if="messageError" class="text-sm text-destructive">
              {{ messageError }}
            </p>
          </div>

          <!-- Privacy Agreement -->
          <div class="space-y-2">
            <div class="flex items-start space-x-2">
              <input
                type="checkbox"
                id="agreement"
                v-model="formData.agreement"
                class="h-4 w-4 rounded border-input bg-background"
              />
              <label for="agreement" class="text-sm leading-tight">
                By submitting this form, I agree to the
                <a href="#" class="text-primary hover:underline"
                  >Privacy Policy</a
                >
                and consent to being contacted regarding my inquiry.
              </label>
            </div>
            <p v-if="agreementError" class="text-sm text-destructive">
              {{ agreementError }}
            </p>
          </div>

          <!-- Submit Button -->
          <Button type="submit" class="w-full" :disabled="isSubmitting">
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

      <!-- Map and Office Info -->
      <div class="space-y-8">
        <!-- Map embed (placeholder) - Using Unsplash image instead of local path -->
        <div class="aspect-video bg-muted rounded-lg overflow-hidden shadow-sm">
          <img
            src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80"
            alt="Office location map"
            class="w-full h-full object-cover"
          />
        </div>

        <!-- FAQ Quick Links -->
        <div class="bg-card rounded-lg p-8 shadow-sm">
          <h3 class="text-xl font-bold mb-4">Frequently Asked Questions</h3>
          <div class="space-y-4">
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger
                  >How do I get started with a new project?</AccordionTrigger
                >
                <AccordionContent>
                  Getting started is easy! Simply fill out our contact form with
                  your project details, and we'll get back to you within 24
                  hours to schedule a free consultation.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger
                  >What is your typical timeline for projects?</AccordionTrigger
                >
                <AccordionContent>
                  Our timeline varies depending on the project scope. Simple
                  websites typically take 2-4 weeks, while complex web
                  applications may take 2-3 months or more. We'll provide a
                  detailed timeline during our initial consultation.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger
                  >Do you offer ongoing support?</AccordionTrigger
                >
                <AccordionContent>
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
