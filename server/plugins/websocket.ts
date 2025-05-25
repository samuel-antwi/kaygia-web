import { initializeRedis, closeRedis } from '../utils/redis'
import { initializeWebSocket } from '../utils/websocket'

export default async function () {
  // Initialize Redis connections
  await initializeRedis()

  // Note: WebSocket initialization will be handled in the main server setup
  // because we need access to the HTTP server instance
  
  console.log('Messaging infrastructure initialized')

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('Shutting down messaging infrastructure...')
    await closeRedis()
  })

  process.on('SIGINT', async () => {
    console.log('Shutting down messaging infrastructure...')
    await closeRedis()
  })
}