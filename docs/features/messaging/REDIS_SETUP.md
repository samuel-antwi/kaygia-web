# Redis Setup for Messaging System

## Development Setup

### Option 1: Local Redis Installation (macOS)

```bash
# Install Redis using Homebrew
brew install redis

# Start Redis server
brew services start redis

# Or run manually
redis-server

# Test connection
redis-cli ping
# Should return: PONG
```

### Option 2: Docker Redis

```bash
# Run Redis in Docker
docker run -d \
  --name redis-messaging \
  -p 6379:6379 \
  redis:7-alpine

# Or using Docker Compose
# Create docker-compose.yml:
```

```yaml
version: '3.8'
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

volumes:
  redis_data:
```

```bash
# Start with Docker Compose
docker-compose up -d redis
```

### Option 3: Redis Cloud (Production)

1. Sign up for [Redis Cloud](https://redis.com/redis-enterprise-cloud/) or [Upstash](https://upstash.com/)
2. Create a new database
3. Get the connection URL
4. Add to environment variables

## Environment Configuration

Add to your `.env` file:

```bash
# Local Redis
REDIS_URL=redis://localhost:6379

# Redis Cloud example
REDIS_URL=redis://username:password@host:port

# Upstash example
REDIS_URL=rediss://username:password@host:port
```

## Testing Redis Connection

Create a test script to verify Redis is working:

```bash
# Create test file
echo 'import { redis } from "./server/utils/redis"

async function testRedis() {
  await redis.set("test", "Hello Redis!")
  const value = await redis.get("test")
  console.log("Redis test:", value)
  await redis.del("test")
}

testRedis().catch(console.error)' > test-redis.mjs

# Run test
node test-redis.mjs
```

## Redis Features Used

### 1. User Presence Tracking
- **Keys**: `user:{userId}` (hash)
- **Fields**: `socketId`, `lastSeen`, `status`
- **TTL**: 1 hour for online, 24 hours for offline

### 2. Conversation Participants
- **Keys**: `conversation:{conversationId}:users` (set)
- **Keys**: `conversation:{conversationId}:sockets` (hash)
- **TTL**: 1 hour

### 3. Pub/Sub for Real-time Events
- **Channels**: `conversation:{conversationId}`, `user:{userId}`
- **Messages**: JSON-encoded events

### 4. Caching (Future)
- Message caching for quick access
- User session data
- Conversation metadata

## Monitoring Redis

### Redis CLI Commands

```bash
# Monitor all commands
redis-cli monitor

# Check memory usage
redis-cli info memory

# List all keys
redis-cli keys "*"

# Check specific key
redis-cli get "user:123"
redis-cli hgetall "user:123"

# Check pub/sub
redis-cli psubscribe "*"
```

### Redis Insights (GUI)

Download [Redis Insights](https://redis.com/redis-enterprise/redis-insight/) for a visual interface to monitor Redis.

## Production Considerations

### 1. Security
- Enable AUTH: `requirepass your-password`
- Use TLS: `rediss://` protocol
- Restrict network access
- Regular security updates

### 2. Performance
- Configure maxmemory policy
- Monitor memory usage
- Use connection pooling
- Set appropriate TTLs

### 3. High Availability
- Redis Sentinel for failover
- Redis Cluster for scaling
- Regular backups
- Multi-region setup

### 4. Configuration Example

```bash
# redis.conf for production
maxmemory 256mb
maxmemory-policy allkeys-lru
timeout 300
tcp-keepalive 60
save 900 1
save 300 10
save 60 10000
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check if Redis is running: `redis-cli ping`
   - Verify port (default 6379)
   - Check firewall settings

2. **Authentication Errors**
   - Verify REDIS_URL format
   - Check username/password
   - Ensure TLS configuration

3. **Memory Issues**
   - Monitor with `redis-cli info memory`
   - Adjust maxmemory settings
   - Clear unused keys

4. **Performance Issues**
   - Check slow queries: `redis-cli slowlog get`
   - Monitor connections: `redis-cli info clients`
   - Review memory usage patterns

## Development vs Production

| Feature | Development | Production |
|---------|-------------|------------|
| Setup | Local/Docker | Redis Cloud |
| Security | Basic | AUTH + TLS |
| Persistence | Optional | Required |
| Monitoring | CLI | Redis Insights + Alerts |
| Backup | Manual | Automated |
| HA | Single instance | Sentinel/Cluster |

## Next Steps

1. Start Redis server
2. Run application: `npm run dev`
3. Test WebSocket connection in browser
4. Monitor Redis activity with `redis-cli monitor`
5. Check application logs for connection status