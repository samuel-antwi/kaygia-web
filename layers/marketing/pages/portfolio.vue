<script setup lang="ts">
import {
  ExternalLink,
  Code,
  Palette,
  LineChart,
  ShoppingCart,
  Users,
  Heart,
  Globe,
  Sparkles,
  Laptop,
  Scale,
  Building,
  CreditCard,
  BookOpen,
  PenTool,
  MessageSquare,
  Clock,
  Briefcase,
} from "lucide-vue-next";
import { site } from "~/utils/config/site";

// Set page meta information
useHead({
  title: `Portfolio | ${site.company.name} ${site.nameSuffix}`,
  meta: [
    {
      name: "description",
      content:
        "Explore the types of web development projects we specialize in, including our design approach and technical capabilities.",
    },
  ],
});

// Project categories/types we specialize in
const categories = [
  { id: "all", label: "All Types" },
  { id: "ecommerce", label: "E-Commerce" },
  { id: "corporate", label: "Corporate Sites" },
  { id: "webapp", label: "Web Apps" },
  { id: "branding", label: "Digital Branding" },
];

// Project types we can create (rather than specific projects)
const projectTypes = [
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

// Filter state
const selectedCategory = ref("all");
const filteredProjects = computed(() => {
  if (selectedCategory.value === "all") {
    return projectTypes;
  }
  return projectTypes.filter(
    (project) => project.category === selectedCategory.value
  );
});
</script>

<template>
  <div class="container mx-auto py-16 px-4 sm:px-6 lg:py-24">
    <!-- Hero Section -->
    <div class="max-w-3xl mx-auto text-center mb-16">
      <div
        class="inline-flex items-center px-4 py-2 mb-4 rounded-full bg-primary/10 text-primary text-sm font-medium"
      >
        <Briefcase class="h-4 w-4 mr-2" />
        <span>Our Expertise</span>
      </div>
      <h1 class="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
        Our Capabilities
      </h1>
      <p class="text-xl text-muted-foreground">
        While we're building our portfolio, here's a preview of the types of
        projects we specialize in and our approach to creating exceptional
        digital experiences.
      </p>
    </div>

    <!-- Filter Tabs -->
    <div class="flex flex-wrap justify-center gap-2 mb-12">
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

    <!-- Project Types Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-10 mb-24">
      <div
        v-for="project in filteredProjects"
        :key="project.id"
        class="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-border/10 flex flex-col"
      >
        <div class="relative h-60 overflow-hidden">
          <img
            :src="project.image"
            :alt="project.title"
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
                <component :is="project.icon" class="h-5 w-5 text-white" />
              </div>
              <h3 class="text-xl font-bold text-white">{{ project.title }}</h3>
            </div>
          </div>
        </div>
        <div class="p-6 flex-grow">
          <p class="text-muted-foreground mb-6">{{ project.description }}</p>

          <div class="mb-6">
            <h4 class="text-sm font-semibold text-primary mb-2">
              CAPABILITIES
            </h4>
            <div class="flex flex-wrap gap-2">
              <Badge
                v-for="capability in project.capabilities"
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
              {{ project.designFocus }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Design Process -->
    <div class="bg-muted rounded-xl p-8 mb-24">
      <div class="max-w-3xl mx-auto text-center mb-12">
        <h2 class="text-3xl font-bold mb-4">Our Design Process</h2>
        <p class="text-muted-foreground">
          How we approach every project to deliver consistent results
        </p>
      </div>

      <div class="grid md:grid-cols-4 gap-6">
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

    <!-- Technologies -->
    <div class="mb-24">
      <div class="max-w-3xl mx-auto text-center mb-12">
        <h2 class="text-3xl font-bold mb-4">Technologies We Use</h2>
        <p class="text-muted-foreground">
          Modern tools and frameworks that power our development process
        </p>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
        <div
          v-for="tech in technologies"
          :key="tech.name"
          class="p-6 bg-card rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-border/10"
        >
          <h3 class="font-bold text-lg mb-2">{{ tech.name }}</h3>
          <p class="text-sm text-muted-foreground">{{ tech.description }}</p>
        </div>
      </div>
    </div>

    <!-- CTA Section -->
    <div class="bg-primary rounded-xl p-10 text-center">
      <h2 class="text-2xl font-bold mb-4 text-primary-foreground">
        Ready to bring your idea to life?
      </h2>
      <p class="text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
        We're excited to work on new projects and build our portfolio. Get in
        touch to discuss how we can create a custom solution for your business.
      </p>
      <Button as-child variant="secondary" size="lg" class="font-medium">
        <NuxtLink to="/contact" class="flex items-center">
          Start a Conversation
          <ArrowRight
            class="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"
          />
        </NuxtLink>
      </Button>
    </div>
  </div>
</template>
