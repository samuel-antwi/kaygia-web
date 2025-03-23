<script setup lang="ts">
import {
  Briefcase,
  CheckCircle,
  MessageCircle,
  Receipt,
  Eye,
  File,
  FilePlus,
  MessageSquare,
  Receipt as ReceiptIcon,
  Bell,
  Calendar,
} from "lucide-vue-next";

definePageMeta({
  layout: "dashboard",
});

// Mock data for projects
type ProjectStatus = "pending" | "in-progress" | "completed";

interface Project {
  id: number;
  name: string;
  status: ProjectStatus;
  progress: number;
  deadline: string;
  updated: string;
}

const projects: Project[] = [
  {
    id: 1,
    name: "E-Commerce Website",
    status: "in-progress",
    progress: 65,
    deadline: "2023-12-15",
    updated: "2023-11-28",
  },
  {
    id: 2,
    name: "Marketing Landing Page",
    status: "completed",
    progress: 100,
    deadline: "2023-11-10",
    updated: "2023-11-08",
  },
  {
    id: 3,
    name: "Portfolio Redesign",
    status: "pending",
    progress: 0,
    deadline: "2024-01-20",
    updated: "2023-11-25",
  },
];

// Status badge styles
const statusStyles: Record<ProjectStatus, string> = {
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500",
  "in-progress":
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500",
  completed:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500",
};

// Mock statistics
const stats = [
  { title: "Active Projects", value: 2, icon: Briefcase },
  { title: "Completed Projects", value: 8, icon: CheckCircle },
  { title: "Messages", value: 3, icon: MessageCircle },
  { title: "Pending Invoices", value: 1, icon: Receipt },
];
</script>

<template>
  <div class="ml-8">
    <div class="mb-8">
      <h2 class="text-3xl font-bold mb-2">Welcome back, John!</h2>
      <p class="text-muted-foreground">
        Here's an overview of your projects and activities.
      </p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card v-for="stat in stats" :key="stat.title" class="flex items-center">
        <CardContent class="flex py-6 items-center gap-4">
          <div
            class="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <component :is="stat.icon" class="h-6 w-6 text-primary" />
          </div>
          <div>
            <p class="text-sm text-muted-foreground">{{ stat.title }}</p>
            <p class="text-2xl font-bold">{{ stat.value }}</p>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Recent Projects -->
    <Card class="mb-8">
      <CardHeader>
        <CardTitle>Recent Projects</CardTitle>
        <CardDescription
          >Monitor your ongoing and recent project activities.</CardDescription
        >
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="project in projects" :key="project.id">
              <TableCell class="font-medium">{{ project.name }}</TableCell>
              <TableCell>
                <Badge :class="statusStyles[project.status]">
                  {{
                    project.status
                      .replace("-", " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())
                  }}
                </Badge>
              </TableCell>
              <TableCell>
                <div class="flex items-center gap-2">
                  <Progress :value="project.progress" class="w-[80px]" />
                  <span class="text-xs">{{ project.progress }}%</span>
                </div>
              </TableCell>
              <TableCell>{{
                new Date(project.deadline).toLocaleDateString()
              }}</TableCell>
              <TableCell>{{
                new Date(project.updated).toLocaleDateString()
              }}</TableCell>
              <TableCell class="text-right">
                <Button variant="ghost" size="icon" as-child>
                  <NuxtLink :to="`/dashboard/projects/${project.id}`">
                    <Eye class="h-4 w-4" />
                    <span class="sr-only">View Project</span>
                  </NuxtLink>
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <Button variant="outline" as-child class="ml-auto">
          <NuxtLink to="/dashboard/projects">View All Projects</NuxtLink>
        </Button>
      </CardFooter>
    </Card>

    <!-- Activity and Notifications -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Recent Activity -->
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates on your projects.</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-6">
            <div class="flex items-start gap-4">
              <Avatar class="mt-1">
                <AvatarImage src="" alt="" />
                <AvatarFallback class="bg-primary/10 text-primary">
                  <CheckCircle class="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p class="text-sm font-medium">Project Update</p>
                <p class="text-sm text-muted-foreground">
                  Your "E-Commerce Website" project progress has been updated to
                  65%.
                </p>
                <p class="text-xs text-muted-foreground mt-1">2 days ago</p>
              </div>
            </div>
            <div class="flex items-start gap-4">
              <Avatar class="mt-1">
                <AvatarImage src="" alt="" />
                <AvatarFallback class="bg-primary/10 text-primary">
                  <MessageCircle class="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p class="text-sm font-medium">New Message</p>
                <p class="text-sm text-muted-foreground">
                  You received a new message regarding the "Portfolio Redesign"
                  project.
                </p>
                <p class="text-xs text-muted-foreground mt-1">3 days ago</p>
              </div>
            </div>
            <div class="flex items-start gap-4">
              <Avatar class="mt-1">
                <AvatarImage src="" alt="" />
                <AvatarFallback class="bg-primary/10 text-primary">
                  <File class="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p class="text-sm font-medium">New Project</p>
                <p class="text-sm text-muted-foreground">
                  New project "Portfolio Redesign" has been created and is
                  pending review.
                </p>
                <p class="text-xs text-muted-foreground mt-1">1 week ago</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" class="w-full">View All Activity</Button>
        </CardFooter>
      </Card>

      <!-- Quick Actions -->
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              class="h-auto flex flex-col items-center justify-center p-6 gap-2"
              as-child
            >
              <NuxtLink
                to="/dashboard/request-project"
                class="flex flex-col items-center"
              >
                <FilePlus class="h-8 w-8 mb-2" />
                <span>New Project</span>
              </NuxtLink>
            </Button>
            <Button
              variant="outline"
              class="h-auto flex flex-col items-center justify-center p-6 gap-2"
              as-child
            >
              <NuxtLink
                to="/dashboard/messages"
                class="flex flex-col items-center"
              >
                <MessageSquare class="h-8 w-8 mb-2" />
                <span>Messages</span>
              </NuxtLink>
            </Button>
            <Button
              variant="outline"
              class="h-auto flex flex-col items-center justify-center p-6 gap-2"
              as-child
            >
              <NuxtLink
                to="/dashboard/invoices"
                class="flex flex-col items-center"
              >
                <ReceiptIcon class="h-8 w-8 mb-2" />
                <span>Invoices</span>
              </NuxtLink>
            </Button>
            <Button
              variant="outline"
              class="h-auto flex flex-col items-center justify-center p-6 gap-2"
              as-child
            >
              <NuxtLink
                to="/dashboard/schedule"
                class="flex flex-col items-center"
              >
                <Calendar class="h-8 w-8 mb-2" />
                <span>Schedule</span>
              </NuxtLink>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
