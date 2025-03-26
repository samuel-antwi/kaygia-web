declare module "#auth-utils" {
  interface User {
    id: string;
    email: string;
    name?: string | null;
    company?: string | null;
    role?: string;
    lastLoggedIn: Date | null;
  }

  interface UserSession {
    user: User;
  }

  interface SecureSessionData {
    // Add secure fields if needed
  }
}

export {};
