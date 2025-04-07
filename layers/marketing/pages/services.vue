<script setup lang="ts">
import {
  Briefcase,
  Code,
  Layout,
  ShoppingCart,
  Paintbrush,
  Check,
  Rocket,
  Search,
  Share2,
  Smartphone,
  Globe,
  Shield,
  Wrench,
  Zap,
  PaintBucket,
  FileText,
  Layers,
  MessageSquare,
  RefreshCw,
  Clock,
  ArrowRight,
} from "lucide-vue-next";
import { site } from "~/utils/config/site";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";

definePageMeta({
  layout: "default",
});

// Set page meta information
useHead({
  title: `Services | ${site.company.name} ${site.nameSuffix}`,
  meta: [
    {
      name: "description",
      content:
        "Explore our web development services including custom websites, responsive design, and UI/UX solutions.",
    },
  ],
});

// Service offerings
const services = [
  {
    title: "Web Development",
    icon: Code,
    description:
      "Custom websites built with modern technologies that perform well and look great on all devices.",
    features: [
      "Responsive design for all devices",
      "SEO-friendly structure",
      "Performance optimization",
      "Modern, clean code",
    ],
  },
  {
    title: "UI/UX Design",
    icon: Paintbrush,
    description:
      "Beautiful, intuitive interfaces designed with your users in mind to enhance engagement and conversion.",
    features: [
      "User-centered design approach",
      "Interactive prototyping",
      "Cross-device consistency",
      "Accessibility compliance",
    ],
  },
  {
    title: "E-Commerce Solutions",
    icon: ShoppingCart,
    description:
      "Online stores built to showcase your products and make selling online simple and secure.",
    features: [
      "Secure payment integration",
      "Product management",
      "Mobile-optimized checkout",
      "Customer account management",
    ],
  },
];

// Service approaches - what makes us different
const approaches = [
  {
    title: "Collaborative Process",
    icon: MessageSquare,
    description:
      "We work closely with you throughout the entire project, ensuring clear communication and your vision guides our work.",
  },
  {
    title: "Quality Focus",
    icon: Check,
    description:
      "We prioritize quality in every aspect of our work, from clean code to beautiful design and thorough testing.",
  },
  {
    title: "Timely Delivery",
    icon: Clock,
    description:
      "We respect deadlines and keep you updated on progress to ensure your project launches on schedule.",
  },
  {
    title: "Future-Proof Solutions",
    icon: Rocket,
    description:
      "We build with scalability in mind so your digital presence can grow alongside your business.",
  },
];

// Additional services
const additionalServices = [
  {
    name: "SEO Services",
    description:
      "Improve your search engine rankings and drive organic traffic",
    icon: Search,
  },
  {
    name: "Website Maintenance",
    description: "Keep your website secure, updated, and performing optimally",
    icon: Wrench,
  },
  {
    name: "Performance Optimization",
    description: "Speed up your website and improve user experience",
    icon: Zap,
  },
  {
    name: "Responsive Design",
    description: "Ensure your website works perfectly on all devices",
    icon: Smartphone,
  },
];
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="relative py-20 px-4 overflow-hidden bg-background">
      <div class="container mx-auto relative z-10">
        <div class="max-w-3xl mx-auto text-center">
          <h1
            class="text-4xl font-bold tracking-tight sm:text-6xl text-foreground"
          >
            Web Development Services
          </h1>
          <p class="mt-6 text-lg leading-8 text-muted-foreground">
            Bringing your ideas to life with custom web solutions tailored to
            your unique needs.
          </p>
        </div>
      </div>
    </section>

    <!-- Main Services -->
    <section id="services" class="py-20 bg-muted/50">
      <div class="container px-4 mx-auto">
        <div class="max-w-3xl mx-auto mb-12 text-center">
          <div
            class="inline-flex items-center px-4 py-2 mb-4 rounded-full bg-background text-muted-foreground text-sm font-medium"
          >
            <Briefcase class="h-4 w-4 mr-2" />
            <span>Core Services</span>
          </div>
          <h2
            class="text-4xl font-bold tracking-tight sm:text-5xl text-foreground mb-6"
          >
            What We Offer
          </h2>
          <p class="text-lg text-muted-foreground">
            Professional web development services tailored to your business
            goals
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <!-- Service Cards -->
          <Card
            v-for="service in services"
            :key="service.title"
            class="overflow-hidden rounded-2xl shadow-lg hover:shadow-xl border-0 bg-gradient-to-br from-background to-muted/50"
          >
            <div
              class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/50"
            ></div>
            <CardHeader class="pb-3">
              <div
                class="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 border border-primary/20"
              >
                <component :is="service.icon" class="h-8 w-8 text-primary" />
              </div>
              <CardTitle class="text-2xl font-bold">{{
                service.title
              }}</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-muted-foreground mb-6">
                {{ service.description }}
              </p>
              <ul class="mt-4 space-y-4">
                <li
                  v-for="feature in service.features"
                  :key="feature"
                  class="flex items-start"
                >
                  <div
                    class="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-3"
                  >
                    <Check class="h-4 w-4 text-primary" />
                  </div>
                  <span>{{ feature }}</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="default" class="w-full group">
                <NuxtLink
                  to="/contact"
                  class="flex items-center justify-center w-full"
                >
                  Get a Quote
                  <ArrowRight
                    class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                  />
                </NuxtLink>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>

    <!-- Our Approach Section -->
    <section class="py-20 bg-gray-100">
      <div class="container px-4 mx-auto">
        <div class="max-w-3xl mx-auto mb-16 text-center">
          <div
            class="inline-flex items-center px-4 py-2 mb-4 rounded-full bg-primary/10 text-primary text-sm font-medium"
          >
            <Rocket class="h-4 w-4 mr-2" />
            <span>Our Approach</span>
          </div>
          <h2 class="text-4xl font-bold mb-6">How We Work With You</h2>
          <p class="text-lg text-muted-foreground">
            While we're a new agency, our approach ensures quality results for
            every project
          </p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <div
            v-for="approach in approaches"
            :key="approach.title"
            class="group bg-card rounded-xl shadow-sm hover:shadow-md overflow-hidden border border-border/10"
          >
            <div
              class="h-1 w-full bg-gradient-to-r from-primary to-primary/50"
            ></div>
            <div class="p-6 flex flex-col h-full">
              <div class="mb-4">
                <div
                  class="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 border border-primary/20 group-hover:bg-primary/20 transition-colors"
                >
                  <component :is="approach.icon" class="h-6 w-6 text-primary" />
                </div>
                <h3 class="text-lg font-bold mb-2">{{ approach.title }}</h3>
              </div>
              <p class="text-muted-foreground text-sm">
                {{ approach.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Note Section -->
    <section class="py-20 bg-muted/30">
      <div class="container px-4 mx-auto">
        <div class="max-w-3xl mx-auto text-center">
          <h2 class="text-3xl font-bold mb-6">Flexible Pricing</h2>
          <p class="text-lg text-muted-foreground mb-8">
            Every project is unique, so we create custom quotes based on your
            specific requirements rather than offering fixed-price packages.
            This ensures you get exactly what you need without paying for
            features you don't.
          </p>

          <Button
            as-child
            size="lg"
            class="px-8 h-14 rounded-xl font-medium text-base group"
          >
            <NuxtLink to="/contact" class="flex items-center">
              Request a Free Quote
              <ArrowRight
                class="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"
              />
            </NuxtLink>
          </Button>
        </div>
      </div>
    </section>

    <!-- Additional Services -->
    <section id="additional-services" class="py-20 bg-gray-100">
      <div class="container px-4 mx-auto">
        <div class="max-w-3xl mx-auto mb-12 text-center">
          <div
            class="inline-flex items-center px-4 py-2 mb-4 rounded-full bg-background text-muted-foreground text-sm font-medium"
          >
            <Rocket class="h-4 w-4 mr-2" />
            <span>Specialized Solutions</span>
          </div>
          <h2
            class="text-3xl font-bold tracking-tight sm:text-4xl text-foreground mb-6"
          >
            Additional Services
          </h2>
          <p class="text-lg text-muted-foreground">
            Complementary solutions to enhance your web presence
          </p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <div
            v-for="service in additionalServices"
            :key="service.name"
            class="group bg-card rounded-xl shadow-sm hover:shadow-md duration-300 overflow-hidden border border-border/10"
          >
            <div
              class="h-1 w-full bg-gradient-to-r from-primary/50 to-primary/20"
            ></div>
            <div class="p-6 flex flex-col h-full">
              <div class="mb-4">
                <div
                  class="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 border border-primary/20 group-hover:bg-primary/20 transition-colors"
                >
                  <component :is="service.icon" class="h-6 w-6 text-primary" />
                </div>
                <h3 class="text-lg font-bold mb-2">{{ service.name }}</h3>
              </div>
              <p class="text-muted-foreground text-sm flex-grow mb-4">
                {{ service.description }}
              </p>
              <NuxtLink
                to="/contact"
                class="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Learn More
                <ArrowRight
                  class="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                />
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 bg-primary">
      <div class="container px-4 mx-auto">
        <div class="max-w-3xl mx-auto text-center">
          <h2
            class="text-3xl font-bold tracking-tight text-primary-foreground sm:text-5xl mb-6"
          >
            Let's Build Something Amazing Together
          </h2>
          <p class="text-lg text-primary-foreground/90 mb-8">
            Ready to discuss your project? We offer free consultations to
            understand your needs and provide tailored solutions.
          </p>
          <div class="flex justify-center">
            <Button
              as-child
              variant="secondary"
              size="lg"
              class="px-8 h-14 rounded-xl font-medium text-base shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all group"
            >
              <NuxtLink to="/contact" class="flex items-center">
                Get in Touch
                <ArrowRight
                  class="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"
                />
              </NuxtLink>
            </Button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
