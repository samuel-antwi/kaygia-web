<script setup lang="ts">
import { Code, Layout, Check, ShoppingCart, Paintbrush } from "lucide-vue-next";

definePageMeta({
  layout: "default",
});

const { $site } = useNuxtApp();

// Add meta tags for SEO
useHead({
  title: $site.seo.title,
  meta: [
    {
      name: "description",
      content: $site.seo.description,
    },
  ],
});
</script>

<template>
  <div class="relative min-h-[600px] overflow-hidden">
    <!-- Hero Background Image from Unsplash -->
    <div class="absolute inset-0 z-0">
      <img
        src="https://images.unsplash.com/photo-1581472723648-909f4851d4ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
        alt="Web Development"
        class="w-full h-full object-cover"
      />
      <div
        class="absolute inset-0 bg-gradient-to-r from-background/95 via-background/90 to-background/85 dark:from-background/95 dark:to-background/80"
      ></div>
    </div>

    <!-- Hero Content -->
    <div
      class="relative z-10 container mx-auto px-4 py-20 flex flex-col items-start justify-center h-full"
    >
      <div class="max-w-2xl text-white">
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
          Transform Your Online Presence with
          <span class="text-primary">Expert Web Development</span>
        </h1>
        <p class="text-lg md:text-xl text-white/90 mb-8">
          We build beautiful, functional websites that help your business stand
          out and succeed online.
        </p>
        <div class="flex flex-wrap gap-4">
          <Button class="px-8">Get Started</Button>
          <Button
            variant="outline"
            class="border-white text-white hover:bg-white/20"
            >View Our Work</Button
          >
        </div>
      </div>
    </div>
  </div>

  <!-- Our Services Section -->
  <section class="py-20 bg-muted/30">
    <div class="container mx-auto px-4">
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
        <p class="text-lg text-muted-foreground max-w-3xl mx-auto">
          We offer comprehensive web development solutions tailored to your
          business needs.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <!-- Web Development Card -->
        <Card
          class="overflow-hidden border-t-4 border-primary rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
        >
          <CardHeader class="pb-3">
            <div
              class="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-3"
            >
              <Code class="h-7 w-7 text-primary" />
            </div>
            <CardTitle class="text-xl font-bold">Web Development</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-muted-foreground mb-5">
              Custom websites built with the latest technologies, optimized for
              performance and user experience.
            </p>
            <ul class="mt-4 space-y-3">
              <li class="flex items-start bg-primary/5 p-2 rounded-lg">
                <Check class="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>Responsive design</span>
              </li>
              <li class="flex items-start bg-primary/5 p-2 rounded-lg">
                <Check class="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>SEO optimization</span>
              </li>
              <li class="flex items-start bg-primary/5 p-2 rounded-lg">
                <Check class="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>Performance focused</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              class="w-full border-primary/50 hover:bg-primary hover:text-white transition-all"
              as-child
            >
              <NuxtLink to="/services">Learn More</NuxtLink>
            </Button>
          </CardFooter>
        </Card>

        <!-- UI/UX Design Card -->
        <Card
          class="overflow-hidden border-t-4 border-primary rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
        >
          <CardHeader class="pb-3">
            <div
              class="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-3"
            >
              <Layout class="h-7 w-7 text-primary" />
            </div>
            <CardTitle class="text-xl font-bold">UI/UX Design</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-muted-foreground mb-5">
              Beautiful, intuitive interfaces designed with your users in mind
              for maximum engagement and conversion.
            </p>
            <ul class="mt-4 space-y-3">
              <li class="flex items-start bg-primary/5 p-2 rounded-lg">
                <Check class="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>User research</span>
              </li>
              <li class="flex items-start bg-primary/5 p-2 rounded-lg">
                <Check class="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>Wireframing & prototyping</span>
              </li>
              <li class="flex items-start bg-primary/5 p-2 rounded-lg">
                <Check class="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>User testing</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              class="w-full border-primary/50 hover:bg-primary hover:text-white transition-all"
              as-child
            >
              <NuxtLink to="/services">Learn More</NuxtLink>
            </Button>
          </CardFooter>
        </Card>

        <!-- E-Commerce Card -->
        <Card
          class="overflow-hidden border-t-4 border-primary rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
        >
          <CardHeader class="pb-3">
            <div
              class="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-3"
            >
              <ShoppingCart class="h-7 w-7 text-primary" />
            </div>
            <CardTitle class="text-xl font-bold"
              >E-Commerce Solutions</CardTitle
            >
          </CardHeader>
          <CardContent>
            <p class="text-muted-foreground mb-5">
              Full-featured online stores that drive sales and provide seamless
              shopping experiences.
            </p>
            <ul class="mt-4 space-y-3">
              <li class="flex items-start bg-primary/5 p-2 rounded-lg">
                <Check class="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>Secure payment gateways</span>
              </li>
              <li class="flex items-start bg-primary/5 p-2 rounded-lg">
                <Check class="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>Inventory management</span>
              </li>
              <li class="flex items-start bg-primary/5 p-2 rounded-lg">
                <Check class="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>Mobile-optimized checkout</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              class="w-full border-primary/50 hover:bg-primary hover:text-white transition-all"
              as-child
            >
              <NuxtLink to="/services">Learn More</NuxtLink>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  </section>

  <!-- Call to Action -->
  <section class="py-20 bg-primary text-primary-foreground">
    <div class="container mx-auto px-4 text-center">
      <h2 class="text-3xl md:text-4xl font-bold mb-4">
        Ready to Transform Your Online Presence?
      </h2>
      <p class="text-lg max-w-3xl mx-auto mb-8 text-primary-foreground/90">
        Let's discuss how we can help your business succeed in the digital
        world.
      </p>
      <Button size="lg" variant="secondary" class="px-8">Get in Touch</Button>
    </div>
  </section>
</template>

<style>
/* Light Mode Enhancement */
html.light {
  /* Subtle background color instead of pure white */
  --background: #f8fafc;

  /* Improved color contrast */
  --foreground: #1e293b;
  --muted: #64748b;
  --muted-foreground: #475569;

  /* More vibrant primary color */
  --primary: #2563eb;
  --primary-foreground: #ffffff;

  /* Enhanced card appearance */
  --card: #ffffff;
  --card-foreground: #1e293b;

  /* Better border colors */
  --border: #e2e8f0;

  /* Improved accent colors */
  --accent: #f1f5f9;
  --accent-foreground: #0f172a;

  /* Ring colors for focus states */
  --ring: #3b82f6;
}

/* Navigation text contrast fix for light mode */
html.light .text-muted-foreground {
  color: #334155; /* Darker shade for better contrast */
}

html.light header .text-muted-foreground {
  color: #334155; /* Ensure navbar has good contrast */
}

html.light .card,
html.light .shadow-sm {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03);
}

html.light .shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05),
    0 2px 4px -1px rgba(0, 0, 0, 0.03);
}

/* Improved hover states for light mode */
html.light .hover\:bg-accent:hover {
  background-color: #e2e8f0;
}

/* Enhanced button appearance in light mode */
html.light .button-primary {
  background-color: #2563eb;
  color: white;
}

html.light .button-primary:hover {
  background-color: #1d4ed8;
}

/* Navbar specific styles for light mode */
html.light header {
  background-color: white;
  border-bottom-color: #e2e8f0;
}

html.light header nav a {
  color: #334155;
  font-weight: 500;
}

html.light header nav a:hover {
  color: #1e293b;
}
</style>
