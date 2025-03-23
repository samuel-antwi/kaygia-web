<script setup lang="ts">
import {
  Sun,
  Moon,
  LogIn,
  Twitter,
  Instagram,
  Linkedin,
  MapPin,
  Mail,
  Phone,
} from "lucide-vue-next";

const colorMode = useColorMode();

function toggleColorMode() {
  colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
}
</script>

<template>
  <div class="flex min-h-screen flex-col antialiased">
    <!-- Header -->
    <header class="border-b bg-background sticky top-0 z-10">
      <div
        class="container mx-auto flex h-16 items-center justify-between py-4"
      >
        <div class="flex items-center gap-6">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center gap-2 font-bold">
            <span class="text-primary text-xl">Kaygia</span>
            <span class="text-muted-foreground">Web</span>
          </NuxtLink>

          <!-- Navigation -->
          <nav class="hidden md:flex items-center gap-6">
            <NuxtLink
              to="/"
              class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </NuxtLink>
            <NuxtLink
              to="/services"
              class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Services
            </NuxtLink>
            <NuxtLink
              to="/about"
              class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </NuxtLink>
            <NuxtLink
              to="/portfolio"
              class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Portfolio
            </NuxtLink>
            <NuxtLink
              to="/contact"
              class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </NuxtLink>
          </nav>
        </div>

        <div class="flex items-center gap-4">
          <!-- Color mode toggle -->
          <Button
            variant="ghost"
            size="icon"
            @click="toggleColorMode"
            aria-label="Toggle theme"
          >
            <Sun v-if="colorMode.value === 'dark'" class="h-5 w-5" />
            <Moon v-else class="h-5 w-5" />
          </Button>

          <!-- Login button -->
          <Button as-child variant="default" size="sm" class="hidden md:flex">
            <NuxtLink to="/login" class="flex items-center gap-1">
              <LogIn class="h-4 w-4 mr-1" />
              Client Login
            </NuxtLink>
          </Button>

          <!-- Mobile navigation -->
          <LayoutMobileNav />
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="border-t bg-muted/40">
      <div class="container mx-auto py-10">
        <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          <!-- Company info -->
          <div>
            <h3 class="text-lg font-semibold mb-4">Kaygia Web</h3>
            <p class="text-sm text-muted-foreground mb-4">
              Crafting beautiful, functional websites for businesses that want
              to stand out.
            </p>
            <div class="flex items-center gap-3">
              <Button variant="ghost" size="icon" aria-label="Twitter">
                <Twitter class="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Instagram">
                <Instagram class="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="LinkedIn">
                <Linkedin class="h-4 w-4" />
              </Button>
            </div>
          </div>

          <!-- Services -->
          <div>
            <h3 class="text-lg font-semibold mb-4">Services</h3>
            <ul class="space-y-2 text-sm">
              <li>
                <NuxtLink
                  to="/services"
                  class="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Web Development
                </NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/services"
                  class="text-muted-foreground hover:text-foreground transition-colors"
                >
                  UI/UX Design
                </NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/services"
                  class="text-muted-foreground hover:text-foreground transition-colors"
                >
                  E-Commerce
                </NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/services"
                  class="text-muted-foreground hover:text-foreground transition-colors"
                >
                  SEO Optimization
                </NuxtLink>
              </li>
            </ul>
          </div>

          <!-- Company -->
          <div>
            <h3 class="text-lg font-semibold mb-4">Company</h3>
            <ul class="space-y-2 text-sm">
              <li>
                <NuxtLink
                  to="/about"
                  class="text-muted-foreground hover:text-foreground transition-colors"
                >
                  About Us
                </NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/portfolio"
                  class="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Portfolio
                </NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/contact"
                  class="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact
                </NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/privacy"
                  class="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </NuxtLink>
              </li>
            </ul>
          </div>

          <!-- Contact -->
          <div>
            <h3 class="text-lg font-semibold mb-4">Contact</h3>
            <ul class="space-y-2 text-sm">
              <li class="flex items-start">
                <MapPin class="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                <span class="text-muted-foreground"
                  >123 Web Dev Street, Internet City</span
                >
              </li>
              <li class="flex items-start">
                <Mail class="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                <span class="text-muted-foreground">contact@kaygiaweb.com</span>
              </li>
              <li class="flex items-start">
                <Phone class="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                <span class="text-muted-foreground">+1 (555) 123-4567</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="mt-8 pt-6 border-t">
          <p class="text-sm text-muted-foreground text-center">
            © {{ new Date().getFullYear() }} Kaygia Web. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Add any additional styling here if needed */
</style>
