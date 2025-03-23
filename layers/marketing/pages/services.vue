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
  Newspaper,
  BarChart,
  Mail,
  UserPlus,
  CreditCard,
  PackageCheck,
  ClipboardList,
  HeadsetIcon,
} from "lucide-vue-next";
import type { SiteConfig } from "~/utils/types/site";
import site from "~/utils/config/site";

definePageMeta({
  layout: "default",
});

// Get site config with fallback
const { $site = site } = useNuxtApp();

useSeoMeta({
  title: `Services - ${$site.name}`,
  description:
    "Explore our comprehensive web development services including custom websites, e-commerce solutions, and UI/UX design.",
});

// Service packages with pricing
const packages = [
  {
    name: "Starter",
    price: "£1,999",
    duration: "one-time",
    description:
      "Perfect for small businesses looking to establish their online presence",
    features: [
      { text: "Custom Website Design", icon: PaintBucket },
      { text: "Mobile Responsive", icon: Smartphone },
      { text: "Up to 5 Pages", icon: FileText },
      { text: "Basic SEO Setup", icon: Search },
      { text: "Contact Form", icon: MessageSquare },
      { text: "2 Rounds of Revisions", icon: RefreshCw },
      { text: "1 Month Support", icon: Clock },
    ],
    badge: "",
    accent:
      "border-blue-400/20 bg-gradient-to-b from-blue-50/50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/10",
    buttonVariant: "outline",
  },
  {
    name: "Professional",
    price: "£3,999",
    duration: "one-time",
    description:
      "Ideal for growing businesses that need advanced functionality",
    features: [
      { text: "Everything in Starter", icon: Check },
      { text: "Up to 10 Pages", icon: Layers },
      { text: "Blog Integration", icon: Newspaper },
      { text: "Advanced SEO Package", icon: BarChart },
      { text: "Newsletter Integration", icon: Mail },
      { text: "Social Media Integration", icon: UserPlus },
      { text: "3 Months Support", icon: HeadsetIcon },
    ],
    badge: "Most Popular",
    accent:
      "border-primary/30 bg-gradient-to-b from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 shadow-md shadow-primary/5",
    buttonVariant: "default",
  },
  {
    name: "E-Commerce",
    price: "£6,499",
    duration: "one-time",
    description: "Complete solution for businesses ready to sell online",
    features: [
      { text: "Everything in Professional", icon: Check },
      { text: "E-Commerce Setup", icon: ShoppingCart },
      { text: "Product Management", icon: PackageCheck },
      { text: "Payment Gateway Integration", icon: CreditCard },
      { text: "Inventory Management", icon: ClipboardList },
      { text: "Order Tracking System", icon: Globe },
      { text: "6 Months Support", icon: HeadsetIcon },
    ],
    badge: "",
    accent:
      "border-violet-400/20 bg-gradient-to-b from-violet-50/50 to-violet-100/50 dark:from-violet-900/20 dark:to-violet-900/10",
    buttonVariant: "outline",
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
    name: "Mobile App Development",
    description: "Native and cross-platform mobile applications",
    icon: Smartphone,
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
            From custom websites to e-commerce solutions, we deliver digital
            experiences that drive results.
          </p>
        </div>
      </div>
    </section>

    <!-- Main Services -->
    <section id="services" class="py-16 bg-muted/50">
      <div class="container px-4 mx-auto">
        <div class="grid gap-8 md:grid-cols-3">
          <div
            class="p-6 transition-all bg-background rounded-lg shadow-sm hover:shadow-md"
          >
            <Code class="w-12 h-12 mb-4 text-primary" />
            <h3 class="mb-2 text-xl font-semibold">Web Development</h3>
            <p class="text-muted-foreground">
              Custom websites built with modern technologies, optimized for
              performance and user experience.
            </p>
          </div>
          <div
            class="p-6 transition-all bg-background rounded-lg shadow-sm hover:shadow-md"
          >
            <Paintbrush class="w-12 h-12 mb-4 text-primary" />
            <h3 class="mb-2 text-xl font-semibold">UI/UX Design</h3>
            <p class="text-muted-foreground">
              Beautiful, intuitive interfaces that engage users and drive
              conversions.
            </p>
          </div>
          <div
            class="p-6 transition-all bg-background rounded-lg shadow-sm hover:shadow-md"
          >
            <ShoppingCart class="w-12 h-12 mb-4 text-primary" />
            <h3 class="mb-2 text-xl font-semibold">E-Commerce Solutions</h3>
            <p class="text-muted-foreground">
              Powerful online stores with secure payment processing and
              inventory management.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section
      id="pricing"
      class="py-20 px-4 bg-background relative overflow-hidden"
    >
      <!-- Decorative elements -->
      <div
        aria-hidden="true"
        class="absolute inset-0 grid grid-cols-2 -space-x-52 opacity-20 dark:opacity-10"
      >
        <div
          class="blur-[106px] h-56 bg-gradient-to-br from-primary to-purple-400 dark:from-blue-700"
        ></div>
        <div
          class="blur-[106px] h-32 bg-gradient-to-r from-cyan-400 to-primary dark:to-indigo-600"
        ></div>
      </div>

      <div class="container mx-auto relative">
        <div class="max-w-3xl mx-auto mb-12 text-center">
          <h2
            class="text-4xl font-bold tracking-tight sm:text-5xl text-foreground"
          >
            Choose Your Package
          </h2>
          <p class="mt-4 text-xl text-muted-foreground">
            Select the perfect package for your business needs
          </p>
        </div>

        <div class="grid gap-10 md:grid-cols-3 lg:gap-12 xl:gap-16">
          <div
            v-for="pkg in packages"
            :key="pkg.name"
            class="relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:translate-y-[-8px]"
            :class="pkg.badge ? 'ring-2 ring-primary' : 'ring-1 ring-border'"
          >
            <!-- Badge (if available) -->
            <div v-if="pkg.badge" class="absolute top-0 right-0">
              <span
                class="inline-flex items-center rounded-bl-lg rounded-tr-lg bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
              >
                {{ pkg.badge }}
              </span>
            </div>

            <!-- Package header -->
            <div class="p-6 border-b" :class="pkg.accent">
              <h3 class="text-2xl font-bold text-foreground mb-1">
                {{ pkg.name }}
              </h3>
              <div class="flex items-baseline mt-4">
                <span
                  class="text-4xl font-extrabold tracking-tight text-foreground"
                  >{{ pkg.price }}</span
                >
                <span class="ml-2 text-sm text-muted-foreground">{{
                  pkg.duration
                }}</span>
              </div>
              <p class="mt-4 text-muted-foreground">
                {{ pkg.description }}
              </p>
            </div>

            <!-- Features list -->
            <div class="flex-1 p-6 bg-card/60 backdrop-blur-sm">
              <ul class="space-y-3">
                <li
                  v-for="feature in pkg.features"
                  :key="feature.text"
                  class="flex items-center p-2 rounded-lg transition-colors hover:bg-muted"
                >
                  <component
                    :is="feature.icon"
                    class="w-5 h-5 mr-3 text-primary flex-shrink-0"
                  />
                  <span class="text-foreground">{{ feature.text }}</span>
                </li>
              </ul>

              <Button
                class="mt-8 w-full"
                size="lg"
                :variant="
                  pkg.buttonVariant === 'default' ? 'default' : 'outline'
                "
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>

        <!-- Additional info -->
        <div class="mt-10 text-center">
          <p class="text-muted-foreground">
            Not sure which package is right for you?
            <NuxtLink
              to="/contact"
              class="font-medium text-primary hover:underline"
            >
              Contact us
            </NuxtLink>
            for a personalized recommendation.
          </p>
        </div>
      </div>
    </section>

    <!-- Additional Services -->
    <section id="additional-services" class="py-16 bg-muted/50">
      <div class="container px-4 mx-auto">
        <div class="max-w-3xl mx-auto mb-12 text-center">
          <h2
            class="text-3xl font-bold tracking-tight sm:text-4xl text-foreground"
          >
            Additional Services
          </h2>
          <p class="mt-4 text-lg text-muted-foreground">
            Comprehensive solutions to support your digital growth
          </p>
        </div>
        <div class="grid gap-8 md:grid-cols-2">
          <div
            v-for="service in additionalServices"
            :key="service.name"
            class="p-6 bg-background rounded-lg shadow-sm"
          >
            <component :is="service.icon" class="w-12 h-12 mb-4 text-primary" />
            <h3 class="mb-2 text-xl font-semibold text-foreground">
              {{ service.name }}
            </h3>
            <p class="text-muted-foreground">{{ service.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 bg-primary">
      <div class="container px-4 mx-auto">
        <div class="max-w-3xl mx-auto text-center">
          <h2
            class="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl"
          >
            Ready to Transform Your Online Presence?
          </h2>
          <p class="mt-4 text-lg text-primary-foreground/90">
            Let's discuss how we can help your business succeed in the digital
            world.
          </p>
          <Button class="mt-8" variant="secondary" size="lg"
            >Get in Touch</Button
          >
        </div>
      </div>
    </section>
  </div>
</template>
