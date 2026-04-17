/**
 * ===============================================
 * Chat Sessions Management Hook
 * ===============================================
 * 
 * Purpose: Manage CRUD operations for chat sessions
 * 
 * Features:
 * - Fetch all chat sessions
 * - Create new session
 * - Update session title
 * - Delete session and related data
 * - Manage loading states and errors
 * 
 * Hook Pattern: Custom React Hook
 * - Use useState for state management
 * - Use useEffect for data fetching
 * - Returns an object containing state and functions
 * 
 * API Integration:
 * - Connect to session API endpoints
 * - Supports GET, POST, PUT, DELETE methods
 * - Handle authentication using userId
 */

"use client"

import { useState, useEffect } from 'react'
import { API_BASE_SESSION, buildApiUrl } from '@/constants/api'

// ===============================================
// TypeScript Interface Definitions
// ===============================================

/**
 * Interface for Chat Session object
 * 
 * Properties:
 * - id: Unique ID of the session
 * - title: Title of the session
 * - created_at: Time the session was created
 * - message_count: Number of messages in the session
 */
export interface ChatSession {
  id: string                                                                // Unique session ID
  title: string                                                             // Session title
  created_at: string                                                        // Creation time (ISO string)
  message_count: number                                                     // Number of messages in the session
}

// ===============================================
// Main Custom Hook: useChatSessions
// ===============================================

/**
 * useChatSessions Hook: Manages CRUD operations for chat sessions
 * 
 * Purpose:
 * - Manage user's chat sessions list
 * - Provide functions for create, read, update, and delete sessions
 * - Handle loading states and error handling
 * - Update local state on changes
 * 
 * Parameters:
 * - userId: User ID for filtering (optional)
 * 
 * @param userId - User ID for authentication and filtering
 * @returns Object containing state and functions for managing sessions
 */
export function useChatSessions(userId?: string) {
  // ===============================================
  // Step 1: State Management
  // ===============================================
  
  /**
   * State to store chat sessions list
   * 
   * Usage:
   * - Store all user sessions
   * - Display in sidebar or session list
   * - Update when changes occur
   */
  const [sessions, setSessions] = useState<ChatSession[]>([])              // Chat sessions list
  
  /**
   * State for data loading status
   * 
   * Usage:
   * - true: Loading data (show loading indicator)
   * - false: Loading complete or not started
   */
  const [loading, setLoading] = useState(false)                            // Loading status
  
  /**
   * State for error handling
   * 
   * Usage:
   * - null: No errors
   * - string: Error message that occurred
   */
  const [error, setError] = useState<string | null>(null)                  // Error state

  // ===============================================
  // Step 2: Fetch Sessions Function
  // ===============================================
  
  /**
   * Function to fetch chat sessions list from server
   * 
   * Purpose:
   * - Fetch all user sessions
   * - Update sessions state with retrieved data
   * - Manage loading state and errors
   * 
   * Process Flow:
   * 1. Validate userId
   * 2. Set loading state
   * 3. Send GET request to API
   * 4. Process response data
   * 5. Update state with retrieved data
   * 6. Handle errors if any
   */
  const fetchSessions = async () => {
    // ===============================================
    // Step 2.1: User ID Validation
    // ===============================================
    
    /**
     * Check if userId exists
     * 
     * Validation:
     * - userId is a required parameter
     * - If no userId, exit the function
     */
    if (!userId) return                                                     // Exit if no userId
    
    // ===============================================
    // Step 2.2: Set Loading State
    // ===============================================
    
    /**
     * Set loading state and reset error
     * 
     * Purpose:
     * - Show loading indicator in UI
     * - Clear previous error
     * - Prevent redundant calls
     */
    setLoading(true)                                                        // Start loading
    setError(null)                                                          // Reset error
    
    try {
      // ===============================================
      // Step 2.3: API Request
      // ===============================================
      
      /**
       * Send GET request to session API
       * 
       * API Endpoint: SESSION API
       * Query Parameter: userId (encoded for security)
       * 
       * Expected Response:
       * - sessions: array of ChatSession objects
       */
      const apiUrl = buildApiUrl(API_BASE_SESSION, { userId })
      const response = await fetch(apiUrl)
      
      /**
       * Validate HTTP response status
       * 
       * Error Handling:
       * - If response is not ok, throw error
       */
      if (!response.ok) {
        throw new Error('Failed to fetch sessions')                        // Error fetching data
      }
      
      // ===============================================
      // Step 2.4: Process Response Data
      // ===============================================
      
      /**
       * Parse response as JSON and extract sessions
       * 
       * Data Structure:
       * - data.sessions: array of sessions
       * - If no sessions, use empty array
       */
      const data = await response.json()                                    // Parse response as JSON
      setSessions(data.sessions || [])                                      // Update sessions state
    } catch (err) {
      // ===============================================
      // Step 2.5: Error Handling
      // ===============================================
      
      /**
       * Handle errors occurring during data fetching
       * 
       * Error Recovery:
       * - Set error message to display to user
       * - Allow user to retry fetching
       */
      setError(err instanceof Error ? err.message : 'Unknown error')       // Set error message
    } finally {
      // ===============================================
      // Step 2.6: Cleanup - Clear loading state
      // ===============================================
      
      /**
       * Clear loading state on completion
       * 
       * Purpose:
       * - Hide loading indicator
       * - Runs regardless of success or error
       */
      setLoading(false)                                                     // Stop loading
    }
  }

  // ===============================================
  // Step 3: Create Session Function
  // ===============================================
  
  /**
   * Function to create a new chat session
   * 
   * Purpose:
   * - Create new session for user
   * - Update local sessions list
   * - Return the newly created session object
   * 
   * Process Flow:
   * 1. Validate userId
   * 2. Send POST request to API
   * 3. Process response data
   * 4. Update sessions state
   * 5. Return new session
   * 
   * @param title - Session title (optional)
   * @returns ChatSession object or null if error occurs
   */
  const createSession = async (title?: string) => {
    // ===============================================
    // Step 3.1: User ID Validation
    // ===============================================
    
    /**
     * Check if userId exists
     * 
     * Validation:
     * - userId is a required parameter for creating a session
     * - If no userId, return null
     */
    if (!userId) return null                                                // Return null if no userId
    
    // ===============================================
    // Step 3.2: Reset Error State
    // ===============================================
    
    /**
     * Clear error state before starting session creation
     * 
     * Purpose:
     * - Clear previous error
     * - Prepare for new operation
     */
    setError(null)                                                          // Reset error
    
    try {
      // ===============================================
      // Step 3.3: API Request
      // ===============================================
      
      /**
       * Send POST request to session API
       * 
       * API Endpoint: SESSION API
       * Method: POST
       * Body: { title, userId }
       * 
       * Expected Response:
       * - session: Newly created ChatSession object
       */
      const response = await fetch(API_BASE_SESSION, {
        method: 'POST',                                                     // HTTP POST method
        headers: {
          'Content-Type': 'application/json',                              // Set content type
        },
        body: JSON.stringify({ title, userId }),                           // Session creation data
      })
      
      /**
       * Validate HTTP response status
       * 
       * Error Handling:
       * - If response is not ok, throw error
       */
      if (!response.ok) {
        throw new Error('Failed to create session')                        // Error creating session
      }
      
      // ===============================================
      // Step 3.4: Process Response Data
      // ===============================================
      
      /**
       * Parse response as JSON and extract new session
       * 
       * Data Structure:
       * - data.session: Newly created ChatSession object
       */
      const data = await response.json()                                    // Parse response as JSON
      const newSession = data.session                                       // Extract session object
      
      // ===============================================
      // Step 3.5: Update Local State
      // ===============================================
      
      /**
       * Add new session to the top of the list
       * 
       * Strategy:
       * - Insert new session at top (sorted by created_at desc)
       * - Use spread operator to maintain immutability
       */
      setSessions(prev => [newSession, ...prev])                           // Add new session to top
      
      // ===============================================
      // Step 3.6: Return New Session
      // ===============================================
      
      /**
       * Return the newly created session object
       * 
       * Return Value:
       * - ChatSession object for further use
       * - e.g., redirect to the new session
       */
      return newSession                                                     // Return new session
    } catch (err) {
      // ===============================================
      // Step 3.7: Error Handling
      // ===============================================
      
      /**
       * Handle errors occurring during session creation
       * 
       * Error Recovery:
       * - Set error message
       * - Return null to indicate failure
       */
      setError(err instanceof Error ? err.message : 'Unknown error')       // Set error message
      return null                                                           // Return null if error
    }
  }

  // ===============================================
  // Step 4: Update Session Title Function
  // ===============================================
  
  /**
   * Function to update session title
   * 
   * Purpose:
   * - Edit existing session title
   * - Update local sessions list
   * - Return the updated session object
   * 
   * Process Flow:
   * 1. Send PUT request to API
   * 2. Process response data
   * 3. Update sessions state
   * 4. Return updated session
   * 
   * @param sessionId - ID of the session to update
   * @param title - New session title
   * @returns ChatSession object or null if error occurs
   */
  const updateSessionTitle = async (sessionId: string, title: string) => {
    // ===============================================
    // Step 4.1: Reset Error State
    // ===============================================
    
    /**
     * Clear error state before starting update
     * 
     * Purpose:
     * - Clear previous error
     * - Prepare for new operation
     */
    setError(null)                                                          // Reset error
    
    try {
      // ===============================================
      // Step 4.2: API Request
      // ===============================================
      
      /**
       * Send PUT request to session API
       * 
       * API Endpoint: SESSION API
       * Method: PUT
       * Body: { sessionId, title }
       * 
       * Expected Response:
       * - session: Updated ChatSession object
       */
      const response = await fetch(API_BASE_SESSION, {
        method: 'PUT',                                                      // HTTP PUT method
        headers: {
          'Content-Type': 'application/json',                              // Set content type
        },
        body: JSON.stringify({ sessionId, title }),                        // Update data
      })
      
      /**
       * Validate HTTP response status
       * 
       * Error Handling:
       * - If response is not ok, throw error
       */
      if (!response.ok) {
        throw new Error('Failed to update session')                        // Error updating session
      }
      
      // ===============================================
      // Step 4.3: Process Response Data
      // ===============================================
      
      /**
       * Parse response as JSON and extract updated session
       * 
       * Data Structure:
       * - data.session: Updated ChatSession object
       */
      const data = await response.json()                                    // Parse response as JSON
      const updatedSession = data.session                                   // Extract updated session object
      
      // ===============================================
      // Step 4.4: Update Local State
      // ===============================================
      
      /**
       * Update session in local state list
       * 
       * Strategy:
       * - Use map to find session to update
       * - Update only the title of that session
       * - Keep other sessions unchanged
       */
      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { ...session, title: updatedSession.title }                    // Update title for this session
          : session                                                         // Keep other sessions unchanged
      ))
      
      // ===============================================
      // Step 4.5: Return Updated Session
      // ===============================================
      
      /**
       * Return the updated session object
       * 
       * Return Value:
       * - ChatSession object for further use
       * - e.g., show update confirmation message
       */
      return updatedSession                                                 // Return updated session
    } catch (err) {
      // ===============================================
      // Step 4.6: Error Handling
      // ===============================================
      
      /**
       * Handle errors occurring during session update
       * 
       * Error Recovery:
       * - Set error message
       * - Return null to indicate failure
       */
      setError(err instanceof Error ? err.message : 'Unknown error')       // Set error message
      return null                                                           // Return null if error
    }
  }

  // Delete session
  const deleteSession = async (sessionId: string) => {
    setError(null)
    
    try {
      const apiUrl = buildApiUrl(API_BASE_SESSION, { sessionId })
      const response = await fetch(apiUrl, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete session')
      }
      
      // Remove session from list
      setSessions(prev => prev.filter(session => session.id !== sessionId))
      
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return false
    }
  }

  // Fetch data when userId exists
  useEffect(() => {
    if (userId) {
      fetchSessions()
    }

    // Listen to event for updating sidebar when new session is created
    const handleChatSessionCreated = () => {
      if (userId) fetchSessions()
    }
    window.addEventListener('chat-session-created', handleChatSessionCreated)

    return () => {
      window.removeEventListener('chat-session-created', handleChatSessionCreated)
    }
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    sessions,
    loading,
    error,
    fetchSessions,
    createSession,
    updateSessionTitle,
    deleteSession,
  }
}