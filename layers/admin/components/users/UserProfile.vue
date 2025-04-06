<script setup lang="ts">
import { Mail, Building, Calendar, UserCog } from "lucide-vue-next";
import { useFormatting } from "../../composables/useFormatting";
import EditProfileForm from "./EditProfileForm.vue";

interface UserProfileProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    emailVerified: boolean;
    active: boolean;
    createdAt: Date | string;
    company: string | null;
  };
}

// Define props
const props = defineProps<UserProfileProps>();
const emit = defineEmits<{
  refresh: [];
}>();

// Use the formatting composable
const { formatDate } = useFormatting();

// State for tracking edit dialog
const showEditDialog = ref(false);

// Function to handle user profile update
function handleProfileUpdated(updatedUser: any) {
  emit("refresh");
  showEditDialog.value = false;
}
</script>

<template>
  <!-- This component might be removed or repurposed later -->
  <!-- Currently, its display logic is handled directly in the parent page -->
  <!-- Keeping the structure in case we need a dedicated component later -->
  <div class="space-y-2">
    <div class="flex items-center text-sm">
      <Mail class="h-4 w-4 mr-2 text-muted-foreground" />
      <span>{{ props.user.email }}</span>
    </div>
    <div v-if="props.user.company" class="flex items-center text-sm">
      <Building class="h-4 w-4 mr-2 text-muted-foreground" />
      <span>{{ props.user.company }}</span>
    </div>
    <div class="flex items-center text-sm">
      <Calendar class="h-4 w-4 mr-2 text-muted-foreground" />
      <span>Joined {{ formatDate(props.user.createdAt) }}</span>
    </div>
    <div class="flex items-center text-sm">
      <Badge
        :variant="props.user.emailVerified ? 'default' : 'outline'"
        :class="{
          'bg-green-100 text-green-800 hover:bg-green-100':
            props.user.emailVerified,
          'bg-orange-100 text-orange-800 hover:bg-orange-100':
            !props.user.emailVerified,
        }"
      >
        {{ props.user.emailVerified ? "Email Verified" : "Email Not Verified" }}
      </Badge>
    </div>
  </div>
</template>
