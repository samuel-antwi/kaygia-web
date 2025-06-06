export enum Role {
  CLIENT = "CLIENT",
}

export interface User {
  id: string;
  email: string;
  name?: string | null;
  company?: string | null;
  createdAt: Date;
  updatedAt: Date;
  role: Role;
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
