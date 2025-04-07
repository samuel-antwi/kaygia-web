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
} from "lucide-vue-next";
import { site } from "~/utils/config/site";

// Set page meta information
useHead({
  title: `Portfolio | ${site.company.name} ${site.nameSuffix}`,
  meta: [
    {
      name: "description",
      content:
        "Explore our portfolio of web development projects including e-commerce stores, corporate websites, web applications, and more.",
    },
  ],
});

// Project categories
const categories = [
  { id: "all", label: "All Projects" },
  { id: "ecommerce", label: "E-Commerce" },
  { id: "corporate", label: "Corporate" },
  { id: "webapp", label: "Web Applications" },
  { id: "branding", label: "Branding" },
];

// Project data with direct Unsplash URLs
const projects = [
  {
    id: 1,
    title: "Nova Fitness E-commerce",
    category: "ecommerce",
    image:
      "https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=800&q=80",
    icon: ShoppingCart,
    description:
      "A premium e-commerce platform for a fitness equipment retailer with custom product configurator and subscription management.",
    technologies: ["Vue.js", "Nuxt", "Tailwind CSS", "Supabase", "Stripe"],
    link: "#",
  },
  {
    id: 2,
    title: "Meridian Financial Services",
    category: "corporate",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    icon: LineChart,
    description:
      "A modern, responsive website for a financial services firm featuring interactive calculators and secure client portal.",
    technologies: ["Vue.js", "Nuxt", "Tailwind CSS", "Chart.js", "Auth0"],
    link: "#",
  },
  {
    id: 3,
    title: "Bloom Task Management App",
    category: "webapp",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
    icon: Code,
    description:
      "A feature-rich task management web application with team collaboration, timeline views, and integrated reporting.",
    technologies: ["Vue.js", "Nuxt", "Tailwind CSS", "Supabase", "WebSockets"],
    link: "#",
  },
  {
    id: 4,
    title: "Habitat Interior Design",
    category: "corporate",
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
    icon: Palette,
    description:
      "An elegant portfolio website for an interior design studio with immersive project showcases and virtual consultations.",
    technologies: ["Vue.js", "Nuxt", "GSAP", "Three.js", "Netlify"],
    link: "#",
  },
  {
    id: 5,
    title: "EcoCraft Marketplace",
    category: "ecommerce",
    image:
      "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=800&q=80",
    icon: ShoppingCart,
    description:
      "A sustainable products marketplace connecting eco-conscious consumers with artisans and small businesses.",
    technologies: ["Vue.js", "Nuxt", "Tailwind CSS", "Supabase", "Stripe"],
    link: "#",
  },
  {
    id: 6,
    title: "Nexus Community Platform",
    category: "webapp",
    image:
      "https://images.unsplash.com/photo-1522071901873-411886a10004?auto=format&fit=crop&w=800&q=80",
    icon: Users,
    description:
      "A community platform for tech professionals with forums, resource sharing, and event management features.",
    technologies: ["Vue.js", "Nuxt", "Tailwind CSS", "Firebase", "Algolia"],
    link: "#",
  },
  {
    id: 7,
    title: "Wellness Collective",
    category: "branding",
    image:
      "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80",
    icon: Heart,
    description:
      "Brand identity and website for a wellness center featuring online booking, practitioner profiles, and health resources.",
    technologies: [
      "Vue.js",
      "Nuxt",
      "Tailwind CSS",
      "Supabase",
      "Calendly API",
    ],
    link: "#",
  },
  {
    id: 8,
    title: "Global Explorers Travel",
    category: "corporate",
    image:
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80",
    icon: Globe,
    description:
      "A travel agency website with tour package customization, booking management, and integrated mapping features.",
    technologies: ["Vue.js", "Nuxt", "Tailwind CSS", "MapBox", "Strapi CMS"],
    link: "#",
  },
];

// Filter state
const selectedCategory = ref("all");
const filteredProjects = computed(() => {
  if (selectedCategory.value === "all") {
    return projects;
  }
  return projects.filter(
    (project) => project.category === selectedCategory.value
  );
});
</script>

<template>
  <div class="container mx-auto py-16 px-4 sm:px-6 lg:py-24">
    <!-- Hero Section -->
    <div class="max-w-3xl mx-auto text-center mb-20">
      <h1 class="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
        Our Portfolio
      </h1>
      <p class="text-xl text-muted-foreground">
        Explore our latest projects showcasing our expertise in web development,
        design, and digital strategy.
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

    <!-- Projects Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div
        v-for="project in filteredProjects"
        :key="project.id"
        class="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
      >
        <div class="relative h-60 overflow-hidden">
          <img
            :src="project.image"
            :alt="project.title"
            class="w-full h-full object-cover"
          />
          <div
            class="absolute inset-0 bg-primary/10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300"
          >
            <Button size="sm" variant="secondary" :as-child="true">
              <a
                :href="project.link"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-2"
              >
                View Project <ExternalLink class="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
        <div class="p-6">
          <div class="flex items-start justify-between mb-4">
            <h3 class="text-xl font-bold">{{ project.title }}</h3>
            <component :is="project.icon" class="h-5 w-5 text-primary" />
          </div>
          <p class="text-muted-foreground mb-4">{{ project.description }}</p>
          <div class="flex flex-wrap gap-2 mt-4">
            <Badge
              v-for="tech in project.technologies"
              :key="tech"
              variant="outline"
            >
              {{ tech }}
            </Badge>
          </div>
        </div>
      </div>
    </div>

    <!-- CTA Section -->
    <div class="mt-20 bg-muted rounded-lg p-8 text-center">
      <h2 class="text-2xl font-bold mb-4">Ready to start your project?</h2>
      <p class="text-muted-foreground mb-8 max-w-2xl mx-auto">
        We'd love to help bring your vision to life. Let's discuss how we can
        create a custom solution tailored to your needs.
      </p>
      <Button as-child>
        <NuxtLink to="/contact">Get in Touch</NuxtLink>
      </Button>
    </div>
  </div>
</template>
