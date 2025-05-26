<script setup lang="ts">
import { ref, computed, h } from "vue";
import { AlertTriangle, Loader2, UserX, RotateCcw, Search, ArrowLeft, MoreHorizontal } from "lucide-vue-next";
import { useToast } from "@/components/ui/toast/use-toast";
import { useFormatting } from "#layers/admin/composables/useFormatting";
import { isSuperAdmin } from "#layers/admin/utils/adminAccess";
import ConfirmDialog from "#layers/core/components/ConfirmDialog.vue";
import type { ColumnDef } from "@tanstack/vue-table";
import {
  FlexRender,
  getCoreRowModel,
  useVueTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/vue-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

definePageMeta({
  layout: "admin",
});

// Check if current user is super admin
const { user: currentUser } = useAuth();
if (!currentUser.value || !isSuperAdmin(currentUser.value.role)) {
  throw createError({
    statusCode: 403,
    statusMessage: "Access denied. Super admin privileges required.",
  });
}

const { toast } = useToast();
const { formatDate } = useFormatting();
const searchQuery = ref("");

// Restore dialog state
const restoreDialog = ref({
  open: false,
  userId: "",
  userName: "",
  loading: false
});

// Fetch deleted users
const { data, pending, error, refresh } = await useFetch("/api/admin/users/deleted", {
  lazy: false,
  server: true,
});

const deletedUsers = computed(() => data.value?.users || []);

// Define table columns
const columns: ColumnDef<any>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const user = row.original;
      return h('div', { class: 'flex items-center gap-3' }, [
        h(Avatar, { class: 'h-8 w-8' }, {
          default: () => [
            user.avatarUrl 
              ? h(AvatarImage, { src: user.avatarUrl })
              : h(AvatarFallback, { class: 'bg-red-100 text-red-700' }, () => 
                  h(UserX, { class: 'h-4 w-4' })
                )
          ]
        }),
        h('div', [
          h('div', { class: 'font-medium' }, user.name || 'Unnamed User'),
          h('div', { class: 'text-sm text-muted-foreground' }, user.email)
        ])
      ]);
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      return h(Badge, { variant: 'outline' }, () => row.getValue('role'));
    },
  },
  {
    accessorKey: "company",
    header: "Company",
    cell: ({ row }) => row.getValue('company') || '-',
  },
  {
    accessorKey: "deletedAt",
    header: "Deleted",
    cell: ({ row }) => {
      const date = row.getValue('deletedAt') as string | Date | null;
      return h('div', [
        h('div', { class: 'font-medium' }, formatDeletedDate(date)),
        h('div', { class: 'text-xs text-muted-foreground' }, formatDate(date))
      ]);
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      
      return h('div', { class: 'flex items-center justify-end gap-2' }, [
        h(Button, {
          variant: 'outline',
          size: 'sm',
          onClick: () => openRestoreDialog(user),
        }, {
          default: () => [
            h(RotateCcw, { class: 'h-4 w-4 mr-2' }),
            'Restore'
          ]
        }),
        h(DropdownMenu, {}, {
          default: () => [
            h(DropdownMenuTrigger, { asChild: true }, () => 
              h(Button, { variant: 'ghost', size: 'icon' }, () => 
                h(MoreHorizontal, { class: 'h-4 w-4' })
              )
            ),
            h(DropdownMenuContent, { align: 'end' }, () => [
              h(DropdownMenuLabel, {}, () => 'Actions'),
              h(DropdownMenuItem, { 
                onClick: () => navigateTo(`/admin/users/${user.id}`)
              }, () => 'View Details'),
              h(DropdownMenuItem, { 
                onClick: () => openRestoreDialog(user)
              }, () => 'Restore User'),
            ])
          ]
        })
      ]);
    },
  },
];

// Initialize table
const table = useVueTable({
  data: deletedUsers,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  state: {
    get globalFilter() {
      return searchQuery.value;
    },
  },
  onGlobalFilterChange: (value: string) => {
    searchQuery.value = value;
  },
});

// Open restore dialog
const openRestoreDialog = (user: any) => {
  restoreDialog.value = {
    open: true,
    userId: user.id,
    userName: user.name || user.email,
    loading: false
  };
};

// Restore user
const restoreUser = async () => {
  restoreDialog.value.loading = true;

  try {
    const response = await $fetch(`/api/admin/users/${restoreDialog.value.userId}/restore`, {
      method: "POST"
    });

    if (response.success) {
      toast({
        title: "Success",
        description: "User restored successfully",
      });
      restoreDialog.value.open = false;
      await refresh();
    }
  } catch (error: any) {
    toast({
      title: "Error",
      description: error.data?.statusMessage || "Failed to restore user",
      variant: "destructive",
    });
  } finally {
    restoreDialog.value.loading = false;
  }
};

// Format deletion date
const formatDeletedDate = (date: string | Date | null) => {
  if (!date) return "Unknown";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - dateObj.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <div class="flex items-center gap-3 mb-2">
          <Button variant="ghost" size="sm" asChild>
            <NuxtLink to="/admin/users" class="flex items-center gap-2">
              <ArrowLeft class="w-4 h-4" />
              Back to Active Users
            </NuxtLink>
          </Button>
        </div>
        <h1 class="text-2xl font-bold tracking-tight">Deleted Users</h1>
        <p class="text-muted-foreground">
          Manage soft-deleted users and restore them if needed
        </p>
      </div>
    </div>

    <!-- Notice -->
    <Alert>
      <UserX class="h-4 w-4" />
      <AlertTitle>Soft Delete Protection</AlertTitle>
      <AlertDescription>
        These users have been soft-deleted and cannot log in. Their data is preserved for audit purposes.
        You can restore them at any time.
      </AlertDescription>
    </Alert>

    <!-- Search -->
    <div class="flex gap-3 items-center">
      <div class="relative flex-1 max-w-md">
        <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          v-model="searchQuery"
          placeholder="Search deleted users..."
          class="pl-8"
        />
      </div>
      <Button @click="refresh" variant="outline" size="sm">
        <span v-if="pending">
          <Loader2 class="mr-2 h-4 w-4 animate-spin" />
          Refreshing
        </span>
        <span v-else>Refresh</span>
      </Button>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="flex items-center justify-center py-12">
      <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
      <p class="ml-3 text-muted-foreground">Loading deleted users...</p>
    </div>

    <!-- Error State -->
    <Alert v-else-if="error" variant="destructive">
      <AlertTriangle class="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        {{ error.data?.statusMessage || "Failed to load deleted users" }}
      </AlertDescription>
    </Alert>

    <!-- No Deleted Users -->
    <div
      v-else-if="deletedUsers.length === 0"
      class="text-center py-12 border border-dashed rounded-lg"
    >
      <UserX class="mx-auto h-12 w-12 text-muted-foreground/50" />
      <h3 class="mt-4 text-lg font-semibold">No deleted users</h3>
      <p class="text-muted-foreground mt-2">
        When users are deleted, they will appear here for recovery
      </p>
    </div>

    <!-- Deleted Users Table -->
    <div v-else>
      <Card>
        <CardContent class="p-0">
          <div class="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
                  <TableHead v-for="header in headerGroup.headers" :key="header.id">
                    <FlexRender 
                      v-if="!header.isPlaceholder"
                      :render="header.column.columnDef.header"
                      :props="header.getContext()"
                    />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <template v-if="table.getRowModel().rows?.length">
                  <TableRow 
                    v-for="row in table.getRowModel().rows" 
                    :key="row.id"
                    :data-state="row.getIsSelected() && 'selected'"
                  >
                    <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                      <FlexRender 
                        :render="cell.column.columnDef.cell"
                        :props="cell.getContext()"
                      />
                    </TableCell>
                  </TableRow>
                </template>
                <TableRow v-else>
                  <TableCell :colspan="columns.length" class="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          <!-- Pagination -->
          <div class="flex items-center justify-between px-6 py-4">
            <div class="text-sm text-muted-foreground">
              {{ table.getFilteredRowModel().rows.length }} deleted user(s)
            </div>
            <div class="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                @click="table.previousPage()"
                :disabled="!table.getCanPreviousPage()"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                @click="table.nextPage()"
                :disabled="!table.getCanNextPage()"
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Restore Confirmation Dialog -->
    <ConfirmDialog
      v-model:open="restoreDialog.open"
      title="Restore User"
      :description="`Are you sure you want to restore ${restoreDialog.userName}? They will be able to log in again.`"
      confirm-text="Restore User"
      :loading="restoreDialog.loading"
      loading-text="Restoring..."
      variant="default"
      icon-type="restore"
      :show-warning="false"
      @confirm="restoreUser"
    />
  </div>
</template>