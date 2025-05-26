import type { User } from "#layers/auth/types/user";
import { Role } from "#layers/admin/types/role";
import { hasAdminAccess } from "#layers/admin/utils/adminAccess";

export const useUserState = () => {
  const user = useState<User | null>("user", () => null);

  const isAdmin = computed(() => hasAdminAccess(user.value?.role));
  const isClient = computed(() => user.value?.role === Role.CLIENT);

  return {
    user,
    isAdmin,
    isClient,
  };
};
