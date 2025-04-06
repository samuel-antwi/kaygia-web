export enum Role {
  CLIENT = "CLIENT",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}

// Helper function to check if a value is a valid Role
export function isValidRole(value: any): value is Role {
  return Object.values(Role).includes(value as Role);
}
