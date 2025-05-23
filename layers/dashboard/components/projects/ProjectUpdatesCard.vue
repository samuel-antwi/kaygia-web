<script setup lang="ts">
import { ref } from "vue";
import { MessageSquare, Calendar, User, Bell, Send, X } from "lucide-vue-next";
import { useToast } from "@/components/ui/toast/use-toast";

interface ProjectUpdate {
  id: string;
  message: string;
  createdAt: Date | string;
  author: string;
  type: 'progress' | 'milestone' | 'feedback' | 'general';
}

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
const showCommentForm = ref(false);
const commentMessage = ref("");
const isSubmitting = ref(false);

// Fetch real updates from API
const { data: updatesData } = await useFetch(`/api/projects/${props.projectId}/updates`)

const updates = computed(() => updatesData.value?.updates || []);

// Fetch comments
const { data: commentsData, refresh: refreshComments } = await useFetch(`/api/projects/${props.projectId}/comments`, {
  server: false
});

const comments = computed(() => commentsData.value || []);

// Format date
const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 24) {
    return diffInHours === 0 ? "Just now" : `${diffInHours}h ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  }
};

// Get update type color
const getUpdateTypeColor = (type: string): string => {
  switch (type) {
    case "milestone":
      return "text-green-600";
    case "progress":
      return "text-blue-600";
    case "feedback":
      return "text-purple-600";
    default:
      return "text-gray-600";
  }
};

// Get update type icon
const getUpdateTypeIcon = (type: string) => {
  switch (type) {
    case "milestone":
      return Bell;
    case "progress":
      return MessageSquare;
    case "feedback":
      return User;
    default:
      return MessageSquare;
  }
};

// Submit comment
const submitComment = async () => {
  if (!commentMessage.value.trim()) {
    toast({
      title: "Error",
      description: "Please enter a comment",
      variant: "destructive"
    });
    return;
  }

  isSubmitting.value = true;

  try {
    const response = await $fetch(`/api/projects/${props.projectId}/comments`, {
      method: "POST",
      body: {
        message: commentMessage.value,
        type: "comment"
      }
    });

    toast({
      title: "Success",
      description: "Your comment has been posted"
    });
    
    commentMessage.value = "";
    showCommentForm.value = false;
    await refreshComments();
  } catch (error: any) {
    toast({
      title: "Error",
      description: error?.data?.message || "Failed to post comment",
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
        Latest Updates
      </CardTitle>
      <CardDescription>Recent activity and communication from your project team</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="space-y-4">
        <div v-for="update in updates" :key="update.id" class="border-l-2 border-muted pl-4 pb-4">
          <div class="flex items-start space-x-3">
            <div class="p-1 rounded-full bg-muted">
              <component :is="getUpdateTypeIcon(update.type)" class="h-3 w-3" :class="getUpdateTypeColor(update.type)" />
            </div>
            <div class="flex-1 space-y-1">
              <p class="text-sm">{{ update.message }}</p>
              <div class="flex items-center space-x-2 text-xs text-muted-foreground">
                <span>{{ update.author }}</span>
                <span>•</span>
                <span>{{ formatDate(update.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Comments Section -->
      <div v-if="comments.length > 0" class="mt-6 pt-4 border-t">
        <h4 class="text-sm font-medium mb-3">Comments & Questions</h4>
        <div class="space-y-3">
          <div v-for="comment in comments" :key="comment.id" class="bg-muted/50 rounded-lg p-3">
            <p class="text-sm">{{ comment.message }}</p>
            <div class="flex items-center space-x-2 text-xs text-muted-foreground mt-2">
              <span>{{ comment.userName || 'Anonymous' }}</span>
              <span>•</span>
              <span>{{ formatDate(comment.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Comment Form -->
      <div v-if="showCommentForm" class="mt-4 space-y-3">
        <Textarea
          v-model="commentMessage"
          placeholder="Type your comment or question here..."
          rows="3"
          class="resize-none"
        />
        <div class="flex gap-2">
          <Button 
            @click="submitComment" 
            :disabled="isSubmitting || !commentMessage.trim()"
            size="sm"
            class="flex-1"
          >
            <Send class="h-4 w-4 mr-2" />
            {{ isSubmitting ? 'Posting...' : 'Post Comment' }}
          </Button>
          <Button 
            @click="showCommentForm = false; commentMessage = ''" 
            variant="outline"
            size="sm"
          >
            <X class="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <!-- Add Comment Button -->
      <div v-if="!showCommentForm" class="mt-6 pt-4 border-t">
        <Button 
          variant="outline" 
          class="w-full"
          @click="showCommentForm = true"
        >
          <MessageSquare class="h-4 w-4 mr-2" />
          Add Comment or Question
        </Button>
      </div>
    </CardContent>
  </Card>
</template>