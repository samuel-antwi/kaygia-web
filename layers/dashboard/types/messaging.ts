export interface Conversation {
  id: string
  projectId: string
  title: string | null
  type: 'project' | 'support' | 'general'
  status: 'active' | 'archived' | 'closed'
  createdAt: Date
  updatedAt: Date
  createdBy: string | null
  project?: {
    id: string
    name: string
    clientId: string
  }
  lastMessage?: Message | null
  unreadCount?: number
  participantCount?: number
  messageCount?: number
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string | null
  type: 'text' | 'file' | 'system'
  metadata: Record<string, any>
  editedAt: Date | null
  deletedAt: Date | null
  createdAt: Date
  sender?: {
    id: string
    name: string
    email: string
    role: string
  }
  files?: MessageFile[]
  readBy?: MessageReadReceipt[]
  isOwn?: boolean
}

export interface MessageFile {
  id: string
  messageId: string
  fileName: string
  fileSize: number
  fileType: string | null
  fileUrl: string
  storagePath: string
  createdAt: Date
}

export interface MessageReadReceipt {
  messageId: string
  userId: string
  readAt: Date
}

export interface ConversationParticipant {
  conversationId: string
  userId: string
  role: 'owner' | 'admin' | 'member'
  joinedAt: Date
  leftAt: Date | null
  notificationsEnabled: boolean
  lastReadAt: Date | null
  user?: {
    id: string
    name: string
    email: string
    role: string
    active: boolean
  }
}

export interface SendMessagePayload {
  content: string
  type?: 'text' | 'file' | 'system'
  metadata?: Record<string, any>
  fileIds?: string[]
}

export interface CreateConversationPayload {
  projectId: string
  title?: string
  type?: 'project' | 'support' | 'general'
  participantIds?: string[]
}