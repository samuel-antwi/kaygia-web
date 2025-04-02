export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  company?: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export interface MessageResponse {
  success: boolean;
  messages?: ContactMessage[];
  message?: ContactMessage;
  error?: string;
  statusCode?: number;
}
