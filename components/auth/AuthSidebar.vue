<script setup lang="ts">
import type { PropType } from "vue";

defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  features: {
    type: Array as PropType<
      {
        title: string;
        description: string;
      }[]
    >,
    required: true,
  },
});
</script>

<template>
  <div class="hidden lg:flex lg:w-1/2 relative overflow-hidden">
    <div
      class="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary-foreground"
    ></div>
    <div
      class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2064')] bg-cover bg-center opacity-20 mix-blend-overlay dark:opacity-10"
    ></div>
    <div class="absolute inset-0 backdrop-blur-sm"></div>

    <div
      class="relative z-10 flex flex-col justify-center px-12 w-full max-w-2xl mx-auto"
    >
      <div class="mb-8">
        <div
          class="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6"
          aria-hidden="true"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-6 w-6 text-white"
            aria-hidden="true"
            role="img"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
            <path d="M2 17l10 5 10-5"></path>
            <path d="M2 12l10 5 10-5"></path>
          </svg>
        </div>
        <h1 class="text-5xl font-bold mb-4 text-white drop-shadow-sm">
          {{ title }}
        </h1>
        <p class="text-xl text-white leading-relaxed font-medium">
          {{ description }}
        </p>
      </div>

      <div
        class="space-y-8 mt-8"
        role="list"
        aria-label="Benefits of our platform"
      >
        <div
          v-for="(feature, index) in features"
          :key="index"
          class="flex items-start space-x-4"
          role="listitem"
        >
          <div
            class="rounded-full bg-white/20 backdrop-blur-md p-2 mt-1 flex-shrink-0"
            aria-hidden="true"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
              role="img"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <h3 class="text-white font-medium text-lg">
              {{ feature.title }}
            </h3>
            <p class="text-white font-medium">
              {{ feature.description }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
