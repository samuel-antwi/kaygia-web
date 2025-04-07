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
  Building,
  CreditCard,
  Sparkles,
  Heart,
  Palette,
  PenTool,
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
import { Badge } from "~/components/ui/badge";

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

// Project categories/types we specialize in
const categories = [
  { id: "all", label: "All Services" },
  { id: "ecommerce", label: "E-Commerce" },
  { id: "corporate", label: "Corporate Sites" },
  { id: "webapp", label: "Web Apps" },
  { id: "branding", label: "Digital Branding" },
];

// Service offerings (combining project types and capabilities)
const services = [
  {
    id: 1,
    title: "E-Commerce Websites",
    category: "ecommerce",
    image:
      "https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=800&q=80",
    icon: ShoppingCart,
    description:
      "Online stores with secure payment processing, inventory management, and intuitive product browsing experiences.",
    capabilities: [
      "Product catalogs",
      "Secure checkout",
      "Customer accounts",
      "Order management",
      "Payment processing",
    ],
    designFocus:
      "Conversion-optimized layouts with clean product presentations and intuitive navigation paths.",
  },
  {
    id: 2,
    title: "Business & Corporate Sites",
    category: "corporate",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    icon: Building,
    description:
      "Professional websites that establish credibility and clearly communicate your company's value proposition to potential clients.",
    capabilities: [
      "Service showcases",
      "Team profiles",
      "Client testimonials",
      "Contact forms",
      "Custom layouts",
    ],
    designFocus:
      "Professional aesthetics with balanced visual hierarchy to effectively communicate brand values.",
  },
  {
    id: 3,
    title: "Web Applications",
    category: "webapp",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
    icon: Code,
    description:
      "Custom web applications with user authentication, data management, and interactive features to solve specific business challenges.",
    capabilities: [
      "User authentication",
      "Data visualization",
      "CRUD operations",
      "Real-time updates",
      "API integration",
    ],
    designFocus:
      "Intuitive UX design that simplifies complex workflows and enhances productivity.",
  },
  {
    id: 4,
    title: "Digital Brand Experiences",
    category: "branding",
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
    icon: Palette,
    description:
      "Cohesive digital brand experiences that extend your visual identity across web platforms with consistent messaging.",
    capabilities: [
      "Visual identity implementation",
      "Brand style guides",
      "Content strategy",
      "Multimedia integration",
      "Responsive design",
    ],
    designFocus:
      "Distinctive visual language that reinforces brand recognition across all touchpoints.",
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

// Design process steps
const designProcess = [
  {
    icon: MessageSquare,
    title: "Discovery & Strategy",
    description:
      "We start by understanding your business goals, target audience, and requirements to establish a solid project foundation.",
  },
  {
    icon: PenTool,
    title: "Design & Prototyping",
    description:
      "We create wireframes and interactive prototypes to visualize the user experience before development begins.",
  },
  {
    icon: Code,
    title: "Development",
    description:
      "We build your website or application using modern technologies and best practices for optimal performance.",
  },
  {
    icon: Sparkles,
    title: "Testing & Launch",
    description:
      "We thoroughly test across devices and browsers before helping you launch your project successfully.",
  },
];

// Featured technologies we work with
const technologies = [
  {
    name: "Vue.js",
    description:
      "Progressive JavaScript framework for building user interfaces",
  },
  {
    name: "Nuxt",
    description: "Vue framework for creating full-stack web applications",
  },
  {
    name: "Tailwind CSS",
    description: "Utility-first CSS framework for rapid UI development",
  },
  {
    name: "Supabase",
    description: "Open source Firebase alternative with PostgreSQL database",
  },
  {
    name: "Stripe",
    description: "Payment processing platform for online businesses",
  },
  {
    name: "TypeScript",
    description: "Typed superset of JavaScript for improved code quality",
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

// Filter state
const selectedCategory = ref("all");
const filteredServices = computed(() => {
  if (selectedCategory.value === "all") {
    return services;
  }
  return services.filter(
    (service) => service.category === selectedCategory.value
  );
});
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="relative py-20 px-4 overflow-hidden bg-gray-100">
      <div class="container mx-auto relative z-10">
        <div class="max-w-3xl mx-auto text-center">
          <div
            class="inline-flex items-center px-4 py-2 mb-4 rounded-full bg-primary/10 text-primary text-sm font-medium"
          >
            <Briefcase class="h-4 w-4 mr-2" />
            <span>Our Expertise</span>
          </div>
          <h1
            class="text-4xl font-bold tracking-tight sm:text-6xl text-foreground mb-6"
          >
            Our Services
          </h1>
          <p class="mt-6 text-lg leading-8 text-muted-foreground">
            We create custom web solutions tailored to your business needs,
            combining beautiful design with powerful functionality.
          </p>
        </div>
      </div>
    </section>

    <!-- Service Filter -->
    <section class="py-12 bg-muted/30">
      <div class="container mx-auto px-4">
        <div class="max-w-3xl mx-auto text-center mb-6">
          <p class="text-muted-foreground mb-6">
            While we're building our portfolio, here's a preview of the services
            we offer and our approach to creating exceptional digital
            experiences.
          </p>
        </div>
        <div class="flex flex-wrap justify-center gap-2">
          <Button
            v-for="category in categories"
            :key="category.id"
            :variant="selectedCategory === category.id ? 'default' : 'outline'"
            @click="selectedCategory = category.id"
            class="mb-2"
          >
            {{ category.label }}
          </Button>
        </div>
      </div>
    </section>

    <!-- Services Grid -->
    <section class="py-20 bg-gray-100">
      <div class="container px-4 mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div
            v-for="service in filteredServices"
            :key="service.id"
            class="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-border/10 flex flex-col"
          >
            <div class="relative h-60 overflow-hidden">
              <img
                :src="service.image"
                :alt="service.title"
                class="w-full h-full object-cover"
              />
              <div
                class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/50"
              ></div>
              <div
                class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4"
              >
                <div class="flex items-center gap-2">
                  <div
                    class="h-10 w-10 rounded-lg bg-primary/80 flex items-center justify-center"
                  >
                    <component :is="service.icon" class="h-5 w-5 text-white" />
                  </div>
                  <h3 class="text-xl font-bold text-white">
                    {{ service.title }}
                  </h3>
                </div>
              </div>
            </div>
            <div class="p-6 flex-grow">
              <p class="text-muted-foreground mb-6">
                {{ service.description }}
              </p>

              <div class="mb-6">
                <h4 class="text-sm font-semibold text-primary mb-2">
                  CAPABILITIES
                </h4>
                <div class="flex flex-wrap gap-2">
                  <Badge
                    v-for="capability in service.capabilities"
                    :key="capability"
                    variant="outline"
                    class="font-normal"
                  >
                    {{ capability }}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 class="text-sm font-semibold text-primary mb-2">
                  DESIGN APPROACH
                </h4>
                <p class="text-sm text-muted-foreground">
                  {{ service.designFocus }}
                </p>
              </div>
            </div>
          </div>
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
    <section class="py-20">
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

    <!-- Design Process -->
    <section class="py-20 bg-gray-100">
      <div class="container px-4 mx-auto">
        <div class="max-w-3xl mx-auto text-center mb-12">
          <h2 class="text-3xl font-bold mb-4">Our Design Process</h2>
          <p class="text-muted-foreground">
            How we approach every project to deliver consistent results
          </p>
        </div>

        <div class="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <div
            v-for="(step, index) in designProcess"
            :key="index"
            class="group p-6 bg-card rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-center border border-border/10"
          >
            <div
              class="mx-auto mb-4 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors"
            >
              <component :is="step.icon" class="h-6 w-6 text-primary" />
            </div>
            <h3 class="font-bold mb-2">{{ step.title }}</h3>
            <p class="text-sm text-muted-foreground">{{ step.description }}</p>
            <div class="mt-4 text-sm font-medium text-primary">
              Step {{ index + 1 }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Additional Services -->
    <section id="additional-services" class="py-20 bg-gray-200">
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
            class="group bg-card rounded-xl shadow-sm hover:shadow-md overflow-hidden border border-border/10"
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
            class="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl mb-6"
          >
            Ready to bring your idea to life?
          </h2>
          <p class="text-lg text-primary-foreground/90 mb-8">
            We're excited to work on new projects and build our portfolio. Get
            in touch to discuss how we can create a custom solution for your
            business.
          </p>
          <div class="flex justify-center">
            <Button
              as-child
              variant="secondary"
              size="lg"
              class="px-8 h-14 rounded-xl font-medium text-base shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all group"
            >
              <NuxtLink to="/contact" class="flex items-center">
                Start a Conversation
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
