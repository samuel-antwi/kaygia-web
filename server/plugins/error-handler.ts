export default defineNitroPlugin((nitroApp) => {
  // Handle server errors
  nitroApp.hooks.hook('error', async (error: Error) => {
    // Log the error
    console.error(`Server error:`, error)
    
    // Don't log certain expected errors
    const ignoredStatusCodes = [404, 401, 403]
    const statusCode = (error as any)?.statusCode
    if (statusCode && ignoredStatusCodes.includes(statusCode)) {
      return
    }
    
    // In production, you might want to send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to Sentry or similar service
      // await sendToErrorTracking(error, event)
    }
  })
})