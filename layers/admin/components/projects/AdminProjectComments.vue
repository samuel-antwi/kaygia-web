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

// Get role badge
const getRoleBadge = (role: string) => {
  switch (role) {
    case "ADMIN":
    case "SUPER_ADMIN":
      return { icon: ShieldCheck, color: "text-blue-600", bg: "bg-blue-100" };
    case "CLIENT":
      return { icon: User, color: "text-green-600", bg: "bg-green-100" };
    default:
      return { icon: User, color: "text-gray-600", bg: "bg-gray-100" };
  }
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
        <div v-for="comment in comments" :key="comment.id" 
             class="border rounded-lg p-4"
             :class="{
               'border-blue-200 bg-blue-50/50': comment.userRole === 'ADMIN' || comment.userRole === 'SUPER_ADMIN',
               'border-green-200 bg-green-50/50': comment.userRole === 'CLIENT'
             }"
        >
          <div class="flex items-start gap-3">
            <div :class="[getRoleBadge(comment.userRole).bg, 'p-2 rounded-full']">
              <component :is="getRoleBadge(comment.userRole).icon" 
                        :class="[getRoleBadge(comment.userRole).color, 'h-4 w-4']" />
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-medium text-sm">{{ comment.userName || 'Anonymous' }}</span>
                <Badge variant="outline" class="text-xs">
                  {{ comment.userRole }}
                </Badge>
                <span class="text-xs text-muted-foreground">{{ formatDate(comment.createdAt) }}</span>
              </div>
              <p class="text-sm">{{ comment.message }}</p>
              
              <!-- Show warning for questions -->
              <div v-if="comment.type === 'question' && comment.userRole === 'CLIENT'" 
                   class="mt-2 flex items-center gap-2 text-xs text-amber-600">
                <AlertCircle class="h-3 w-3" />
                <span>Client question - consider responding</span>
              </div>
            </div>
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