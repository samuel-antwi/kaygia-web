<script setup lang="ts">
import { MessageSquare, Calendar, User, Bell } from "lucide-vue-next";

interface ProjectUpdate {
  id: string;
  message: string;
  createdAt: Date | string;
  author: string;
  type: 'progress' | 'milestone' | 'feedback' | 'general';
}

interface Props {
  updates?: ProjectUpdate[];
}

defineProps<Props>();

// Mock updates for demonstration
const mockUpdates: ProjectUpdate[] = [
  {
    id: "1",
    message: "Initial wireframes and project scope have been finalized. Moving to design phase.",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    author: "Project Manager",
    type: "milestone"
  },
  {
    id: "2", 
    message: "Design mockups for homepage and key pages are ready for your review.",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    author: "Design Team",
    type: "progress"
  },
  {
    id: "3",
    message: "Thank you for the logo files! We've incorporated them into the design.",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    author: "Design Team",
    type: "feedback"
  }
];

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
        <div v-for="update in mockUpdates" :key="update.id" class="border-l-2 border-muted pl-4 pb-4">
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
      
      <div class="mt-6 pt-4 border-t">
        <Button variant="outline" class="w-full">
          <MessageSquare class="h-4 w-4 mr-2" />
          Add Comment or Question
        </Button>
      </div>
    </CardContent>
  </Card>
</template>