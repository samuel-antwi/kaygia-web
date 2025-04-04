import type { User } from "~/layers/auth/types/user";
import { Role } from "~/layers/admin/types/role";

export const useUserState = () => {
  const user = useState<User | null>("user", () => null);

  const isAdmin = computed(() => user.value?.role === Role.ADMIN);
  const isClient = computed(() => user.value?.role === Role.CLIENT);

  return {
    user,
    isAdmin,
    isClient,
  };
};
