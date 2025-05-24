# DeleteConfirmDialog Usage Examples

## Basic Usage

```vue
<script setup>
import DeleteConfirmDialog from "~/layers/core/components/DeleteConfirmDialog.vue";

const showDeleteDialog = ref(false);
const isDeleting = ref(false);

async function handleDelete() {
  isDeleting.value = true;
  try {
    // Your delete logic here
    await deleteItem();
    showDeleteDialog.value = false;
  } finally {
    isDeleting.value = false;
  }
}
</script>

<template>
  <Button @click="showDeleteDialog = true" variant="destructive">
    Delete Item
  </Button>

  <DeleteConfirmDialog
    v-model:open="showDeleteDialog"
    @confirm="handleDelete"
    :loading="isDeleting"
  />
</template>
```

## With Custom Text

```vue
<DeleteConfirmDialog
  v-model:open="showDeleteDialog"
  title="Delete Project"
  description="This will permanently delete the project and all associated data."
  confirm-text="Delete Project"
  warning-text="All project files, deliverables, and history will be lost."
  :loading="isDeleting"
  @confirm="handleDelete"
/>
```

## With Item Name

```vue
<DeleteConfirmDialog
  v-model:open="showDeleteDialog"
  title="Delete User"
  :item-name="user.name || user.email"
  confirm-text="Delete User"
  :loading="isDeleting"
  @confirm="handleDelete"
/>
```

## Without Warning Alert

```vue
<DeleteConfirmDialog
  v-model:open="showDeleteDialog"
  title="Remove Avatar"
  description="Remove your profile picture?"
  confirm-text="Remove"
  :show-warning="false"
  :loading="isDeleting"
  @confirm="handleDelete"
/>
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | required | Controls dialog visibility (use v-model:open) |
| `title` | `string` | "Confirm Deletion" | Dialog title |
| `description` | `string` | "Are you sure..." | Dialog description |
| `itemName` | `string` | - | If provided, auto-generates description |
| `loading` | `boolean` | false | Shows loading state |
| `confirmText` | `string` | "Delete" | Confirm button text |
| `cancelText` | `string` | "Cancel" | Cancel button text |
| `variant` | `'default' \| 'danger'` | "danger" | Button variant |
| `showWarning` | `boolean` | true | Show warning alert |
| `warningText` | `string` | "This action cannot be undone." | Warning message |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:open` | `boolean` | Emitted when dialog should close |
| `confirm` | - | Emitted when confirm button clicked |
| `cancel` | - | Emitted when cancel button clicked |