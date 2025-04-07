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
        "Explore our comprehensive web development services including custom websites, e-commerce solutions, and UI/UX design.",
    },
  ],
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
          <!-- Web Development Card -->
          <Card
            class="overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-0 bg-gradient-to-br from-background to-muted/50"
          >
            <div
              class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/50"
            ></div>
            <CardHeader class="pb-3">
              <div
                class="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 border border-primary/20"
              >
                <Code class="h-8 w-8 text-primary" />
              </div>
              <CardTitle class="text-2xl font-bold">Web Development</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-muted-foreground mb-6">
                Custom websites built with modern technologies, optimized for
                performance and user experience.
              </p>
              <ul class="mt-4 space-y-4">
                <li class="flex items-start">
                  <div
                    class="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-3"
                  >
                    <Check class="h-4 w-4 text-primary" />
                  </div>
                  <span>Responsive design for all devices</span>
                </li>
                <li class="flex items-start">
                  <div
                    class="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-3"
                  >
                    <Check class="h-4 w-4 text-primary" />
                  </div>
                  <span>SEO optimization for better visibility</span>
                </li>
                <li class="flex items-start">
                  <div
                    class="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-3"
                  >
                    <Check class="h-4 w-4 text-primary" />
                  </div>
                  <span>Performance focused implementation</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="default" class="w-full group">
                <span class="flex items-center justify-center">
                  Learn More
                  <ArrowRight
                    class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                  />
                </span>
              </Button>
            </CardFooter>
          </Card>

          <!-- UI/UX Design Card -->
          <Card
            class="overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-0 bg-gradient-to-br from-background to-muted/50"
          >
            <div
              class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/50"
            ></div>
            <CardHeader class="pb-3">
              <div
                class="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 border border-primary/20"
              >
                <Paintbrush class="h-8 w-8 text-primary" />
              </div>
              <CardTitle class="text-2xl font-bold">UI/UX Design</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-muted-foreground mb-6">
                Beautiful, intuitive interfaces that engage users and drive
                conversions.
              </p>
              <ul class="mt-4 space-y-4">
                <li class="flex items-start">
                  <div
                    class="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-3"
                  >
                    <Check class="h-4 w-4 text-primary" />
                  </div>
                  <span>User-centered design approach</span>
                </li>
                <li class="flex items-start">
                  <div
                    class="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-3"
                  >
                    <Check class="h-4 w-4 text-primary" />
                  </div>
                  <span>Interactive prototyping</span>
                </li>
                <li class="flex items-start">
                  <div
                    class="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-3"
                  >
                    <Check class="h-4 w-4 text-primary" />
                  </div>
                  <span>Cross-platform consistency</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="default" class="w-full group">
                <span class="flex items-center justify-center">
                  Learn More
                  <ArrowRight
                    class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                  />
                </span>
              </Button>
            </CardFooter>
          </Card>

          <!-- E-Commerce Card -->
          <Card
            class="overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-0 bg-gradient-to-br from-background to-muted/50"
          >
            <div
              class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/50"
            ></div>
            <CardHeader class="pb-3">
              <div
                class="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 border border-primary/20"
              >
                <ShoppingCart class="h-8 w-8 text-primary" />
              </div>
              <CardTitle class="text-2xl font-bold"
                >E-Commerce Solutions</CardTitle
              >
            </CardHeader>
            <CardContent>
              <p class="text-muted-foreground mb-6">
                Powerful online stores with secure payment processing and
                inventory management.
              </p>
              <ul class="mt-4 space-y-4">
                <li class="flex items-start">
                  <div
                    class="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-3"
                  >
                    <Check class="h-4 w-4 text-primary" />
                  </div>
                  <span>Secure payment integration</span>
                </li>
                <li class="flex items-start">
                  <div
                    class="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-3"
                  >
                    <Check class="h-4 w-4 text-primary" />
                  </div>
                  <span>Inventory management</span>
                </li>
                <li class="flex items-start">
                  <div
                    class="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-3"
                  >
                    <Check class="h-4 w-4 text-primary" />
                  </div>
                  <span>Mobile-optimized checkout</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="default" class="w-full group">
                <span class="flex items-center justify-center">
                  Learn More
                  <ArrowRight
                    class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                  />
                </span>
              </Button>
            </CardFooter>
          </Card>
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
    <section id="additional-services" class="py-20 bg-muted/50">
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
            Comprehensive solutions to support your digital growth
          </p>
        </div>

        <div class="grid gap-8 md:grid-cols-2">
          <Card
            v-for="service in additionalServices"
            :key="service.name"
            class="overflow-hidden rounded-2xl shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 bg-gradient-to-br from-background to-muted/50"
          >
            <div
              class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-primary/20"
            ></div>
            <CardHeader class="pb-2">
              <div
                class="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-3 border border-primary/20"
              >
                <component :is="service.icon" class="h-7 w-7 text-primary" />
              </div>
              <CardTitle class="text-xl font-bold">{{
                service.name
              }}</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-muted-foreground">{{ service.description }}</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" class="w-full group">
                <span class="flex items-center justify-center">
                  Explore Service
                  <ArrowRight
                    class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                  />
                </span>
              </Button>
            </CardFooter>
          </Card>
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
            Ready to Transform Your Online Presence?
          </h2>
          <p class="text-lg text-primary-foreground/90 mb-8">
            Let's discuss how we can help your business succeed in the digital
            world.
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
