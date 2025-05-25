export const formatDateTime = (date: Date | string | null | undefined | any): string => {
  if (!date) return 'Never'
  
  try {
    let d: Date
    
    // Handle various date input formats
    if (date instanceof Date) {
      d = date
    } else if (typeof date === 'string') {
      d = new Date(date)
    } else if (typeof date === 'object' && date !== null) {
      // Try to convert object to string first, then parse
      const dateStr = String(date)
      d = new Date(dateStr)
    } else {
      return 'Unknown'
    }
    
    // Check if date is valid
    if (!d || isNaN(d.getTime())) {
      return 'Invalid Date'
    }
    
    // Format: Jan 25, 2025 at 3:45 PM
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(d)
  } catch (error) {
    console.error('Date formatting error:', error)
    return 'Invalid Date'
  }
}

export const formatRelativeTime = (date: Date | string | null | undefined | any): string => {
  if (!date) return 'Never'
  
  try {
    let d: Date
    
    // Handle various date input formats
    if (date instanceof Date) {
      d = date
    } else if (typeof date === 'string') {
      d = new Date(date)
    } else if (typeof date === 'object' && date !== null) {
      // Try to convert object to string first, then parse
      const dateStr = String(date)
      d = new Date(dateStr)
    } else {
      return 'Unknown'
    }
    
    // Check if date is valid
    if (!d || isNaN(d.getTime())) {
      return 'Invalid Date'
    }
    
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (seconds < 60) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    
    // For older dates, show the actual date
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  } catch (error) {
    console.error('Date formatting error:', error)
    return 'Invalid Date'
  }
}