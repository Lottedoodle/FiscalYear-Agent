/**
 * ===============================================
 * Chat History Page Component
 * ===============================================
 * 
 * Purpose: Page to display conversation history for a specific session
 * 
 * Features:
 * - Display the conversation history of the specified session
 * - Check user authentication
 * - Validate the session
 * - Support creating a new session
 * - Redirect to login page if not logged in
 * 
 * Route: /chat/[id]
 * - id: session ID or 'new' to create a new session
 * 
 * Database Operations:
 * - Fetch session data from chat_sessions table
 * - Verify session access permissions (user ownership)
 * 
 * Authentication: Use Supabase Authentication
 * Authorization: Verify that user owns the session
 */

import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { ChatHistory } from "@/components/chat-history"
import { getDatabase } from '@/lib/database'

// ===============================================
// Use centralized database utility
// ===============================================
const pool = getDatabase()

// ===============================================
// TypeScript Interface Definitions
// ===============================================

/**
 * Interface for ChatPage component props
 * 
 * Structure:
 * - params: Promise object with dynamic route parameters
 *   - id: string - session ID from URL path
 */
interface ChatPageProps {
  params: Promise<{
    id: string                                                              // session ID from dynamic route [id]
  }>
}

// ===============================================
// Main Page Component: History Chat Page
// ===============================================

/**
 * HistoryChatPage Component: Conversation history page
 * 
 * Purpose:
 * - Display the conversation history of the specified session
 * - Check authentication and authorization
 * - Handle cases where the session does not exist
 * - Pass data to ChatHistory component
 * 
 * Process Flow:
 * 1. Check authentication via Supabase
 * 2. Fetch session data from database
 * 3. Verify session access permissions
 * 4. Render ChatHistory component with data
 * 
 * @param params - Object containing session ID from dynamic route
 * @returns JSX Element or redirect
 */
export default async function HistoryChatPage({ params }: ChatPageProps) {
    
  // ===============================================
  // Step 1: Authentication Check
  // ===============================================
  
  /**
   * Create Supabase client and check authentication
   * 
   * Process:
   * 1. Create server-side Supabase client
   * 2. Extract session ID from route parameters
   * 3. Check if user is logged in
   * 4. Redirect to login page if not logged in
   */
  const supabase = await createClient()                                     // Create Supabase client
  const { id } = await params                                               // Extract session ID from route parameters

  /**
   * Check user authentication status
   * 
   * Returns:
   * - user: user object if logged in
   * - error: error object if there is an issue
   */
  const {
    data: { user },                                                         // Logged-in user data
    error,                                                                  // Error object (if any)
  } = await supabase.auth.getUser()

  /**
   * If not logged in or an error occurs, redirect to login page
   * 
   * Conditions for redirect:
   * - error has a value (issue checking auth)
   * - user is null/undefined (not logged in)
   */
  if (error || !user) {
    redirect("/auth/login")                                                 // Redirect to login page
  }

  // ===============================================
  // Step 2: Initialize Session Variables
  // ===============================================
  
  /**
   * Variables to store session data
   * 
   * Variables:
   * - chatTitle: Name of the chat session
   * - sessionExists: Existence status of the session
   */
  let chatTitle = "Chat Conversation"                                       // Default chat title
  let sessionExists = false                                                 // Session existence status
  
  // ===============================================
  // Step 3: Database Query for Session
  // ===============================================
  
  try {
    /**
     * Connect to database and fetch session data
     * 
     * Query Purpose:
     * - Verify that the session actually exists
     * - Verify that the user owns the session
     * - Fetch the title of the session
     */
    const client = await pool.connect()                                     // Connect to database
    try {
      /**
       * Query chat session data
       * 
       * SQL Query Details:
       * - SELECT: Fetch basic session data
       * - WHERE: Filter by session ID and user ID
       * - Ensure the user has permission to access this session
       */
      const result = await client.query(`
        SELECT 
          id,                                                               
          title,                                                            
          created_at,                                                       
          user_id                                                           
        FROM chat_sessions 
        WHERE id = $1 AND user_id = $2
      `, [id, user.id])                                                     // parameters: [sessionId, userId]

      /**
       * Check query results
       * 
       * Process:
       * 1. Update variables if session is found
       * 2. Set chatTitle from the database
       * 3. Change sessionExists to true
       */
      if (result.rows.length > 0) {
        chatTitle = result.rows[0].title || "Chat Conversation"            // Use title from DB or default
        sessionExists = true                                                // Confirm session exists
      }
    } finally {
      // ===============================================
      // Step 4: Database Cleanup
      // ===============================================
      
      /**
       * Close database connection
       * Use finally block to ensure the connection is always closed
       */
      client.release()                                                      // Return connection to the pool
    }
  } catch (error) {
    // ===============================================
    // Database Error Handling
    // ===============================================
    
    /**
     * Handle errors that occur during data fetching
     * 
     * Error Recovery:
     * 1. Log error to console
     * 2. Use default values
     * 3. Continue execution without crashing
     */
    console.error('Error fetching chat session:', error)                   // Log error to console
    // Use default title on error (chatTitle and sessionExists remain at initial values)
  }

  // ===============================================
  // Step 5: Session Validation
  // ===============================================
  
  /**
   * Check if session exists
   * 
   * Validation Logic:
   * - If session does not exist and id is not 'new'
   * - Redirect to the main chat page
   * - Prevent access to non-existent sessions
   * 
   * Special Case:
   * - id = 'new' is used to create a new session
   */
  if (!sessionExists && id !== 'new') {
    redirect('/chat')                                                       // Redirect to main chat page
  }

  // ===============================================
  // Step 6: Render Component
  // ===============================================
  
  /**
   * Return ChatHistory component with required data
   * 
   * Props:
   * - sessionId: session ID (or 'new' for a new session)
   * - title: Name of the chat session
   * - userId: ID of the logged-in user
   * 
   * Component Responsibility:
   * - ChatHistory will handle displaying the conversation history
   * - Supports both viewing history and creating new conversations
   */
  return <ChatHistory sessionId={id} title={chatTitle} userId={user.id} />
}