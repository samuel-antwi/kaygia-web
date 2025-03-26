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
import site from "~/utils/config/site";

const colorMode = useColorMode();
// Use the imported site as fallback if $site is not available
const { $site = site } = useNuxtApp();

function toggleColorMode() {
  colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
}
</script>

<template>
  <div class="flex min-h-screen flex-col antialiased">
    <!-- Header -->
    <header class="border-b z-20 bg-background sticky top-0">
      <div
        class="container px-4 mx-auto flex h-16 items-center justify-between py-4"
      >
        <div class="flex items-center gap-6">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center gap-2 font-bold">
            <span class="text-primary text-xl">{{ $site.name }}</span>
          </NuxtLink>

          <!-- Navigation -->
          <nav class="hidden md:flex items-center gap-6">
            <NuxtLink
              v-for="item in $site.navigation.main"
              :key="item.name"
              :to="item.href"
              class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {{ item.name }}
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
            <NuxtLink to="/auth/login" class="flex items-center gap-1">
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
      <div class="container px-4 mx-auto py-10">
        <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          <!-- Company info -->
          <div>
            <h3 class="text-lg font-semibold mb-4">{{ $site.company.name }}</h3>
            <p class="text-sm text-muted-foreground mb-4">
              {{ $site.company.tagline }}
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
              <li
                v-for="service in $site.navigation.footer.services"
                :key="service.name"
              >
                <NuxtLink
                  :to="service.href"
                  class="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {{ service.name }}
                </NuxtLink>
              </li>
            </ul>
          </div>

          <!-- Company -->
          <div>
            <h3 class="text-lg font-semibold mb-4">Company</h3>
            <ul class="space-y-2 text-sm">
              <li
                v-for="item in $site.navigation.footer.company"
                :key="item.name"
              >
                <NuxtLink
                  :to="item.href"
                  class="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {{ item.name }}
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
                <span class="text-muted-foreground">{{
                  $site.company.address
                }}</span>
              </li>
              <li class="flex items-start">
                <Mail class="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                <span class="text-muted-foreground">{{
                  $site.company.email
                }}</span>
              </li>
              <li class="flex items-start">
                <Phone class="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                <span class="text-muted-foreground">{{
                  $site.company.phone
                }}</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="mt-8 pt-6 border-t">
          <p class="text-sm text-muted-foreground text-center">
            © {{ new Date().getFullYear() }} {{ $site.company.name }}. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Add any additional styling here if needed */
</style>
