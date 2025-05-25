<script setup lang="ts">
import { ref } from 'vue';
import { MessageCircle, Phone, Mail, HelpCircle, FileText } from "lucide-vue-next";
import { useRouter } from 'vue-router';
import { useToast } from '~/components/ui/toast/use-toast';
import { useMessaging } from '~/layers/dashboard/composables/useMessaging';

interface Props {
  projectId: string;
}

const props = defineProps<Props>();
const router = useRouter();
const { toast } = useToast();
const { createConversation } = useMessaging();

const isCreatingConversation = ref(false);

const startConversation = async () => {
  isCreatingConversation.value = true;
  
  try {
    // First check if a conversation already exists for this project
    const { conversations: existingConversations } = await $fetch('/api/messaging/conversations', {
      query: { projectId: props.projectId }
    });
    
    if (existingConversations && existingConversations.length > 0) {
      // Use existing conversation
      const existingConversation = existingConversations[0];
      await router.push({
        path: '/dashboard/messages',
        query: { conversation: existingConversation.id }
      });
      return;
    }
    
    // Get project details to use as conversation title
    const projectData = await $fetch(`/api/projects/${props.projectId}`);
    const projectTitle = projectData?.project?.title || 'Project';
    
    // Create a new conversation for this project
    const conversation = await createConversation({
      projectId: props.projectId,
      title: `Project Discussion: ${projectTitle}`,
      type: 'project'
    });
    
    // Navigate to messages page with the new conversation
    await router.push({
      path: '/dashboard/messages',
      query: { conversation: conversation.id }
    });
  } catch (error) {
    console.error('Failed to create conversation:', error);
    toast({
      title: 'Error',
      description: 'Failed to start conversation. Please try again.',
      variant: 'destructive'
    });
  } finally {
    isCreatingConversation.value = false;
  }
};
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center">
        <HelpCircle class="h-5 w-5 mr-2" />
        Need Help?
      </CardTitle>
      <CardDescription>Get support and assistance with your project</CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <!-- Quick Actions -->
      <div class="space-y-3">
        <Button 
          class="w-full justify-start" 
          variant="default"
          @click="startConversation"
          :disabled="isCreatingConversation"
        >
          <MessageCircle class="h-4 w-4 mr-2" />
          {{ isCreatingConversation ? 'Starting conversation...' : 'Message Team' }}
        </Button>
        
        <Button class="w-full justify-start" variant="outline" as-child>
          <NuxtLink :to="`/dashboard/tickets?project=${projectId}`">
            <HelpCircle class="h-4 w-4 mr-2" />
            Create Support Ticket
          </NuxtLink>
        </Button>
        
        <Button class="w-full justify-start" variant="outline">
          <Mail class="h-4 w-4 mr-2" />
          Email Project Manager
        </Button>
        
        <Button class="w-full justify-start" variant="outline">
          <Phone class="h-4 w-4 mr-2" />
          Schedule a Call
        </Button>
      </div>

      <Separator />

      <!-- Contact Information -->
      <div class="space-y-3">
        <h4 class="text-sm font-medium">Your Project Team</h4>
        
        <div class="space-y-2 text-sm">
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground">Project Manager:</span>
            <span class="font-medium">Sarah Johnson</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground">Lead Developer:</span>
            <span class="font-medium">Mike Chen</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground">Designer:</span>
            <span class="font-medium">Emma Wilson</span>
          </div>
        </div>
      </div>

      <Separator />

      <!-- Resources -->
      <div class="space-y-3">
        <h4 class="text-sm font-medium">Helpful Resources</h4>
        
        <div class="space-y-2">
          <Button variant="ghost" size="sm" class="w-full justify-start p-0 h-auto">
            <FileText class="h-4 w-4 mr-2" />
            <span class="text-sm">Project Guidelines & FAQ</span>
          </Button>
          
          <Button variant="ghost" size="sm" class="w-full justify-start p-0 h-auto">
            <FileText class="h-4 w-4 mr-2" />
            <span class="text-sm">How to Provide Feedback</span>
          </Button>
          
          <Button variant="ghost" size="sm" class="w-full justify-start p-0 h-auto">
            <FileText class="h-4 w-4 mr-2" />
            <span class="text-sm">Content Preparation Guide</span>
          </Button>
        </div>
      </div>

      <!-- Response Time Notice -->
      <div class="p-3 bg-muted rounded-lg">
        <p class="text-xs text-muted-foreground">
          <strong>Response Time:</strong> We typically respond to messages within 24 hours during business days.
          For urgent matters, please call our support line.
        </p>
      </div>
    </CardContent>
  </Card>
</template>