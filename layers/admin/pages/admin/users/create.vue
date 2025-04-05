<script setup lang="ts">
import { ArrowLeft } from "lucide-vue-next";
import UserCreationForm from "../../../components/users/UserCreationForm.vue";

definePageMeta({
  layout: "admin",
});

// Handle user creation event
const handleUserCreated = (user: any) => {
  // Optional: Navigate to the user detail page after creation
  // if (user && user.id) {
  //   navigateTo(`/admin/users/${user.id}`);
  // }
};
</script>

<template>
  <div class="container py-6 space-y-6">
    <!-- Back Button -->
    <NuxtLink
      to="/admin/users"
      class="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
    >
      <ArrowLeft class="w-4 h-4 mr-1" />
      Back to Users
    </NuxtLink>

    <div class="max-w-3xl mx-auto">
      <!-- Page Title -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold tracking-tight">Create New User</h1>
        <p class="text-muted-foreground mt-1">
          Add a new user account to the system.
        </p>
      </div>

      <!-- User Creation Form -->
      <UserCreationForm @user-created="handleUserCreated" />
    </div>
  </div>
</template>
