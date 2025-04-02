export type MessageSender = "ADMIN" | "CLIENT";

export interface ClientMessage {
  id: string;
  subject: string;
  content: string;
  userId: string;
  createdAt: string;
  isRead: boolean;
  sender: MessageSender;
}

export interface MessageResponse {
  success: boolean;
  messages?: ClientMessage[];
  message?: ClientMessage;
  error?: string;
  statusCode?: number;
}
