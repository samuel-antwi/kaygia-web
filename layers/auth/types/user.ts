import type { Role } from "../../admin/types/role";

export interface User {
  id: string;
  email: string;
  name?: string | null;
  company?: string | null;
  avatarUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
  role: Role;
  lastLoggedIn?: Date | null;
  emailVerified: boolean;
}

export interface UserWithProjects extends User {
  projects: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: Date;
  }>;
}

export interface RegisterUserData {
  email: string;
  password: string;
  name?: string;
  company?: string;
}

export interface LoginUserData {
  email: string;
  password: string;
}
