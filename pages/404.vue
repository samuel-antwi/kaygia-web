<template>
  <div class="min-h-screen flex items-center justify-center bg-background">
    <div class="max-w-md w-full px-6 text-center">
      <div class="space-y-6">
        <!-- 404 Illustration -->
        <div class="relative">
          <div
            class="text-[120px] font-bold text-muted-foreground/20 leading-none"
          >
            404
          </div>
          <div class="absolute inset-0 flex items-center justify-center">
            <FileQuestion class="h-16 w-16 text-muted-foreground" />
          </div>
        </div>

        <!-- Error Message -->
        <div class="space-y-2">
          <h1 class="text-2xl font-bold">Page Not Found</h1>
          <p class="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <!-- Suggestions -->
        <Card class="border-dashed">
          <CardContent class="pt-6">
            <p class="text-sm text-muted-foreground mb-4">
              Here are some helpful links:
            </p>
            <div class="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" @click="navigateTo('/')">
                <Home class="h-4 w-4 mr-2" />
                Homepage
              </Button>
              <Button
                variant="outline"
                size="sm"
                @click="navigateTo('/dashboard')"
              >
                <LayoutDashboard class="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button
                variant="outline"
                size="sm"
                @click="navigateTo('/services')"
              >
                <Briefcase class="h-4 w-4 mr-2" />
                Services
              </Button>
              <Button
                variant="outline"
                size="sm"
                @click="navigateTo('/contact')"
              >
                <Mail class="h-4 w-4 mr-2" />
                Contact
              </Button>
            </div>
          </CardContent>
        </Card>

        <!-- Search Option -->
        <div class="pt-4">
          <p class="text-sm text-muted-foreground">
            Can't find what you're looking for?
          </p>
          <Button variant="link" @click="goBack" class="mt-2">
            <ArrowLeft class="h-4 w-4 mr-2" />
            Go back to previous page
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  FileQuestion,
  Home,
  LayoutDashboard,
  Briefcase,
  Mail,
  ArrowLeft,
} from "lucide-vue-next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const goBack = () => {
  const router = useRouter();
  router.back();
};
</script>
