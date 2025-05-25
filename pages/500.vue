<template>
  <div class="min-h-screen flex items-center justify-center bg-background">
    <div class="max-w-md w-full px-6">
      <Card class="border-0 shadow-lg">
        <CardHeader class="text-center space-y-2 pb-4">
          <div class="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <ServerCrash class="h-8 w-8 text-destructive" />
          </div>
          <CardTitle class="text-2xl">Server Error</CardTitle>
          <CardDescription>
            Something went wrong on our servers. We're working to fix it.
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <Alert>
            <AlertCircle class="h-4 w-4" />
            <AlertTitle>What happened?</AlertTitle>
            <AlertDescription>
              An unexpected error occurred while processing your request. This has been logged and our team will investigate.
            </AlertDescription>
          </Alert>
          
          <div class="space-y-2">
            <Button @click="retry" class="w-full">
              <RefreshCw class="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button @click="goHome" variant="outline" class="w-full">
              <Home class="h-4 w-4 mr-2" />
              Back to Homepage
            </Button>
          </div>
          
          <div class="text-center pt-4 border-t">
            <p class="text-sm text-muted-foreground">
              Error Code: 500 | 
              <NuxtLink to="/contact" class="text-primary hover:underline">
                Report this issue
              </NuxtLink>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ServerCrash, RefreshCw, Home, AlertCircle } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const retry = () => {
  window.location.reload()
}

const goHome = () => {
  navigateTo('/')
}
</script>