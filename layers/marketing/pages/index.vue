<script setup lang="ts">
import { Code, Layout, Check, ShoppingCart, Paintbrush } from "lucide-vue-next";
import site from "~/utils/config/site";

definePageMeta({
  layout: "default",
});

const { $site = site } = useNuxtApp();

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
        class="absolute inset-0 bg-gradient-to-r from-background/95 via-background/90 to-background/80"
      ></div>
    </div>

    <!-- Hero Content -->
    <div
      class="relative z-10 container mx-auto px-4 py-20 flex flex-col items-start justify-center h-full"
    >
      <div class="max-w-2xl">
        <h1
          class="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground"
        >
          Transform Your Online Presence with
          <span class="text-primary">Expert Web Development</span>
        </h1>
        <p class="text-lg md:text-xl text-muted-foreground mb-8">
          We build beautiful, functional websites that help your business stand
          out and succeed online.
        </p>
        <div class="flex flex-wrap gap-4">
          <Button class="px-8">Get Started</Button>
          <Button variant="outline">View Our Work</Button>
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
          class="overflow-hidden border-t-4 border-primary rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
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
              <li class="flex items-start bg-accent/10 p-2 rounded-lg">
                <Check class="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>Responsive design</span>
              </li>
              <li class="flex items-start bg-accent/10 p-2 rounded-lg">
                <Check class="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>SEO optimization</span>
              </li>
              <li class="flex items-start bg-accent/10 p-2 rounded-lg">
                <Check class="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>Performance focused</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" class="w-full" as-child>
              <NuxtLink to="/services">Learn More</NuxtLink>
            </Button>
          </CardFooter>
        </Card>

        <!-- UI/UX Design Card -->
        <Card
          class="overflow-hidden border-t-4 border-primary rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
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
              <li class="flex items-start bg-accent/10 p-2 rounded-lg">
                <Check class="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>User research</span>
              </li>
              <li class="flex items-start bg-accent/10 p-2 rounded-lg">
                <Check class="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>Wireframing & prototyping</span>
              </li>
              <li class="flex items-start bg-accent/10 p-2 rounded-lg">
                <Check class="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>User testing</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" class="w-full" as-child>
              <NuxtLink to="/services">Learn More</NuxtLink>
            </Button>
          </CardFooter>
        </Card>

        <!-- E-Commerce Card -->
        <Card
          class="overflow-hidden border-t-4 border-primary rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
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
              <li class="flex items-start bg-accent/10 p-2 rounded-lg">
                <Check class="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>Secure payment gateways</span>
              </li>
              <li class="flex items-start bg-accent/10 p-2 rounded-lg">
                <Check class="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>Inventory management</span>
              </li>
              <li class="flex items-start bg-accent/10 p-2 rounded-lg">
                <Check class="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>Mobile-optimized checkout</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" class="w-full" as-child>
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
      <p class="text-lg max-w-3xl mx-auto mb-8 opacity-90">
        Let's discuss how we can help your business succeed in the digital
        world.
      </p>
      <Button size="lg" variant="secondary" class="px-8">Get in Touch</Button>
    </div>
  </section>
</template>
