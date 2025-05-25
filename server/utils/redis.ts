import { createClient } from 'redis'

const config = useRuntimeConfig()

// Redis client for caching and pub/sub
export const redisClient = createClient({
  url: config.redisUrl || 'redis://localhost:6379',
  socket: {
    connectTimeout: 10000
  }
})

// Pub/Sub client (separate connection for pub/sub operations)
export const redisPubSub = createClient({
  url: config.redisUrl || 'redis://localhost:6379',
  socket: {
    connectTimeout: 10000
  }
})

// Initialize Redis connections
let isConnected = false

export async function initializeRedis() {
  if (isConnected) return

  try {
    await redisClient.connect()
    await redisPubSub.connect()
    
    redisClient.on('error', (err) => console.error('Redis Client Error:', err))
    redisPubSub.on('error', (err) => console.error('Redis PubSub Error:', err))
    
    console.log('Redis connections established')
    isConnected = true
  } catch (error) {
    console.error('Failed to connect to Redis:', error)
    // Continue without Redis for development
  }
}

// Graceful shutdown
export async function closeRedis() {
  if (!isConnected) return
  
  try {
    await redisClient.quit()
    await redisPubSub.quit()
    isConnected = false
    console.log('Redis connections closed')
  } catch (error) {
    console.error('Error closing Redis connections:', error)
  }
}

// Redis utility functions
export const redis = {
  // Cache operations
  async get(key: string) {
    try {
      return await redisClient.get(key)
    } catch (error) {
      console.error('Redis GET error:', error)
      return null
    }
  },

  async set(key: string, value: string, ttl?: number) {
    try {
      if (ttl) {
        return await redisClient.setEx(key, ttl, value)
      }
      return await redisClient.set(key, value)
    } catch (error) {
      console.error('Redis SET error:', error)
      return null
    }
  },

  async del(key: string) {
    try {
      return await redisClient.del(key)
    } catch (error) {
      console.error('Redis DEL error:', error)
      return 0
    }
  },

  // Pub/Sub operations
  async publish(channel: string, message: string) {
    try {
      return await redisPubSub.publish(channel, message)
    } catch (error) {
      console.error('Redis PUBLISH error:', error)
      return 0
    }
  },

  async subscribe(channel: string, callback: (message: string) => void) {
    try {
      await redisPubSub.subscribe(channel, callback)
    } catch (error) {
      console.error('Redis SUBSCRIBE error:', error)
    }
  },

  async unsubscribe(channel: string) {
    try {
      await redisPubSub.unsubscribe(channel)
    } catch (error) {
      console.error('Redis UNSUBSCRIBE error:', error)
    }
  },

  // User presence tracking
  async setUserOnline(userId: string, socketId: string) {
    try {
      await redisClient.hSet(`user:${userId}`, {
        socketId,
        lastSeen: Date.now().toString(),
        status: 'online'
      })
      await redisClient.expire(`user:${userId}`, 3600) // 1 hour TTL
    } catch (error) {
      console.error('Redis SET USER ONLINE error:', error)
    }
  },

  async setUserOffline(userId: string) {
    try {
      await redisClient.hSet(`user:${userId}`, {
        lastSeen: Date.now().toString(),
        status: 'offline'
      })
      await redisClient.expire(`user:${userId}`, 86400) // 24 hours TTL
    } catch (error) {
      console.error('Redis SET USER OFFLINE error:', error)
    }
  },

  async getUserStatus(userId: string) {
    try {
      return await redisClient.hGetAll(`user:${userId}`)
    } catch (error) {
      console.error('Redis GET USER STATUS error:', error)
      return null
    }
  },

  // Conversation participant tracking
  async addUserToConversation(conversationId: string, userId: string, socketId: string) {
    try {
      await redisClient.sAdd(`conversation:${conversationId}:users`, userId)
      await redisClient.hSet(`conversation:${conversationId}:sockets`, userId, socketId)
      await redisClient.expire(`conversation:${conversationId}:users`, 3600)
      await redisClient.expire(`conversation:${conversationId}:sockets`, 3600)
    } catch (error) {
      console.error('Redis ADD USER TO CONVERSATION error:', error)
    }
  },

  async removeUserFromConversation(conversationId: string, userId: string) {
    try {
      await redisClient.sRem(`conversation:${conversationId}:users`, userId)
      await redisClient.hDel(`conversation:${conversationId}:sockets`, userId)
    } catch (error) {
      console.error('Redis REMOVE USER FROM CONVERSATION error:', error)
    }
  },

  async getConversationUsers(conversationId: string) {
    try {
      return await redisClient.sMembers(`conversation:${conversationId}:users`)
    } catch (error) {
      console.error('Redis GET CONVERSATION USERS error:', error)
      return []
    }
  },

  async getConversationSockets(conversationId: string) {
    try {
      return await redisClient.hGetAll(`conversation:${conversationId}:sockets`)
    } catch (error) {
      console.error('Redis GET CONVERSATION SOCKETS error:', error)
      return {}
    }
  }
}