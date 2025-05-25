import type { Conversation as BaseConversation, ConversationParticipant } from '~/layers/dashboard/types/messaging'

export interface AdminConversation extends BaseConversation {
  participants?: ConversationParticipant[]
  assignedTo?: {
    id: string
    name: string
    email: string
    role: string
  }
  lastMessageAt?: Date | string | null
}