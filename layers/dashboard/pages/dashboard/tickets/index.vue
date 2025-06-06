<script setup lang="ts">
import {
  Search,
  AlertCircle,
  Plus,
  MessageSquare, // Keep for empty state
} from "lucide-vue-next";
import { useTicketStore } from "../../../stores/ticketStore"; // Adjusted path
import { useAuth } from "../../../../auth/composables/useAuth"; // Adjusted path
import { useTicketUtils } from "../../../composables/useTicketUtils"; // Adjusted path
import { storeToRefs } from "pinia";
import { z } from "zod";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import DialogContentFixed from "@/components/ui/dialog/DialogContentFixed.vue";

definePageMeta({
  layout: "dashboard",
  middleware: "auth",
});

// Define a special value for "no project selected"
const NO_PROJECT_VALUE = "none";

// State and refs
const searchQuery = ref("");
const showNewTicket = ref(false);
const projectsList = ref<{ id: string; title: string }[]>([]);
const isLoadingProjects = ref(false);

// Initialize ticket store
const ticketStore = useTicketStore();
ticketStore.error = null; // Clear errors on setup
const { sortedTickets, isLoadingList, error, isCreatingTicket } =
  storeToRefs(ticketStore);

// Auth state
const { user, loading: authLoading } = useAuth();

// Utils
const { formatDate, formatTime, getStatusBadgeVariant } = useTicketUtils();

// New ticket form schema
const formSchema = toTypedSchema(
  z.object({
    subject: z.string().min(5, "Subject must be at least 5 characters"),
    content: z
      .string()
      .min(10, "Initial message must be at least 10 characters"),
    projectId: z.string().optional(),
  })
);

// Form initialization - directly following the documentation pattern
const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    subject: "",
    content: "",
    projectId: NO_PROJECT_VALUE,
  },
});

// Reset form when dialog closes
watch(
  () => showNewTicket.value,
  (isOpen) => {
    if (!isOpen) {
      form.resetForm();
    }
  }
);

// Handle form submission
const onSubmit = form.handleSubmit(async (values) => {
  // Convert our special "none" value to undefined for the API
  const projectIdToSend =
    values.projectId === NO_PROJECT_VALUE ? undefined : values.projectId;

  const success = await ticketStore.createTicket(
    values.subject,
    values.content,
    projectIdToSend
  );

  if (success) {
    showNewTicket.value = false;
  }
});

// Watch for auth state before fetching data
watchEffect(async () => {
  if (!authLoading.value && user.value) {
    ticketStore.fetchTickets();
    isLoadingProjects.value = true;
    try {
      const { data: projectsData, error: projectsError } =
        await useFetch<{ id: string; title: string }[]>("/api/projects");
      if (projectsError.value) {
        console.error("Error fetching projects:", projectsError.value);
      } else {
        projectsList.value = projectsData.value || [];
      }
    } catch (err) {
      console.error("Unexpected error fetching projects:", err);
    } finally {
      isLoadingProjects.value = false;
    }
  }
});

// Filter tickets by search query
const filteredTickets = computed(() => {
  if (!searchQuery.value) return sortedTickets.value;
  const query = searchQuery.value.toLowerCase();

  return sortedTickets.value.filter((ticket) => {
    return (
      ticket.subject.toLowerCase().includes(query) ||
      ticket.ticketNumber.includes(query.replace(/[^0-9]/g, ""))
    );
  });
});

// Navigate to ticket detail page
const viewTicket = (ticketId: string) => {
  navigateTo(`/dashboard/tickets/${ticketId}`);
};
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center gap-4 mb-6">
      <!-- Left side: Title and Description -->
      <div class="flex-1">
        <h2 class="text-2xl sm:text-3xl font-bold">Support Tickets</h2>
        <p class="text-muted-foreground text-sm mt-1">
          View and manage your support requests.
        </p>
      </div>

      <!-- Right side: Search, Actions -->
      <div class="flex flex-col md:flex-row md:items-center gap-2">
        <!-- Search Input -->
        <div class="relative md:w-64 bg-white">
          <Search
            class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          />
          <Input
            v-model="searchQuery"
            placeholder="Search tickets..."
            class="w-full pl-10 h-9"
          />
        </div>

        <!-- New Ticket Button -->
        <Button
          @click="showNewTicket = true"
          class="h-9 flex-shrink-0 flex items-center gap-2"
        >
          <Plus class="w-4 h-4" />
          <span>New Ticket</span>
        </Button>
      </div>
    </div>

    <!-- Main content: Ticket List -->
    <Card class="overflow-hidden">
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>Your Tickets</CardTitle>
            <CardDescription>
              Click on a ticket to view details and add comments.
            </CardDescription>
          </div>
          <!-- Search moved to main header -->
        </div>
      </CardHeader>
      <CardContent class="p-0">
        <!-- Loading State -->
        <div
          v-if="authLoading || isLoadingList"
          class="flex justify-center py-12"
        >
          <div
            class="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"
          ></div>
          <span class="sr-only">Loading...</span>
        </div>

        <!-- Content Area (Error, Empty, List) -->
        <div v-else>
          <!-- Error Display -->
          <div v-if="error" class="p-6 text-center">
            <AlertCircle class="mx-auto h-10 w-10 text-destructive mb-2" />
            <p class="text-destructive font-medium mb-1">
              Error Loading Tickets
            </p>
            <p class="text-muted-foreground">{{ error }}</p>
          </div>

          <!-- No Tickets Display -->
          <div
            v-else-if="sortedTickets.length === 0"
            class="flex flex-col items-center justify-center py-12 px-4 text-center"
          >
            <MessageSquare class="h-12 w-12 text-muted-foreground mb-3" />
            <h3 class="text-lg font-medium mb-1">No Tickets Yet</h3>
            <p class="text-muted-foreground max-w-md">
              You haven't created any support tickets. Click the "New Ticket"
              button to submit a request.
            </p>
            <Button
              @click="showNewTicket = true"
              variant="outline"
              class="mt-4"
            >
              New Ticket
            </Button>
          </div>

          <!-- Ticket List Display -->
          <div v-else class="divide-y">
            <!-- Header Row (Optional) -->
            <!--
            <div class="hidden sm:flex p-4 bg-muted/50 text-sm font-medium text-muted-foreground">
              <div class="flex-1">Subject</div>
              <div class="w-24 text-center">Status</div>
              <div class="w-32 text-right">Last Updated</div>
            </div>
            -->
            <div
              v-for="ticket in filteredTickets"
              :key="ticket.id"
              @click="viewTicket(ticket.id)"
              class="p-4 sm:p-6 hover:bg-accent/50 cursor-pointer transition-colors"
            >
              <div
                class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
              >
                <div class="flex-1 min-w-0">
                  <h4 class="font-medium mb-1 sm:mb-0 truncate">
                    {{ ticket.subject }}
                    <Badge variant="outline" class="ml-2">
                      #{{ ticket.ticketNumber }}
                    </Badge>
                  </h4>
                  <p class="text-sm text-muted-foreground sm:hidden">
                    {{ ticket.status }} -
                    {{
                      ticket.lastRepliedAt
                        ? formatDate(ticket.lastRepliedAt)
                        : "No reply yet"
                    }}
                  </p>
                </div>
                <div class="w-full sm:w-24 text-left sm:text-center">
                  <Badge :variant="getStatusBadgeVariant(ticket.status)">
                    {{ ticket.status }}
                  </Badge>
                </div>
                <div
                  class="w-full sm:w-32 text-left sm:text-right text-sm text-muted-foreground"
                >
                  {{
                    ticket.lastRepliedAt
                      ? formatDate(ticket.lastRepliedAt)
                      : "No reply yet"
                  }}
                  {{
                    ticket.lastRepliedAt ? formatTime(ticket.lastRepliedAt) : ""
                  }}
                </div>
              </div>
            </div>
          </div>

          <!-- Empty search results -->
          <div
            v-if="
              searchQuery &&
              filteredTickets.length === 0 &&
              sortedTickets.length > 0
            "
            class="p-6 text-center"
          >
            <Search class="mx-auto h-10 w-10 text-muted-foreground mb-2" />
            <p class="text-muted-foreground">
              No tickets found matching "{{ searchQuery }}".
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- New Ticket Dialog -->
    <Dialog :open="showNewTicket" @update:open="showNewTicket = $event">
      <DialogContentFixed class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Ticket</DialogTitle>
          <DialogDescription>
            Submit a new support request. Please provide a clear subject and
            detailed description.
          </DialogDescription>
        </DialogHeader>
        <form @submit="onSubmit" class="space-y-4 mt-4">
          <FormField v-slot="{ componentField }" name="subject">
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Enter ticket subject"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Project Selector -->
          <FormField v-slot="{ componentField }" name="projectId">
            <FormItem>
              <FormLabel>Related Project (Optional)</FormLabel>
              <Select v-bind="componentField">
                <FormControl>
                  <SelectTrigger :disabled="isLoadingProjects">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem :value="NO_PROJECT_VALUE">
                    None - General Inquiry
                  </SelectItem>
                  <SelectItem
                    v-for="project in projectsList"
                    :key="project.id"
                    :value="project.id"
                  >
                    {{ project.title }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="content">
            <FormItem>
              <FormLabel>Details</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your issue or request..."
                  rows="6"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <DialogFooter class="mt-6">
            <Button
              type="button"
              variant="outline"
              @click="showNewTicket = false"
              :disabled="isCreatingTicket"
            >
              Cancel
            </Button>
            <Button type="submit" :disabled="isCreatingTicket" class="gap-2">
              <div
                v-if="isCreatingTicket"
                class="animate-spin h-4 w-4 border-2 border-background border-t-transparent rounded-full"
              ></div>
              <span>Create Ticket</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContentFixed>
    </Dialog>
  </div>
</template>
