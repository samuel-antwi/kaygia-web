<script setup lang="ts">
import { Mail, Building, Calendar } from "lucide-vue-next";
import { useFormatting } from "../../composables/useFormatting";

interface UserProfileProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    emailVerified: boolean;
    createdAt: Date | string;
    company: string | null;
  };
}

// Define props
const props = defineProps<UserProfileProps>();

// Use the formatting composable
const { formatDate } = useFormatting();
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>User Profile</CardTitle>
    </CardHeader>
    <CardContent class="space-y-4">
      <div class="flex flex-col items-center">
        <Avatar class="h-24 w-24 mb-4">
          <AvatarFallback
            :class="
              props.user.role === 'ADMIN'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted'
            "
            class="text-2xl"
          >
            {{
              props.user.name?.charAt(0)?.toUpperCase() ||
              props.user.email.charAt(0).toUpperCase()
            }}
          </AvatarFallback>
        </Avatar>
        <h2 class="text-xl font-semibold">
          {{ props.user.name || "Unnamed User" }}
        </h2>
        <Badge
          variant="outline"
          :class="
            props.user.role === 'ADMIN'
              ? 'bg-primary/10 text-primary border-primary/20'
              : 'bg-muted text-muted-foreground border-muted-foreground/20'
          "
        >
          {{ props.user.role }}
        </Badge>
      </div>

      <Separator />

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
            :class="
              props.user.emailVerified
                ? 'bg-green-100 text-green-800 hover:bg-green-100'
                : 'bg-orange-100 text-orange-800 hover:bg-orange-100'
            "
          >
            {{
              props.user.emailVerified ? "Email Verified" : "Email Not Verified"
            }}
          </Badge>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
