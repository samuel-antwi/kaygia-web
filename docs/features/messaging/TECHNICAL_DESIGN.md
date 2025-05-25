# Real-Time Messaging System - Technical Design Document

## Document Information
- **Version**: 1.0.0
- **Last Updated**: January 2025
- **Status**: Draft
- **References**: REQUIREMENTS.md

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Client    │────▶│   Nuxt App   │────▶│  Supabase   │
│   Browser   │◀────│   + WS Server │◀────│  Database   │
└─────────────┘     └──────────────┘     └─────────────┘
                            │                      │
                            ▼                      ▼
                    ┌──────────────┐     ┌─────────────┐
                    │    Redis     │     │   Storage   │
                    │   (PubSub)   │     │   (Files)   │
                    └──────────────┘     └─────────────┘
```

### 1.2 Technology Stack

| Component | Technology | Justification |
|-----------|------------|---------------|
| WebSocket Server | Socket.io | Reliable, feature-rich, fallback support |
| Message Store | PostgreSQL (Supabase) | ACID compliance, existing integration |
| Cache/PubSub | Redis | Horizontal scaling, real-time performance |
| File Storage | Supabase Storage | Integrated CDN, access control |
| Search | PostgreSQL FTS | Built-in, no additional infrastructure |

## 2. Database Design

### 2.1 Entity Relationship Diagram

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   projects  │────▶│ conversations│────▶│  messages   │
└─────────────┘     └──────────────┘     └─────────────┘
                            │                     │
                            ▼                     ▼
                    ┌──────────────┐     ┌─────────────┐
                    │ participants │     │message_files│
                    └──────────────┘     └─────────────┘
                                                  │
                                         ┌─────────────┐
                                         │ read_status │
                                         └─────────────┘
```

### 2.2 Schema Definitions

```sql
-- Conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255),
    type VARCHAR(50) DEFAULT 'project', -- project, support, announcement
    status VARCHAR(50) DEFAULT 'active', -- active, archived, locked
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    
    CONSTRAINT fk_project FOREIGN KEY (project_id) REFERENCES projects(id),
    INDEX idx_project_id (project_id),
    INDEX idx_status (status)
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    content TEXT,
    type VARCHAR(50) DEFAULT 'text', -- text, file, system
    metadata JSONB, -- For reactions, edits, etc.
    edited_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id),
    CONSTRAINT fk_sender FOREIGN KEY (sender_id) REFERENCES users(id),
    INDEX idx_conversation_created (conversation_id, created_at DESC),
    INDEX idx_sender (sender_id)
);

-- Message files table
CREATE TABLE message_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    file_type VARCHAR(100),
    file_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_message FOREIGN KEY (message_id) REFERENCES messages(id),
    INDEX idx_message_id (message_id)
);

-- Conversation participants
CREATE TABLE conversation_participants (
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    role VARCHAR(50) DEFAULT 'member', -- owner, admin, member
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    notifications_enabled BOOLEAN DEFAULT true,
    last_read_at TIMESTAMP WITH TIME ZONE,
    
    PRIMARY KEY (conversation_id, user_id),
    CONSTRAINT fk_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Read receipts
CREATE TABLE message_read_receipts (
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    PRIMARY KEY (message_id, user_id),
    CONSTRAINT fk_message FOREIGN KEY (message_id) REFERENCES messages(id),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Message reports (for moderation)
CREATE TABLE message_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id),
    reported_by UUID NOT NULL REFERENCES users(id),
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, reviewed, resolved
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_message FOREIGN KEY (message_id) REFERENCES messages(id),
    CONSTRAINT fk_reporter FOREIGN KEY (reported_by) REFERENCES users(id),
    INDEX idx_status (status)
);
```

## 3. API Design

### 3.1 REST Endpoints

#### Client Endpoints

```typescript
// Get conversations for a project
GET /api/projects/:projectId/conversations
Response: { conversations: Conversation[] }

// Get messages for a conversation
GET /api/conversations/:conversationId/messages?limit=50&before=messageId
Response: { messages: Message[], hasMore: boolean }

// Send a message
POST /api/conversations/:conversationId/messages
Body: { content: string, type: 'text' | 'file', fileIds?: string[] }
Response: { message: Message }

// Upload file
POST /api/conversations/:conversationId/files
Body: FormData with file
Response: { fileId: string, fileUrl: string }

// Mark messages as read
POST /api/conversations/:conversationId/read
Body: { messageId: string }
Response: { success: boolean }

// Search messages
GET /api/conversations/:conversationId/search?q=query
Response: { messages: Message[] }
```

#### Admin Endpoints

```typescript
// Get all conversations (admin)
GET /api/admin/conversations?projectId=&userId=&status=
Response: { conversations: ConversationWithDetails[] }

// Get conversation analytics
GET /api/admin/conversations/analytics
Response: { 
  totalMessages: number,
  avgResponseTime: number,
  activeConversations: number,
  messagesByDay: ChartData
}

// Moderate message
DELETE /api/admin/messages/:messageId
Response: { success: boolean }

// Export conversation
GET /api/admin/conversations/:conversationId/export
Response: CSV/JSON file

// Manage participants
POST /api/admin/conversations/:conversationId/participants
Body: { userId: string, role: string }
Response: { success: boolean }
```

### 3.2 WebSocket Events

#### Client Events (Emit)
```typescript
// Join conversation room
socket.emit('join', { conversationId: string })

// Send message
socket.emit('message:send', { 
  conversationId: string, 
  content: string,
  type: 'text' | 'file',
  fileIds?: string[]
})

// Typing indicator
socket.emit('typing:start', { conversationId: string })
socket.emit('typing:stop', { conversationId: string })

// Mark as read
socket.emit('message:read', { messageId: string })
```

#### Server Events (Listen)
```typescript
// New message received
socket.on('message:new', (message: Message) => {})

// Message updated
socket.on('message:updated', (message: Message) => {})

// Message deleted
socket.on('message:deleted', ({ messageId: string }) => {})

// Typing indicators
socket.on('user:typing', ({ userId: string, isTyping: boolean }) => {})

// User presence
socket.on('user:online', ({ userId: string }) => {})
socket.on('user:offline', ({ userId: string }) => {})

// Read receipts
socket.on('message:read:update', ({ messageId: string, userId: string }) => {})
```

## 4. Component Architecture

### 4.1 Client Components

```
components/messaging/
├── ChatContainer.vue          # Main container
├── ConversationList.vue       # List of conversations
├── MessageList.vue            # Message display
├── MessageItem.vue            # Individual message
├── MessageInput.vue           # Input with file upload
├── TypingIndicator.vue        # Typing status
├── FilePreview.vue            # File attachments
├── SearchMessages.vue         # Search interface
└── OnlineStatus.vue           # User presence
```

### 4.2 Admin Components

```
layers/admin/components/messaging/
├── ConversationManager.vue    # Main admin interface
├── ConversationFilters.vue    # Search/filter
├── MessageModeration.vue      # Moderation tools
├── ConversationAnalytics.vue  # Analytics dashboard
├── ParticipantManager.vue     # Manage participants
└── ExportDialog.vue           # Export functionality
```

## 5. Security Considerations

### 5.1 Authentication & Authorization

```typescript
// Middleware for message access
async function canAccessConversation(userId: string, conversationId: string): boolean {
  // Check if user is participant or admin
  const participant = await db.query.conversation_participants.findFirst({
    where: and(
      eq(conversation_participants.user_id, userId),
      eq(conversation_participants.conversation_id, conversationId)
    )
  })
  
  return !!participant || isAdmin(userId)
}
```

### 5.2 Input Validation

```typescript
// Message validation schema
const messageSchema = z.object({
  content: z.string().min(1).max(5000),
  type: z.enum(['text', 'file']),
  fileIds: z.array(z.string().uuid()).optional()
})

// File validation
const fileSchema = z.object({
  size: z.number().max(10 * 1024 * 1024), // 10MB
  type: z.enum(['image/png', 'image/jpeg', 'application/pdf', ...])
})
```

### 5.3 Rate Limiting

```typescript
// Rate limit configuration
const rateLimits = {
  messages: { window: '1m', max: 30 },      // 30 messages per minute
  fileUploads: { window: '1h', max: 50 },   // 50 files per hour
  searches: { window: '1m', max: 10 }       // 10 searches per minute
}
```

## 6. Performance Optimization

### 6.1 Caching Strategy

```typescript
// Redis caching for active conversations
const CACHE_TTL = 3600 // 1 hour

// Cache recent messages
await redis.setex(
  `conv:${conversationId}:messages`,
  CACHE_TTL,
  JSON.stringify(recentMessages)
)

// Cache online users
await redis.sadd(`conv:${conversationId}:online`, userId)
await redis.expire(`conv:${conversationId}:online`, 300) // 5 minutes
```

### 6.2 Database Optimization

```sql
-- Indexes for performance
CREATE INDEX idx_messages_search ON messages USING gin(to_tsvector('english', content));
CREATE INDEX idx_messages_conversation_date ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_participants_user ON conversation_participants(user_id);

-- Materialized view for analytics
CREATE MATERIALIZED VIEW conversation_stats AS
SELECT 
  c.id as conversation_id,
  COUNT(DISTINCT m.id) as message_count,
  COUNT(DISTINCT m.sender_id) as participant_count,
  MAX(m.created_at) as last_message_at,
  AVG(EXTRACT(EPOCH FROM (m.created_at - lag(m.created_at) OVER (PARTITION BY c.id ORDER BY m.created_at)))) as avg_response_time
FROM conversations c
LEFT JOIN messages m ON c.id = m.conversation_id
GROUP BY c.id;

-- Refresh periodically
REFRESH MATERIALIZED VIEW CONCURRENTLY conversation_stats;
```

## 7. Testing Strategy

### 7.1 Unit Tests

```typescript
// Example test for message validation
describe('Message Validation', () => {
  it('should reject messages over 5000 characters', () => {
    const longMessage = 'a'.repeat(5001)
    expect(() => messageSchema.parse({ content: longMessage, type: 'text' }))
      .toThrow()
  })
  
  it('should validate file types', () => {
    const validFile = { size: 1024, type: 'image/png' }
    expect(() => fileSchema.parse(validFile)).not.toThrow()
  })
})
```

### 7.2 Integration Tests

```typescript
// WebSocket integration test
describe('WebSocket Messaging', () => {
  it('should deliver messages in real-time', async () => {
    const client1 = io.connect(server)
    const client2 = io.connect(server)
    
    await client1.emit('join', { conversationId: 'test-conv' })
    await client2.emit('join', { conversationId: 'test-conv' })
    
    const messagePromise = new Promise(resolve => {
      client2.on('message:new', resolve)
    })
    
    await client1.emit('message:send', {
      conversationId: 'test-conv',
      content: 'Test message',
      type: 'text'
    })
    
    const received = await messagePromise
    expect(received.content).toBe('Test message')
  })
})
```

### 7.3 Load Testing

```javascript
// k6 load test script
import ws from 'k6/ws'
import { check } from 'k6'

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
}

export default function () {
  const url = 'ws://localhost:3000/socket.io/'
  const params = { tags: { name: 'messaging' } }
  
  const res = ws.connect(url, params, function (socket) {
    socket.on('open', () => {
      socket.send(JSON.stringify({
        event: 'join',
        data: { conversationId: 'test-conv' }
      }))
    })
    
    socket.on('message', (data) => {
      const message = JSON.parse(data)
      check(message, {
        'message received': (msg) => msg.event === 'message:new',
        'message has content': (msg) => msg.data?.content !== undefined,
      })
    })
    
    socket.setTimeout(() => {
      socket.send(JSON.stringify({
        event: 'message:send',
        data: {
          conversationId: 'test-conv',
          content: `Test message ${Date.now()}`,
          type: 'text'
        }
      }))
    }, 1000)
  })
  
  check(res, { 'status is 101': (r) => r && r.status === 101 })
}
```

## 8. Deployment Architecture

### 8.1 Infrastructure

```yaml
# docker-compose.yml for local development
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - REDIS_URL=redis://redis:6379
      - DATABASE_URL=postgresql://...
    depends_on:
      - redis
      
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
      
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./certs:/etc/nginx/certs
    depends_on:
      - app

volumes:
  redis_data:
```

### 8.2 Scaling Strategy

1. **Horizontal Scaling**: Use Redis PubSub for multi-instance coordination
2. **Load Balancing**: Sticky sessions for WebSocket connections
3. **Database**: Read replicas for message queries
4. **CDN**: CloudFlare for static assets and file storage

## 9. Monitoring & Observability

### 9.1 Metrics to Track

- Message delivery latency (p50, p95, p99)
- WebSocket connection count
- Message throughput (messages/second)
- Error rates by type
- File upload success rate
- Search query performance

### 9.2 Logging Strategy

```typescript
// Structured logging
logger.info('message.sent', {
  conversationId,
  senderId,
  messageType,
  timestamp: Date.now(),
  duration: processingTime
})

// Error tracking
logger.error('message.delivery.failed', {
  error: error.message,
  stack: error.stack,
  conversationId,
  userId,
  retryCount
})
```

## 10. Migration Plan

### 10.1 Database Migrations

```bash
# Migration sequence
npm run db:migrate:create messaging_schema
npm run db:migrate:create messaging_indexes
npm run db:migrate:create messaging_views
npm run db:migrate:run
```

### 10.2 Feature Flags

```typescript
// Progressive rollout
const features = {
  messaging: {
    enabled: process.env.FEATURE_MESSAGING === 'true',
    rolloutPercentage: 20, // Start with 20% of users
    enabledUsers: ['admin@example.com'], // Specific users for testing
  }
}
```

## 11. Documentation Requirements

1. API Documentation (OpenAPI/Swagger)
2. WebSocket Event Documentation
3. Admin User Guide
4. Client User Guide
5. Troubleshooting Guide
6. Performance Tuning Guide

---

**Document History**
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | Jan 2025 | System | Initial design |