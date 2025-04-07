<script setup lang="ts">
import {
  Building2,
  Clock,
  Users,
  CheckCircle,
  Trophy,
  HeartHandshake,
  Rocket,
  Heart,
  Star,
  Users2,
  ArrowUpRight,
  Sparkles,
} from "lucide-vue-next";

// Import site config
import { site } from "~/utils/config/site";

// Set page meta information
useHead({
  title: `About Us | ${site.company.name} ${site.nameSuffix}`,
  meta: [
    {
      name: "description",
      content: `Learn about ${site.company.name}, our mission, vision, and approach to web development.`,
    },
  ],
});

// Vision points
const visionPoints = [
  {
    icon: Sparkles,
    text: "Creating beautiful, functional websites that help businesses thrive",
  },
  {
    icon: HeartHandshake,
    text: "Building lasting relationships with clients through transparency and integrity",
  },
  {
    icon: ArrowUpRight,
    text: "Growing alongside our clients and celebrating their success",
  },
  {
    icon: Star,
    text: "Constantly learning and adapting to emerging technologies",
  },
];

// Core values
const values = [
  {
    icon: CheckCircle,
    title: "Quality First",
    description:
      "We never compromise on quality. Our code is clean, well-documented, and built to last.",
  },
  {
    icon: Clock,
    title: "Timely Delivery",
    description:
      "We respect deadlines and ensure projects are delivered on time without sacrificing quality.",
  },
  {
    icon: HeartHandshake,
    title: "Client Partnership",
    description:
      "We build relationships with our clients based on trust and mutual success.",
  },
  {
    icon: Rocket,
    title: "Innovation",
    description:
      "We stay at the cutting edge of web technologies to provide modern, future-proof solutions.",
  },
];

// Founder/Team info
const founder = site.founder;
</script>

<template>
  <div class="container mx-auto py-16 px-4 sm:px-6 lg:py-24">
    <!-- Hero Section -->
    <div class="max-w-3xl mx-auto text-center mb-20">
      <h1 class="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
        About {{ site.company.name }}
      </h1>
      <p class="text-xl text-muted-foreground">
        A fresh web development studio committed to creating exceptional digital
        experiences for businesses ready to make their mark online.
      </p>
    </div>

    <!-- Our Story Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
      <div class="space-y-6">
        <h2 class="text-3xl font-bold">Our Story</h2>
        <p class="text-lg text-muted-foreground">
          {{ site.company.name }} was born from a simple yet powerful idea: to
          provide businesses with beautifully crafted, high-performance websites
          that truly represent their brand and connect with their audience.
        </p>
        <p class="text-lg text-muted-foreground">
          As a new agency, we're bringing fresh perspectives and modern
          approaches to web development. What we lack in years, we make up for
          with passion, dedication, and a commitment to excellence in everything
          we create.
        </p>
        <p class="text-lg text-muted-foreground">
          We're excited to grow alongside our clients, building our portfolio
          one successful project at a time, and establishing
          {{ site.company.name }} as a trusted name in web development.
        </p>
      </div>
      <div class="rounded-lg overflow-hidden shadow-lg">
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
          alt="{{ site.company.name }} team at work"
          class="w-full h-full object-cover"
        />
      </div>
    </div>

    <!-- Vision Section -->
    <div class="bg-muted py-12 rounded-lg px-4 mb-20">
      <h2 class="text-3xl font-bold text-center mb-8">Our Vision</h2>
      <div class="max-w-3xl mx-auto">
        <ul class="space-y-4">
          <li
            v-for="(point, index) in visionPoints"
            :key="index"
            class="flex items-start"
          >
            <component
              :is="point.icon"
              class="h-6 w-6 text-primary mr-3 mt-0.5 flex-shrink-0"
            />
            <p class="text-lg">{{ point.text }}</p>
          </li>
        </ul>
      </div>
    </div>

    <!-- Our Values Section -->
    <div class="mb-20 bg-gray-100 sm:p-10 p-4">
      <h2 class="text-3xl font-bold text-center mb-12">Our Core Values</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div
          v-for="(value, index) in values"
          :key="index"
          class="bg-card rounded-lg p-6 shadow-sm"
        >
          <component :is="value.icon" class="h-10 w-10 mb-4 text-primary" />
          <h3 class="text-xl font-bold mb-2">{{ value.title }}</h3>
          <p class="text-muted-foreground">{{ value.description }}</p>
        </div>
      </div>
    </div>

    <!-- Our Approach Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
      <div class="rounded-lg overflow-hidden shadow-lg">
        <img
          src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80"
          alt="{{ site.company.name }} team meeting"
          class="w-full h-full object-cover"
        />
      </div>
      <div class="space-y-6">
        <h2 class="text-3xl font-bold">Our Approach</h2>
        <p class="text-lg text-muted-foreground">
          We believe in a collaborative approach to web development. We take the
          time to understand your business, goals, and audience before we start
          designing or writing a single line of code.
        </p>
        <p class="text-lg text-muted-foreground">
          Our process is transparent and iterative. We keep you involved at
          every stage, gathering feedback and making adjustments to ensure the
          final product exceeds your expectations.
        </p>
        <p class="text-lg text-muted-foreground">
          We don't just build websites; we build solutions that help your
          business grow. From SEO to conversion optimization, we consider every
          aspect of your online presence to deliver results that matter.
        </p>
      </div>
    </div>

    <!-- Founder Section -->
    <div>
      <h2 class="text-3xl font-bold text-center mb-12">Meet the Founder</h2>
      <div
        class="max-w-2xl mx-auto bg-card rounded-lg overflow-hidden shadow-sm"
      >
        <div class="md:flex">
          <div class="md:w-1/3">
            <img
              :src="founder.image"
              :alt="`${founder.firstName} ${founder.lastName}`"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="p-6 md:w-2/3">
            <h3 class="text-xl font-bold mb-1">
              {{ founder.firstName }} {{ founder.lastName }}
            </h3>
            <p class="text-primary text-sm mb-4">{{ founder.position }}</p>
            <p class="text-muted-foreground">{{ founder.bio }}</p>
            <div class="mt-6">
              <p class="italic text-muted-foreground">
                "I started {{ site.company.name }} with a mission to help
                businesses stand out in the digital landscape. I'm excited to
                work with clients who value quality and innovation as much as I
                do."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
