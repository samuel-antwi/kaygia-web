<script setup lang="ts">
import { ref } from "vue";
import { MessageSquare, Send, User, ShieldCheck, AlertCircle } from "lucide-vue-next";
import { useToast } from "@/components/ui/toast/use-toast";

interface ProjectComment {
  id: string;
  message: string;
  type: string;
  createdAt: Date | string;
  userId: string;
  userName: string | null;
  userRole: string;
}

interface Props {
  projectId: string;
}

const props = defineProps<Props>();
const { toast } = useToast();

// Comment form state
const replyMessage = ref("");
const isSubmitting = ref(false);

// Fetch comments
const { data: comments, refresh: refreshComments } = await useFetch<ProjectComment[]>(
  `/api/admin/projects/${props.projectId}/comments`,
  {
    server: false
  }
);

// Format date
const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(dateObj);
};


// Submit admin reply
const submitReply = async () => {
  if (!replyMessage.value.trim()) {
    toast({
      title: "Error",
      description: "Please enter a message",
      variant: "destructive"
    });
    return;
  }

  isSubmitting.value = true;

  try {
    await $fetch(`/api/admin/projects/${props.projectId}/comments`, {
      method: "POST",
      body: {
        message: replyMessage.value,
        type: "response"
      }
    });

    toast({
      title: "Success",
      description: "Your response has been posted"
    });
    
    replyMessage.value = "";
    await refreshComments();
  } catch (error: any) {
    toast({
      title: "Error",
      description: error?.data?.message || "Failed to post response",
      variant: "destructive"
    });
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center">
        <MessageSquare class="h-5 w-5 mr-2" />
        Client Comments & Questions
      </CardTitle>
      <CardDescription>
        View and respond to client comments on this project
      </CardDescription>
    </CardHeader>
    <CardContent>
      <!-- Empty State -->
      <div v-if="!comments || comments.length === 0" class="text-center py-8">
        <MessageSquare class="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p class="text-muted-foreground">No comments yet</p>
        <p class="text-sm text-muted-foreground mt-1">
          Client comments and questions will appear here
        </p>
      </div>

      <!-- Comments List -->
      <div v-else class="space-y-4 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h4 class="text-sm font-medium flex items-center gap-2">
            <MessageSquare class="h-4 w-4" />
            Conversation Thread
          </h4>
          <Badge variant="secondary">{{ comments.length }} messages</Badge>
        </div>
        
        <div class="space-y-3">
          <div 
            v-for="comment in comments" 
            :key="comment.id" 
            :class="[
              'relative rounded-lg p-4 transition-all',
              comment.userRole === 'CLIENT' 
                ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 ml-0 mr-12' 
                : 'bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 ml-12 mr-0'
            ]"
          >
            <!-- User indicator -->
            <div 
              class="absolute top-4 w-8 h-8 rounded-full flex items-center justify-center shadow-sm"
              :class="[
                comment.userRole === 'CLIENT' 
                  ? '-left-4 bg-green-500' 
                  : '-right-4 bg-blue-500'
              ]"
            >
              <component 
                :is="comment.userRole === 'CLIENT' ? User : ShieldCheck" 
                class="h-4 w-4 text-white" 
              />
            </div>
            
            <!-- Comment header -->
            <div class="flex items-start justify-between mb-3">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-semibold text-sm">
                    {{ comment.userName || 'Anonymous' }}
                  </span>
                  <Badge 
                    :variant="comment.userRole === 'CLIENT' ? 'secondary' : 'default'"
                    class="text-xs"
                  >
                    {{ comment.userRole === 'CLIENT' ? 'Client' : comment.userRole }}
                  </Badge>
                  <span class="text-xs text-muted-foreground">
                    {{ formatDate(comment.createdAt) }}
                  </span>
                </div>
                <!-- Question indicator -->
                <div v-if="comment.type === 'question' && comment.userRole === 'CLIENT'" 
                     class="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-500">
                  <AlertCircle class="h-3 w-3" />
                  <span>Awaiting response</span>
                </div>
              </div>
              
              <!-- Type badge -->
              <div class="flex items-center gap-2">
                <Badge 
                  v-if="comment.type === 'question'" 
                  variant="outline" 
                  class="text-xs"
                >
                  Question
                </Badge>
                <Badge 
                  v-else-if="comment.type === 'response'" 
                  variant="outline" 
                  class="text-xs"
                >
                  Response
                </Badge>
              </div>
            </div>
            
            <!-- Comment body -->
            <p class="text-sm leading-relaxed whitespace-pre-wrap">{{ comment.message }}</p>
          </div>
        </div>
      </div>

      <!-- Reply Form -->
      <div class="border-t pt-4">
        <h4 class="text-sm font-medium mb-3">Post a Response</h4>
        <div class="space-y-3">
          <Textarea
            v-model="replyMessage"
            placeholder="Type your response to the client..."
            rows="3"
            class="resize-none"
          />
          <Button 
            @click="submitReply" 
            :disabled="isSubmitting || !replyMessage.trim()"
            class="w-full sm:w-auto"
          >
            <Send class="h-4 w-4 mr-2" />
            {{ isSubmitting ? 'Posting...' : 'Post Response' }}
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
</template>