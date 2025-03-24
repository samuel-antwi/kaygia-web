<script setup lang="ts">
import {
  Building2,
  Clock,
  Users,
  CheckCircle,
  Trophy,
  HeartHandshake,
} from "lucide-vue-next";

// Set page meta information
useHead({
  title: "About Us | Kaygia Web Development Agency",
  meta: [
    {
      name: "description",
      content:
        "Learn about Kaygia Web Development Agency, our mission, values, team, and approach to web development.",
    },
  ],
});

// Stats data
const stats = [
  { number: "100+", label: "Projects Completed" },
  { number: "50+", label: "Happy Clients" },
  { number: "8+", label: "Years Experience" },
  { number: "24/7", label: "Customer Support" },
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
      "We build long-term relationships with our clients based on trust and mutual success.",
  },
  {
    icon: Trophy,
    title: "Excellence",
    description:
      "We strive for excellence in everything we do, from design to development to support.",
  },
];

// Team members
const team = [
  {
    name: "Alex Johnson",
    position: "Founder & Lead Developer",
    bio: "With over 10 years of experience in web development, Alex leads our technical strategy and ensures quality across all projects.",
    image: "/img/team/placeholder.jpg",
  },
  {
    name: "Sarah Chen",
    position: "UX/UI Designer",
    bio: "Sarah creates beautiful, intuitive interfaces that balance aesthetics with functionality, ensuring the best user experience.",
    image: "/img/team/placeholder.jpg",
  },
  {
    name: "Michael Rodriguez",
    position: "Full-Stack Developer",
    bio: "Michael brings expertise in both frontend and backend technologies, creating seamless, high-performing web applications.",
    image: "/img/team/placeholder.jpg",
  },
  {
    name: "Emily Taylor",
    position: "Project Manager",
    bio: "Emily ensures projects stay on track, maintaining clear communication between our team and clients throughout each project.",
    image: "/img/team/placeholder.jpg",
  },
];

// Team member image function
const teamImages = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=600&q=80",
];

const getTeamMemberImage = (index: number) => teamImages[index];
</script>

<template>
  <div class="container mx-auto py-16 px-4 sm:px-6 lg:py-24">
    <!-- Hero Section -->
    <div class="max-w-3xl mx-auto text-center mb-20">
      <h1 class="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
        About Kaygia
      </h1>
      <p class="text-xl text-muted-foreground">
        We're a passionate team of web developers, designers, and strategists
        dedicated to creating exceptional digital experiences.
      </p>
    </div>

    <!-- Our Story Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
      <div class="space-y-6">
        <h2 class="text-3xl font-bold">Our Story</h2>
        <p class="text-lg text-muted-foreground">
          Founded in 2015, Kaygia began with a simple mission: to provide small
          businesses with the same quality web development that larger companies
          enjoy, but at an accessible price point.
        </p>
        <p class="text-lg text-muted-foreground">
          What started as a one-person freelance operation has grown into a
          full-service agency with a team of dedicated professionals who share a
          passion for creating beautiful, functional websites and applications.
        </p>
        <p class="text-lg text-muted-foreground">
          Today, we've worked with over 100 clients across various industries,
          from e-commerce to healthcare, education to entertainment, helping
          them achieve their digital goals and grow their businesses online.
        </p>
      </div>
      <div class="rounded-lg overflow-hidden shadow-lg">
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
          alt="Kaygia team at work"
          class="w-full h-full object-cover"
        />
      </div>
    </div>

    <!-- Stats Section -->
    <div class="bg-muted py-12 rounded-lg mb-20">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div v-for="(stat, index) in stats" :key="index" class="space-y-2">
          <p class="text-4xl font-bold">{{ stat.number }}</p>
          <p class="text-muted-foreground">{{ stat.label }}</p>
        </div>
      </div>
    </div>

    <!-- Our Values Section -->
    <div class="mb-20">
      <h2 class="text-3xl font-bold text-center mb-12">Our Core Values</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
          alt="Kaygia team meeting"
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

    <!-- Team Section -->
    <div>
      <h2 class="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div
          v-for="(member, index) in team"
          :key="index"
          class="bg-card rounded-lg overflow-hidden shadow-sm"
        >
          <img
            :src="getTeamMemberImage(index)"
            :alt="member.name"
            class="w-full h-64 object-cover"
          />
          <div class="p-6">
            <h3 class="text-xl font-bold mb-1">{{ member.name }}</h3>
            <p class="text-primary text-sm mb-4">{{ member.position }}</p>
            <p class="text-muted-foreground">{{ member.bio }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
