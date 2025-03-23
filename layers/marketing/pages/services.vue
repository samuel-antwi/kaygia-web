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
  },
  {
    name: "Professional",
    price: "£3,999",
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
  },
  {
    name: "E-Commerce",
    price: "£6,499",
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
    <section class="relative py-20 overflow-hidden bg-background">
      <div class="container relative z-10">
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
      <div class="container mx-auto">
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
    <section id="pricing" class="py-16 bg-background">
      <div class="container mx-auto">
        <div class="max-w-3xl mx-auto mb-12 text-center">
          <h2
            class="text-3xl font-bold tracking-tight sm:text-4xl text-foreground"
          >
            Choose Your Package
          </h2>
          <p class="mt-4 text-lg text-muted-foreground">
            Select the perfect package for your business needs
          </p>
        </div>
        <div class="grid gap-8 md:grid-cols-3">
          <div
            v-for="pkg in packages"
            :key="pkg.name"
            class="flex flex-col p-6 bg-card rounded-lg shadow-sm"
          >
            <h3 class="text-2xl font-semibold text-foreground">
              {{ pkg.name }}
            </h3>
            <div class="mt-4 text-3xl font-bold text-primary">
              {{ pkg.price }}
            </div>
            <p class="mt-2 text-muted-foreground">{{ pkg.description }}</p>
            <ul class="flex-1 mt-6 space-y-4">
              <li
                v-for="feature in pkg.features"
                :key="feature.text"
                class="flex items-center"
              >
                <component
                  :is="feature.icon"
                  class="w-5 h-5 mr-2 text-primary"
                />
                <span class="text-foreground">{{ feature.text }}</span>
              </li>
            </ul>
            <Button class="mt-8" variant="default" size="lg"
              >Get Started</Button
            >
          </div>
        </div>
      </div>
    </section>

    <!-- Additional Services -->
    <section id="additional-services" class="py-16 bg-muted/50">
      <div class="container mx-auto">
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
      <div class="container">
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
