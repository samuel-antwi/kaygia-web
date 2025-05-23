<script setup lang="ts">
import { ref } from "vue";
import { MessageSquare, Calendar, User, Bell, Send, X, ShieldCheck, AlertCircle } from "lucide-vue-next";
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
const commentType = ref<"comment" | "question">("comment");
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
        type: commentType.value
      }
    });

    toast({
      title: "Success",
      description: "Your comment has been posted"
    });
    
    commentMessage.value = "";
    commentType.value = "comment";
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
        <h4 class="text-sm font-medium mb-4 flex items-center gap-2">
          <MessageSquare class="h-4 w-4" />
          Comments & Questions
          <Badge variant="secondary" class="ml-auto">{{ comments.length }}</Badge>
        </h4>
        <div class="space-y-3">
          <div 
            v-for="comment in comments" 
            :key="comment.id" 
            :class="[
              'relative rounded-lg p-4 transition-all',
              comment.userRole === 'CLIENT' 
                ? 'bg-background border ml-0 mr-8' 
                : 'bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 ml-8 mr-0'
            ]"
          >
            <!-- User indicator -->
            <div class="absolute -left-3 top-4 w-6 h-6 rounded-full flex items-center justify-center"
                 :class="comment.userRole === 'CLIENT' ? 'bg-green-500' : 'bg-blue-500'"
                 v-if="comment.userRole === 'CLIENT'">
              <User class="h-3 w-3 text-white" />
            </div>
            <div class="absolute -right-3 top-4 w-6 h-6 rounded-full flex items-center justify-center bg-blue-500"
                 v-if="comment.userRole !== 'CLIENT'">
              <ShieldCheck class="h-3 w-3 text-white" />
            </div>
            
            <!-- Comment header -->
            <div class="flex items-start justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="font-medium text-sm">
                  {{ comment.userName || 'Anonymous' }}
                </span>
                <Badge 
                  :variant="comment.userRole === 'CLIENT' ? 'secondary' : 'default'"
                  class="text-xs"
                >
                  {{ comment.userRole === 'CLIENT' ? 'You' : 'Team Response' }}
                </Badge>
                <span class="text-xs text-muted-foreground">
                  {{ formatDate(comment.createdAt) }}
                </span>
              </div>
              <Badge 
                v-if="comment.type === 'question'" 
                variant="outline" 
                class="text-xs"
              >
                Question
              </Badge>
            </div>
            
            <!-- Comment body -->
            <p class="text-sm leading-relaxed">{{ comment.message }}</p>
          </div>
        </div>
      </div>
      
      <!-- Comment Form -->
      <div v-if="showCommentForm" class="mt-4 space-y-3">
        <div class="flex gap-2">
          <Select v-model="commentType" class="w-40">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="comment">
                <div class="flex items-center gap-2">
                  <MessageSquare class="h-3 w-3" />
                  Comment
                </div>
              </SelectItem>
              <SelectItem value="question">
                <div class="flex items-center gap-2">
                  <AlertCircle class="h-3 w-3 text-amber-600" />
                  Question
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <div class="flex-1 text-xs text-muted-foreground flex items-center">
            {{ commentType === 'question' ? 'Ask a question and get a response from the team' : 'Share feedback or updates' }}
          </div>
        </div>
        <Textarea
          v-model="commentMessage"
          :placeholder="commentType === 'question' ? 'What would you like to know?' : 'Share your thoughts...'"
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
            {{ isSubmitting ? 'Posting...' : commentType === 'question' ? 'Ask Question' : 'Post Comment' }}
          </Button>
          <Button 
            @click="showCommentForm = false; commentMessage = ''; commentType = 'comment'" 
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