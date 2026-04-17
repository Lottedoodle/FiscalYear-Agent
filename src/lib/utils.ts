import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// CSS CLASS UTILITIES - Utils for CSS Classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ID GENERATION UTILITIES - Utils for ID generation
export function generateUniqueId(prefix: string = ''): string {
  const timestamp = Date.now()                                              // Current time in milliseconds
  
  const random = Math.random().toString(36).substr(2, 9)                    // Random 9-character string (base36)
  
  // Combine prefix, timestamp, and random string
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`
}

// DATE GROUPING INTERFACES - Interfaces for date-based grouping
export interface GroupedSessions {
  period: string                                                            // Time period name, e.g., "Today", "Yesterday"
  sessions: ChatSession[]                                                   // Array of sessions in that time period
}

interface ChatSession {
  id: string;                                                               // Session unique identifier
  title: string;                                                            // Chat session title
  created_at: string;                                                       // Creation date (ISO string format)
  message_count?: number;                                                   // Number of messages in the session (optional)
  user_id?: string;                                                         // Owner user ID (optional)
}

// DATE GROUPING FUNCTION - Function for grouping sessions by date
export function groupSessionsByDate(sessions: ChatSession[]): GroupedSessions[] {
  
  const now = new Date()                                                      // Current date and time
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())    // Today (00:00:00)
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)           // Yesterday (00:00:00)
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)    // 7 days ago
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)  // 30 days ago

  const groups: { [key: string]: ChatSession[] } = {
    today: [],                                                              // sessions for today
    yesterday: [],                                                          // sessions for yesterday
    last7days: [],                                                          // sessions from the last 7 days
    lastMonth: [],                                                          // sessions from the last 30 days
    older: []                                                               // sessions older than 30 days
  }

  sessions.forEach(session => {
    // Convert created_at string to Date object
    const sessionDate = new Date(session.created_at)                       // Session creation date
    const sessionDateOnly = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate()) // Date only (excluding time)

    // Compare and assign to the appropriate group
    if (sessionDateOnly.getTime() === today.getTime()) {
      groups.today.push(session)                                            // Today
    } else if (sessionDateOnly.getTime() === yesterday.getTime()) {
      groups.yesterday.push(session)                                        // Yesterday
    } else if (sessionDate >= sevenDaysAgo) {
      groups.last7days.push(session)                                        // Last 7 days
    } else if (sessionDate >= thirtyDaysAgo) {
      groups.lastMonth.push(session)                                        // Last month
    } else {
      groups.older.push(session)                                            // Older than 30 days
    }
  })

  const result: GroupedSessions[] = []

  // Check and add "Today" group
  if (groups.today.length > 0) {
    result.push({ period: 'Today', sessions: groups.today })
  }
  
  // Check and add "Yesterday" group  
  if (groups.yesterday.length > 0) {
    result.push({ period: 'Yesterday', sessions: groups.yesterday })
  }

  // Check and add "Last 7 days" group
  if (groups.last7days.length > 0) {
    result.push({ period: 'Last 7 days', sessions: groups.last7days })
  }

  // Check and add "Last month" group
  if (groups.lastMonth.length > 0) {
    result.push({ period: 'Last month', sessions: groups.lastMonth })
  }
  
  // Check and add "Older" group
  if (groups.older.length > 0) {
    result.push({ period: 'Older', sessions: groups.older })
  }

  // Return the sorted result
  return result
}