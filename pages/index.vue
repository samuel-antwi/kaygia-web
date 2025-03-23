<script setup lang="ts">
import { Code, Layout, Check, ShoppingCart, Paintbrush } from "lucide-vue-next";

definePageMeta({
  layout: "default",
});

// Add meta tags for SEO
useHead({
  title: "Kaygia Web - Professional Web Development Agency",
  meta: [
    {
      name: "description",
      content:
        "Kaygia Web is a professional web development agency specializing in custom websites, e-commerce solutions, and digital marketing services.",
    },
  ],
});
</script>

<template>
  <div>
    <!-- Hero section -->
    <section class="py-20 bg-primary/5">
      <div class="container mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 class="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Transform Your Online Presence with
              <span class="text-primary">Expert Web Development</span>
            </h1>
            <p class="text-xl text-muted-foreground mb-8">
              We build beautiful, functional websites that help your business
              stand out and succeed online.
            </p>
            <div class="flex flex-col sm:flex-row gap-4">
              <Button size="lg" as-child>
                <NuxtLink to="/contact">Get Started</NuxtLink>
              </Button>
              <Button size="lg" variant="outline" as-child>
                <NuxtLink to="/portfolio">View Our Work</NuxtLink>
              </Button>
            </div>
          </div>
          <div class="relative">
            <div
              class="aspect-video rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 p-2"
            >
              <div
                class="bg-background h-full w-full rounded border shadow-lg flex items-center justify-center"
              >
                <Code class="h-20 w-20 text-primary opacity-50" />
              </div>
            </div>
            <div
              class="absolute -bottom-6 -right-6 h-24 w-24 rounded-lg bg-gradient-to-br from-primary to-primary/70 p-1"
            >
              <div
                class="bg-background h-full w-full rounded flex items-center justify-center"
              >
                <Layout class="h-10 w-10 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Services section -->
    <section class="py-20">
      <div class="container mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold mb-4">Our Services</h2>
          <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
            We offer comprehensive web development solutions tailored to your
            business needs.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Service 1 -->
          <Card class="flex flex-col h-full">
            <CardHeader>
              <div
                class="mb-2 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center"
              >
                <Code class="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Web Development</CardTitle>
              <CardDescription>
                Custom websites built with modern technologies for optimal
                performance and user experience.
              </CardDescription>
            </CardHeader>
            <CardContent class="flex-1">
              <ul class="space-y-2">
                <li class="flex items-center gap-2">
                  <Check class="h-4 w-4 text-primary" />
                  <span>Responsive design</span>
                </li>
                <li class="flex items-center gap-2">
                  <Check class="h-4 w-4 text-primary" />
                  <span>Fast loading speeds</span>
                </li>
                <li class="flex items-center gap-2">
                  <Check class="h-4 w-4 text-primary" />
                  <span>SEO optimized</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button class="w-full" as-child>
                <NuxtLink to="/services">Learn More</NuxtLink>
              </Button>
            </CardFooter>
          </Card>

          <!-- Service 2 -->
          <Card class="flex flex-col h-full">
            <CardHeader>
              <div
                class="mb-2 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center"
              >
                <ShoppingCart class="h-6 w-6 text-primary" />
              </div>
              <CardTitle>E-Commerce</CardTitle>
              <CardDescription>
                Powerful online stores that drive sales and provide excellent
                shopping experiences.
              </CardDescription>
            </CardHeader>
            <CardContent class="flex-1">
              <ul class="space-y-2">
                <li class="flex items-center gap-2">
                  <Check class="h-4 w-4 text-primary" />
                  <span>Secure checkout</span>
                </li>
                <li class="flex items-center gap-2">
                  <Check class="h-4 w-4 text-primary" />
                  <span>Inventory management</span>
                </li>
                <li class="flex items-center gap-2">
                  <Check class="h-4 w-4 text-primary" />
                  <span>Payment integrations</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button class="w-full" as-child>
                <NuxtLink to="/services">Learn More</NuxtLink>
              </Button>
            </CardFooter>
          </Card>

          <!-- Service 3 -->
          <Card class="flex flex-col h-full">
            <CardHeader>
              <div
                class="mb-2 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center"
              >
                <Paintbrush class="h-6 w-6 text-primary" />
              </div>
              <CardTitle>UI/UX Design</CardTitle>
              <CardDescription>
                Beautiful interfaces and intuitive user experiences that engage
                your visitors.
              </CardDescription>
            </CardHeader>
            <CardContent class="flex-1">
              <ul class="space-y-2">
                <li class="flex items-center gap-2">
                  <Check class="h-4 w-4 text-primary" />
                  <span>User research</span>
                </li>
                <li class="flex items-center gap-2">
                  <Check class="h-4 w-4 text-primary" />
                  <span>Wireframing</span>
                </li>
                <li class="flex items-center gap-2">
                  <Check class="h-4 w-4 text-primary" />
                  <span>Prototype testing</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button class="w-full" as-child>
                <NuxtLink to="/services">Learn More</NuxtLink>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>

    <!-- CTA section -->
    <section class="py-20 bg-primary/5">
      <div class="container">
        <div class="text-center max-w-3xl mx-auto">
          <h2 class="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p class="text-xl text-muted-foreground mb-8">
            Contact us today to discuss your project and how we can help bring
            your vision to life.
          </p>
          <Button size="lg" as-child>
            <NuxtLink to="/contact">Contact Us</NuxtLink>
          </Button>
        </div>
      </div>
    </section>
  </div>
</template>
