<script setup lang="ts">
import {
  Code,
  Layout,
  Check,
  ShoppingCart,
  Paintbrush,
  ArrowRight,
  Star,
  Users,
  Zap,
} from "lucide-vue-next";
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
  <!-- Hero Section with Glassmorphism -->
  <div class="relative min-h-[75vh] overflow-hidden">
    <!-- Hero Background with Overlay -->
    <div class="absolute inset-0 z-0">
      <img
        src="https://images.unsplash.com/photo-1581472723648-909f4851d4ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
        alt="Web Development"
        class="w-full h-full object-cover"
      />
      <div
        class="absolute inset-0 bg-gradient-to-br from-background/95 via-background/85 to-background/75 dark:from-background/90 dark:via-background/80 dark:to-background/70"
      ></div>
    </div>

    <!-- Animated Shapes -->
    <div
      class="absolute inset-0 z-0 opacity-30 dark:opacity-20 overflow-hidden"
    >
      <div
        class="absolute -top-20 -right-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
      ></div>
      <div
        class="absolute top-1/2 -left-20 w-80 h-80 bg-secondary/20 rounded-full blur-3xl"
      ></div>
      <div
        class="absolute -bottom-20 right-1/3 w-72 h-72 bg-accent/20 rounded-full blur-3xl"
      ></div>
    </div>

    <!-- Hero Content -->
    <div
      class="relative z-10 container mx-auto px-4 py-20 flex flex-col items-start justify-center h-full"
    >
      <div class="max-w-3xl">
        <h1
          class="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-foreground leading-tight"
        >
          Transform Your
          <span class="text-primary relative inline-block">
            Online Presence
            <span
              class="absolute bottom-2 left-0 w-full h-3 bg-primary/20 -z-10 rounded-full"
            ></span>
          </span>
        </h1>

        <p
          class="text-xl md:text-2xl text-muted-foreground mb-10 leading-relaxed"
        >
          We build beautiful, functional websites that help your business stand
          out and succeed in today's digital landscape.
        </p>

        <div class="flex flex-wrap gap-5">
          <Button
            size="lg"
            class="px-8 h-14 rounded-xl font-medium text-base group"
          >
            Get Started
            <ArrowRight
              class="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"
            />
          </Button>
          <Button
            size="lg"
            class="h-14 rounded-xl font-medium text-base"
            variant="outline"
          >
            View Our Work
          </Button>
        </div>
      </div>
    </div>
  </div>

  <!-- Our Services Section -->
  <section class="py-24 bg-background">
    <div class="container mx-auto px-4">
      <div class="text-center mb-20">
        <div
          class="inline-flex items-center px-4 py-2 mb-4 rounded-full bg-muted text-muted-foreground text-sm font-medium"
        >
          <Paintbrush class="h-4 w-4 mr-2" />
          <span>What We Offer</span>
        </div>
        <h2 class="text-4xl md:text-5xl font-bold mb-6">Our Services</h2>
        <p class="text-xl text-muted-foreground max-w-3xl mx-auto">
          We offer comprehensive web development solutions tailored to your
          business needs.
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
            <p class="text-muted-foreground mb-6 text-lg">
              Custom websites built with the latest technologies, optimized for
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
            <Button variant="ghost" class="w-full group" as-child>
              <NuxtLink to="/services" class="flex items-center justify-center">
                Learn More
                <ArrowRight
                  class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                />
              </NuxtLink>
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
              <Layout class="h-8 w-8 text-primary" />
            </div>
            <CardTitle class="text-2xl font-bold">UI/UX Design</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-muted-foreground mb-6 text-lg">
              Beautiful, intuitive interfaces designed with your users in mind
              for maximum engagement and conversion.
            </p>
            <ul class="mt-4 space-y-4">
              <li class="flex items-start">
                <div
                  class="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-3"
                >
                  <Check class="h-4 w-4 text-primary" />
                </div>
                <span>Comprehensive user research</span>
              </li>
              <li class="flex items-start">
                <div
                  class="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-3"
                >
                  <Check class="h-4 w-4 text-primary" />
                </div>
                <span>Wireframing & interactive prototyping</span>
              </li>
              <li class="flex items-start">
                <div
                  class="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-3"
                >
                  <Check class="h-4 w-4 text-primary" />
                </div>
                <span>User testing and iterative design</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" class="w-full group" as-child>
              <NuxtLink to="/services" class="flex items-center justify-center">
                Learn More
                <ArrowRight
                  class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                />
              </NuxtLink>
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
            <p class="text-muted-foreground mb-6 text-lg">
              Full-featured online stores that drive sales and provide seamless
              shopping experiences for your customers.
            </p>
            <ul class="mt-4 space-y-4">
              <li class="flex items-start">
                <div
                  class="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-3"
                >
                  <Check class="h-4 w-4 text-primary" />
                </div>
                <span>Secure payment gateway integration</span>
              </li>
              <li class="flex items-start">
                <div
                  class="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-3"
                >
                  <Check class="h-4 w-4 text-primary" />
                </div>
                <span>Advanced inventory management</span>
              </li>
              <li class="flex items-start">
                <div
                  class="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-3"
                >
                  <Check class="h-4 w-4 text-primary" />
                </div>
                <span>Mobile-optimized checkout process</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" class="w-full group" as-child>
              <NuxtLink to="/services" class="flex items-center justify-center">
                Learn More
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

  <!-- Why Choose Us Section -->
  <section class="py-24 bg-muted/30">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <div
            class="inline-flex items-center px-4 py-2 mb-4 rounded-full bg-primary/10 text-primary text-sm font-medium"
          >
            <Users class="h-4 w-4 mr-2" />
            <span>Why Choose Us</span>
          </div>
          <h2 class="text-4xl font-bold mb-6">
            We Deliver Excellence in Every Project
          </h2>
          <p class="text-lg text-muted-foreground mb-8">
            Our team of experts is dedicated to delivering high-quality web
            solutions that exceed your expectations and help your business grow.
          </p>

          <div class="space-y-6">
            <div class="flex gap-4">
              <div
                class="flex-shrink-0 h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center"
              >
                <Zap class="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 class="text-xl font-semibold mb-2">Fast Turnaround</h3>
                <p class="text-muted-foreground">
                  We deliver projects on time without compromising on quality.
                </p>
              </div>
            </div>

            <div class="flex gap-4">
              <div
                class="flex-shrink-0 h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center"
              >
                <Users class="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 class="text-xl font-semibold mb-2">Expert Team</h3>
                <p class="text-muted-foreground">
                  Our developers and designers are industry veterans with proven
                  track records.
                </p>
              </div>
            </div>

            <div class="flex gap-4">
              <div
                class="flex-shrink-0 h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center"
              >
                <Star class="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 class="text-xl font-semibold mb-2">Quality Assurance</h3>
                <p class="text-muted-foreground">
                  Rigorous testing ensures your website performs flawlessly
                  across all devices.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="relative">
          <div
            class="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-3xl -z-10"
          ></div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-4">
              <div
                class="bg-background rounded-2xl shadow-lg p-6 h-64 transform translate-y-8"
              >
                <img
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                  alt="Team working"
                  class="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div class="bg-background rounded-2xl shadow-lg p-6 h-48">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                  alt="Team meeting"
                  class="w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>
            <div class="space-y-4">
              <div class="bg-background rounded-2xl shadow-lg p-6 h-48">
                <img
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                  alt="Coding"
                  class="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div
                class="bg-background rounded-2xl shadow-lg p-6 h-64 transform translate-y--8"
              >
                <img
                  src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                  alt="Business meeting"
                  class="w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Call to Action -->
  <section
    class="py-24 bg-primary text-primary-foreground relative overflow-hidden"
  >
    <div class="absolute inset-0 z-0 opacity-20">
      <div
        class="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"
      ></div>
      <div
        class="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl"
      ></div>
    </div>

    <div class="container mx-auto px-4 text-center relative z-10">
      <h2 class="text-4xl md:text-5xl font-bold mb-6">
        Ready to Transform Your Online Presence?
      </h2>
      <p class="text-xl max-w-3xl mx-auto mb-10 opacity-90">
        Let's discuss how we can help your business succeed in the digital world
        with a custom web solution tailored to your needs.
      </p>
      <Button
        size="lg"
        variant="secondary"
        class="px-10 h-14 rounded-xl text-base font-medium group"
      >
        Get in Touch
        <ArrowRight
          class="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"
        />
      </Button>
    </div>
  </section>
</template>
