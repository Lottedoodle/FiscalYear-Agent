/**
 * ===============================================
 * Chat Session Management API Routes
 * ===============================================
 * 
 * Purpose: Manage CRUD operations for chat sessions
 * 
 * Features:
 * - GET: Retrieve all sessions or a single session
 * - POST: Create a new session
 * - PUT: Update session title
 * - DELETE: Delete session and all related messages
 * 
 * Database Tables:
 * - chat_sessions: Stores session data
 * - chat_messages: Stores messages within each session
 * 
 * Authentication: Use userId for filtering data
 * Transaction: Use transaction for data deletion
 */

import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from '@/lib/database'

// ===============================================
// Configuration Setup - API Settings
// ===============================================

/**
 * Configures this API to run on Node.js Runtime to support PostgreSQL
 * 
 * Why Node.js Runtime:
 * - pg library requires Node.js APIs
 * - Edge Runtime does not support native database connections
 * - force-dynamic to ensure the response is always dynamic
 */
// export const runtime = "edge" // Disable Edge Runtime because pg requires Node.js APIs
export const dynamic = 'force-dynamic'                                     // Force response to be dynamic

// ===============================================
// Use centralized database utility
// ===============================================
const pool = getDatabase()

// ===============================================
// GET Method: Retrieve Chat Sessions
// ===============================================

/**
 * GET Handler: Retrieve all chat sessions or a single session
 * 
 * Purpose:
 * - Retrieve all sessions for a user
 * - Retrieve a single session using sessionId
 * - Count number of messages in each session
 * 
 * Query Parameters:
 * - userId: User ID (required)
 * - sessionId: Specific session ID (optional)
 * 
 * @param req NextRequest object containing query parameters
 * @returns Response object with session data
 */
export async function GET(req: NextRequest) {
  try {
    // ===============================================
    // Step 1: Extract Query Parameters - Get Parameters from URL
    // ===============================================
    
    /**
     * Extract query parameters from URL
     * 
     * Expected URL formats:
     * - /api/session?userId=123 (Get all sessions for a user)
     * - /api/session?userId=123&sessionId=456 (Get a single session)
     */
    const { searchParams } = new URL(req.url)                               // Extract query parameters from URL
    const userId = searchParams.get('userId')                              // User ID
    const sessionId = searchParams.get('sessionId')                        // Specific session ID (optional)
    
    // ===============================================
    // Step 2: Database Connection
    // ===============================================
    
    /**
     * Connect to PostgreSQL database
     * Use connection pool for efficient connection management
     */
    const client = await pool.connect()                                     // Connect to database
    
    try {
      // ===============================================
      // Step 3: Handle Single Session Query
      // ===============================================
      
      /**
       * If sessionId is provided, fetch single session data
       * 
       * Query Details:
       * - Fetch basic session info
       * - Count number of messages in session
       * - Use subquery to count messages from chat_messages
       */
      if (sessionId) {
        const result = await client.query(`
          SELECT 
            id,                                                             
            title,                                                          
            created_at,                                                     
            user_id,                                                        
            (
              SELECT COUNT(*) 
              FROM chat_messages
              WHERE session_id = chat_sessions.id::text
            ) as message_count                                              
          FROM chat_sessions 
          WHERE id = $1
        `, [sessionId])

        /**
         * Check if session exists
         * If not found, return 404 error
         */
        if (result.rows.length === 0) {
          return NextResponse.json(
            { error: "Session not found" },                                // Error message
            { status: 404 }                                                // HTTP 404 = Not Found
          )
        }

        /**
         * Return single session data
         * 
         * Response Structure:
         * - session: object containing session data
         */
        return NextResponse.json({
          session: result.rows[0]                                          // Session data found
        })
      }

      // ===============================================
      // Step 4: Handle Multiple Sessions Query
      // ===============================================
      
      /**
       * Create SQL query to fetch all sessions
       * 
       * Query Features:
       * - Fetch basic session info
       * - Count number of messages in each session
       * - Sort by created_at (newest first)
       * - Limit result to 50 records
       */
      let query = `
        SELECT 
          id,                                                               
          title,                                                            
          created_at,                                                       
          user_id,                                                          
          (
            SELECT COUNT(*) 
            FROM chat_messages
            WHERE session_id = chat_sessions.id::text
          ) as message_count                                                
        FROM chat_sessions 
      `
      
      /**
       * Variables to store parameters for prepared statement
       * Prevents SQL injection
       */
      const params: (string | number)[] = []                               // array to store parameters
      
      /**
       * Check if userId is provided
       * userId is a required parameter
       */
      if (!userId) {
        return Response.json({ error: 'User ID is required' }, { status: 400 })
      }
      
      /**
       * Add WHERE clause to filter by userId
       * Use parameterized query to prevent SQL injection
       */
      query += ` WHERE user_id = $1 `                                      // Add WHERE clause
      params.push(userId)                                                   // Add userId as the first parameter
      
      /**
       * Add ORDER BY and LIMIT clause
       * - Sort by created_at DESC (newest first)
       * - Limit result to 50 records
       */
      query += ` ORDER BY created_at DESC LIMIT 50`                        // Sort and limit
      
      /**
       * Execute query with parameters
       */
      const result = await client.query(query, params)                     // Execute prepared statement

      // ===============================================
      // Step 5: Return Multiple Sessions Response
      // ===============================================
      
      /**
       * Return sessions list to client
       * 
       * Response Structure:
       * - sessions: array of session objects
       */
      return NextResponse.json({
        sessions: result.rows                                               // All sessions list
      })
    } finally {
      // ===============================================
      // Step 6: Cleanup - Close Database Connection
      // ===============================================
      
      /**
       * Close database connection
       * Use finally block to ensure connection is always released
       */
      client.release()                                                      // Release connection back to pool
    }
  } catch (error) {
    // ===============================================
    // Error Handling
    // ===============================================
    
    /**
     * Handle errors during data fetch
     * 
     * Process:
     * 1. Log error to console
     * 2. Return error response to client
     */
    console.error("Error fetching chat sessions:", error)                  // Log error to console
    return NextResponse.json(
      { error: "Failed to fetch chat sessions" },                          // Error message
      { status: 500 }                                                      // HTTP 500 = Internal Server Error
    )
  }
}

// ===============================================
// POST Method: Create New Chat Session
// ===============================================

/**
 * POST Handler: Create a new chat session
 * 
 * Purpose:
 * - Create new session for user
 * - Set session title
 * - Return newly created session object
 * 
 * Request Body:
 * - title: Session name (optional, default: 'New Chat')
 * - userId: User ID (required)
 * 
 * @param req NextRequest object containing request body
 * @returns Response object with newly created session data
 */
export async function POST(req: NextRequest) {
  try {
    // ===============================================
    // Step 1: Parse Request Body
    // ===============================================
    
    /**
     * Extract data from request body
     * 
     * Expected Body Structure:
     * {
     *   "title": "Session Title", // optional
     *   "userId": "user123"       // required
     * }
     */
    const { title, userId } = await req.json()                             // Parse JSON body into object
    
    // ===============================================
    // Step 2: Validate Required Fields
    // ===============================================
    
    /**
     * Check if userId is provided
     * userId is required for creating a session
     */
    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 })
    }
    
    // ===============================================
    // Step 3: Database Connection
    // ===============================================
    
    /**
     * Connect to PostgreSQL database
     * Use connection pool for efficient connection management
     */
    const client = await pool.connect()                                     // Connect to database
    
    try {
      // ===============================================
      // Step 4: Create New Session
      // ===============================================
      
      /**
       * Create new chat session in database
       * 
       * Insert Query:
       * - title: Use provided title or 'New Chat' as default
       * - user_id: User's ID
       * - created_at: Set automatically by database
       * 
       * RETURNING clause: Returns the newly created data
       */
      const result = await client.query(`
        INSERT INTO chat_sessions (title, user_id)
        VALUES ($1, $2)
        RETURNING id, title, created_at
      `, [title || 'New Chat', userId])                                     // Use 'New Chat' if no title is provided

      /**
       * Extract newly created session info from query result
       */
      const newSession = result.rows[0]                                     // Newly created session object

      // ===============================================
      // Step 5: Return Success Response
      // ===============================================
      
      /**
       * Return newly created session to client
       * 
       * Response Structure:
       * - session: object containing new session data
       *   - id: Session ID
       *   - title: Session title
       *   - created_at: Creation time
       *   - message_count: Message count (0 for new session)
       */
      return NextResponse.json({
        session: {
          id: newSession.id,                                                // New session ID
          title: newSession.title,                                          // Session title
          created_at: newSession.created_at,                                // Creation time
          message_count: 0                                                  // Initial message count (0)
        }
      })
    } finally {
      // ===============================================
      // Step 6: Cleanup - Close Database Connection
      // ===============================================
      
      /**
       * Close database connection
       * Use finally block to ensure connection is always released
       */
      client.release()                                                      // Release connection back to pool
    }
  } catch (error) {
    // ===============================================
    // Error Handling
    // ===============================================
    
    /**
     * Handle errors during session creation
     * 
     * Process:
     * 1. Log error to console
     * 2. Return error response to client
     */
    console.error("Error creating chat session:", error)                   // Log error to console
    return NextResponse.json(
      { error: "Failed to create chat session" },                          // Error message
      { status: 500 }                                                      // HTTP 500 = Internal Server Error
    )
  }
}

// ===============================================
// PUT Method: Update Chat Session Title
// ===============================================

/**
 * PUT Handler: Update chat session title
 * 
 * Purpose:
 * - Edit existing session name
 * - Check if session exists
 * - Return updated session object
 * 
 * Request Body:
 * - sessionId: ID of session to update (required)
 * - title: New session name (required)
 * 
 * @param req NextRequest object containing request body
 * @returns Response object with updated session data
 */
export async function PUT(req: NextRequest) {
  try {
    // ===============================================
    // Step 1: Parse Request Body
    // ===============================================
    
    /**
     * Extract data from request body
     * 
     * Expected Body Structure:
     * {
     *   "sessionId": "session123", // required
     *   "title": "New Title"       // required
     * }
     */
    const { sessionId, title } = await req.json()                          // Parse JSON body into object
    
    // ===============================================
    // Step 2: Validate Required Fields
    // ===============================================
    
    /**
     * Check if sessionId and title are provided
     * Both are required for update
     */
    if (!sessionId || !title) {
      return NextResponse.json(
        { error: "Session ID and title are required" },                    // Error message
        { status: 400 }                                                    // HTTP 400 = Bad Request
      )
    }

    // ===============================================
    // Step 3: Database Connection
    // ===============================================
    
    /**
     * Connect to PostgreSQL database
     * Use connection pool for efficient connection management
     */
    const client = await pool.connect()                                     // Connect to database
    
    try {
      // ===============================================
      // Step 4: Update Session Title
      // ===============================================
      
      /**
       * Update session title in database
       * 
       * Update Query:
       * - SET title = $1: Set new title
       * - WHERE id = $2: Filter by session ID
       * - RETURNING: Return updated data
       */
      const result = await client.query(`
        UPDATE chat_sessions 
        SET title = $1 
        WHERE id = $2
        RETURNING id, title, created_at
      `, [title, sessionId])                                               // parameters: [title, sessionId]

      // ===============================================
      // Step 5: Check Update Result
      // ===============================================
      
      /**
       * Check if session was found and updated
       * If not found, return 404 error
       */
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: "Session not found" },                                  // Error message
          { status: 404 }                                                  // HTTP 404 = Not Found
        )
      }

      // ===============================================
      // Step 6: Return Success Response
      // ===============================================
      
      /**
       * Return updated session back to client
       * 
       * Response Structure:
       * - session: object containing updated session data
       */
      return NextResponse.json({
        session: result.rows[0]                                            // Updated session data
      })
    } finally {
      // ===============================================
      // Step 7: Cleanup - Close Database Connection
      // ===============================================
      
      /**
       * Close database connection
       * Use finally block to ensure connection is always released
       */
      client.release()                                                      // Release connection back to pool
    }
  } catch (error) {
    // ===============================================
    // Error Handling
    // ===============================================
    
    /**
     * Handle errors during session update
     * 
     * Process:
     * 1. Log error to console
     * 2. Return error response to client
     */
    console.error("Error updating chat session:", error)                   // Log error to console
    return NextResponse.json(
      { error: "Failed to update chat session" },                          // Error message
      { status: 500 }                                                      // HTTP 500 = Internal Server Error
    )
  }
}

// ===============================================
// DELETE Method: Delete Chat Session and All Messages
// ===============================================

/**
 * DELETE Handler: Delete chat session and all its messages
 * 
 * Purpose:
 * - Delete session and all related data
 * - Use database transaction for safety
 * - Check session existence before deletion
 * 
 * Query Parameters:
 * - sessionId: ID of session to delete (required)
 * 
 * Database Operations:
 * 1. Delete all messages from chat_messages table
 * 2. Delete session from chat_sessions table
 * 3. Use transaction to ensure both deletions succeed
 * 
 * @param req NextRequest object containing query parameters
 * @returns Response object with deletion status
 */
export async function DELETE(req: NextRequest) {
  try {
    // ===============================================
    // Step 1: Extract Query Parameters
    // ===============================================
    
    /**
     * Extract sessionId from URL query parameters
     * 
     * Expected URL format: /api/session?sessionId=xxx
     */
    const { searchParams } = new URL(req.url)                              // Extract query parameters from URL
    const sessionId = searchParams.get('sessionId')                       // Extract sessionId parameter
    
    // ===============================================
    // Step 2: Validate Required Parameters
    // ===============================================
    
    /**
     * Check if sessionId is provided
     * sessionId is required for deletion
     */
    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },                               // Error message
        { status: 400 }                                                    // HTTP 400 = Bad Request
      )
    }

    // ===============================================
    // Step 3: Database Connection
    // ===============================================
    
    /**
     * Connect to PostgreSQL database
     * Use connection pool for efficient connection management
     */
    const client = await pool.connect()                                     // Connect to database
    
    try {
      // ===============================================
      // Step 4: Start Database Transaction
      // ===============================================
      
      /**
       * Start database transaction
       * 
       * Transaction Benefits:
       * - Guarantee that all deletions succeed or fail together
       * - Prevent orphaned data
       * - Support rollback on error
       */
      await client.query('BEGIN')                                          // Start transaction
      
      // ===============================================
      // Step 5: Delete Messages - Delete All Messages in Session
      // ===============================================
      
      /**
       * Delete all messages in this chat session first
       * 
       * Delete Order:
       * 1. Delete chat_messages first (child table)
       * 2. Delete chat_sessions last (parent table)
       * 
       * Reason: Prevent foreign key constraint error
       */
      await client.query(`
        DELETE FROM chat_messages 
        WHERE session_id = $1
      `, [sessionId])                                                      // Delete all messages for this session
      
      // ===============================================
      // Step 6: Delete Session - Delete Chat Session
      // ===============================================
      
      /**
       * Delete chat session from database
       * 
       * Delete Query:
       * - WHERE id = $1: Filter by session ID
       * - RETURNING id: Return deleted session ID (to check existence)
       */
      const result = await client.query(`
        DELETE FROM chat_sessions 
        WHERE id = $1
        RETURNING id
      `, [sessionId])                                                      // Delete session and return ID
      
      // ===============================================
      // Step 7: Check Delete Result
      // ===============================================
      
      /**
       * Check if session was found and deleted
       * If not found, rollback transaction and return 404 error
       */
      if (result.rows.length === 0) {
        await client.query('ROLLBACK')                                     // Cancel transaction
        return NextResponse.json(
          { error: "Session not found" },                                  // Error message
          { status: 404 }                                                  // HTTP 404 = Not Found
        )
      }
      
      // ===============================================
      // Step 8: Commit Transaction
      // ===============================================
      
      /**
       * Commit transaction when all deletions succeed
       * 
       * Transaction Success:
       * - All messages deleted
       * - Session deleted
       * - No errors occurred
       */
      await client.query('COMMIT')                                         // Confirm transaction

      // ===============================================
      // Step 9: Return Success Response
      // ===============================================
      
      /**
       * Return deletion confirmation to client
       * 
       * Response Structure:
       * - message: Confirmation message
       * - sessionId: ID of deleted session
       */
      return NextResponse.json({
        message: "Session deleted successfully",                           // Confirmation message
        sessionId: sessionId                                               // ID of deleted session
      })
    } catch (error) {
      // ===============================================
      // Transaction Error Handling
      // ===============================================
      
      /**
       * Handle errors during transaction
       * 
       * Error Recovery:
       * 1. Rollback transaction to undo changes
       * 2. Re-throw error to be handled by outer catch
       */
      await client.query('ROLLBACK')                                       // Cancel transaction
      throw error                                                          // Pass error to outer catch
    } finally {
      // ===============================================
      // Step 10: Cleanup - Close Database Connection
      // ===============================================
      
      /**
       * Close database connection
       * Use finally block to ensure connection is always released
       * Whether or not an error occurred
       */
      client.release()                                                      // Release connection back to pool
    }
  } catch (error) {
    // ===============================================
    // Error Handling
    // ===============================================
    
    /**
     * Handle errors during session deletion
     * 
     * Process:
     * 1. Log error to console
     * 2. Return error response to client
     */
    console.error("Error deleting chat session:", error)                   // Log error to console
    return NextResponse.json(
      { error: "Failed to delete chat session" },                          // Error message
      { status: 500 }                                                      // HTTP 500 = Internal Server Error
    )
  }
}