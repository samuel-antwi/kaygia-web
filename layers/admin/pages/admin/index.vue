<script setup lang="ts">
import { watchEffect } from "vue";
import { Role } from "@prisma/client"; // Import Role enum

// Ensure middleware runs for this page (it does if global)
definePageMeta({
  layout: "admin",
});

const { user, loading } = useAuth();
const router = useRouter(); // Auto-imported

// Watch auth state for role check after loading
watchEffect(() => {
  // Wait until loading is false and user object is available
  if (!loading.value && user.value) {
    // Perform the role check here
    if (user.value.role !== Role.ADMIN) {
      console.warn("[Admin Page Watcher] Role check FAILED. Redirecting...");
      router.push("/dashboard?error=unauthorized");
    }
  } else if (!loading.value && !user.value) {
    router.push("/auth/login?redirect=/admin");
  }
});
</script>

<template>
  <div>
    <!-- Show loading state while auth is resolving -->
    <div v-if="loading">
      <p>Loading user data...</p>
      <!-- Add a proper loading spinner later -->
    </div>
    <!-- Only show content if user is loaded and confirmed ADMIN -->
    <div v-else-if="user && user.role === Role.ADMIN">
      <h1 class="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <p>Welcome to the administrative area.</p>
      <p>Only users with the ADMIN role should be able to see this page.</p>
      <!-- Add links to other admin sections here later -->
    </div>
    <!-- Optional: Show an unauthorized message if somehow the redirect didn't happen -->
    <div v-else>
      <p>Access Denied. Redirecting...</p>
    </div>
  </div>
</template>
