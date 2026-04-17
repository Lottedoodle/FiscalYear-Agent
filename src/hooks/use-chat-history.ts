/**
 * ===============================================
 * useChatHistory Hook - Custom Hook for managing chat history
 * ===============================================
 * 
 * Description:
 * Integrated Custom Hook for managing chat history
 * Supports message streaming, history loading, and session management
 * 
 * Main features:
 * - Real-time message sending and streaming response receipt
 * - Load chat history from a session ID
 * - Manage session state and error handling
 * - Support for creating new chats and switching sessions
 * - Message sending via form submission
 */

"use client"

import { useState, useCallback } from 'react'
import { generateUniqueId } from '@/lib/utils'
import { API_BASE } from '@/constants/api'

// ===============================================
// Interface Definitions - Defining data structures
// ===============================================

/**
 * Interface for Chat Message
 * 
 * @param id - Unique message ID
 * @param role - Sender's role (user, assistant, system)
 * @param content - Message content
 * @param createdAt - Message creation time (optional)
 */
export interface ChatMessage {
  id: string                                    // Unique message ID
  role: 'user' | 'assistant' | 'system'        // Sender's role
  content: string                               // Message content
  createdAt?: string                            // Message creation time (ISO string)
}

// ===============================================
// Main Hook Function - Main Custom Hook function
// ===============================================

/**
 * useChatHistory Hook
 * 
 * Hook for managing chat history and real-time messaging
 * 
 * @param initialSessionId - Initial Session ID (optional)
 * @param userId - User ID for authentication (optional)
 * 
 * @returns Object containing various states, actions, and functions
 */
export function useChatHistory(initialSessionId?: string, userId?: string) {
  
  // ===============================================
  // State Management - Managing various states
  // ===============================================
  
  /**
   * Current Session ID in use
   * undefined means no session or a new session
   */
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(initialSessionId)
  
  /**
   * List of messages in the current conversation
   * Array of ChatMessage objects
   */
  const [messages, setMessages] = useState<ChatMessage[]>([])
  
  /**
   * Message sending status
   * true = sending message and waiting for response
   */
  const [loading, setLoading] = useState(false)
  
  /**
   * Chat history loading status
   * true = loading history from database
   */
  const [loadingHistory, setLoadingHistory] = useState(false)
  
  /**
   * Working error
   * null means no error
   */
  const [historyError, setHistoryError] = useState<string | null>(null)
  
  /**
   * Text typed by user in the input field
   */
  const [input, setInput] = useState('')

  /**
   * AbortController for canceling message transmission
   */
  const [abortController, setAbortController] = useState<AbortController | null>(null)

  // ===============================================
  // Main Functions - Main Hook functions
  // ===============================================
  
  /**
   * Function for sending messages and receiving streaming responses
   * 
   * Workflow:
   * 1. Validate conditions (non-empty message, not loading)
   * 2. Add user message to UI
   * 3. Convert message to AI SDK format
   * 4. Send request to API
   * 5. Read response via streaming
   * 6. Update UI in real-time
   * 7. Handle errors if any
   * 
   * @param message - Message to be sent
   * @returns Promise<void>
   */
  const sendMessage = useCallback(async (message: string) => {
    // Step 1: Initial validation
    if (!message.trim() || loading) return

    // Start loading status and clear error
    setLoading(true)
    setHistoryError(null)

    // Create AbortController for cancelation
    const controller = new AbortController()
    setAbortController(controller)

    // Step 2: Create user message with temporary ID
    const userMessage: ChatMessage = {
      id: generateUniqueId('temp-user'),       // Temporary ID for UI
      role: 'user',                            // Identify as user message
      content: message,                        // Message content
      createdAt: new Date().toISOString(),     // Current time
    }

    // Add user message to state and clear input
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')

    // Step 3: Convert message to API supported format (AI SDK format)
    const apiMessages = updatedMessages.map(msg => ({
      id: msg.id,
      role: msg.role,
      parts: [{ type: 'text', text: msg.content }]
    }))

    try {
      // Step 4: Send request to API
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,                // All messages in the conversation
          sessionId: currentSessionId,          // Current Session ID
          userId: userId,                       // User ID from auth system
        }),
        signal: controller.signal,              // Add AbortSignal
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      // Step 5: Extract sessionId from response header
      const sessionId = response.headers.get('x-session-id')
      if (sessionId && !currentSessionId) {
        setCurrentSessionId(sessionId)
      }

      // Step 6: Prepare to read response stream
      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      // Create empty AI message for UI display
      const assistantMessage: ChatMessage = {
        id: generateUniqueId('temp-assistant'), // Temporary ID for AI
        role: 'assistant',                      // Identify as AI message
        content: '',                            // Message content
        createdAt: new Date().toISOString(),
      }

      // Add AI message to UI
      setMessages(prev => [...prev, assistantMessage])

      // Step 7: Read and process streaming response
      const decoder = new TextDecoder()
      let accumulatedContent = ''              // Store all received content

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        
        // Split chunk into lines (SSE format)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6)     // Strip "data: "
              if (jsonStr === '[DONE]') break
              
              const data = JSON.parse(jsonStr)
              
              // Validate AI SDK data format
              if (data.type === 'text-delta' && data.delta) {
                accumulatedContent += data.delta
                
                // Update AI message content in real-time
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessage.id 
                    ? { ...msg, content: accumulatedContent }
                    : msg
                ))
              }
            } catch (e) {
              // If JSON parse fails, skip without error
              console.warn('Failed to parse streaming data:', line)
              console.error(e)
            }
          }
        }
      }
    } catch (error) {
      // Step 8: Error handling
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request was aborted')
      } else {
        setHistoryError(error instanceof Error ? error.message : 'Unknown error')
        console.error('Send message error:', error)
      }
    } finally {
      // Step 9: Process completion - close loading and clear controller
      setLoading(false)
      setAbortController(null)
    }
  }, [messages, currentSessionId, loading]) // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Function to stop message transmission
   */
  const stopMessage = useCallback(() => {
    if (abortController) {
      abortController.abort()
      setAbortController(null)
      setLoading(false)
    }
  }, [abortController])

  // ===============================================
  // History Management Functions - History management functions
  // ===============================================
  
  /**
   * Function for loading message history from session
   * 
   * Workflow:
   * 1. Start loading status and clear error
   * 2. Send GET request to API with sessionId
   * 3. Extract message data from response
   * 4. Update messages state
   * 5. Handle errors if any
   * 
   * @param sessionId - ID of the session to load history for
   * @returns Promise<void>
   */
  const loadChatHistory = async (sessionId: string) => {
    // Step 1: Start loading status
    setLoadingHistory(true)
    setHistoryError(null)
    
    try {
      // Step 2: Send request to API for history retrieval
      const apiUrl = `${API_BASE}?sessionId=${sessionId}`
      const response = await fetch(apiUrl)
      
      if (!response.ok) {
        throw new Error('Failed to load chat history')
      }
      
      // Step 3: Extract data from response
      const data = await response.json()
      const loadedMessages: ChatMessage[] = data.messages || []
      
      // Step 4: Update state
      setMessages(loadedMessages)              // Set loaded messages
      setCurrentSessionId(sessionId)          // Set current session ID
      
    } catch (err) {
      // Step 5: Error handling
      setHistoryError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      // Step 6: Close loading state
      setLoadingHistory(false)
    }
  }

  // ===============================================
  // Session Management Functions - Session management functions
  // ===============================================
  
  /**
   * Function for starting a new chat session
   * 
   * Description:
   * - Clear current session ID
   * - Clear all messages
   * - Clear error status
   * - Clear input field
   */
  const startNewChat = () => {
    setCurrentSessionId(undefined)           // No session ID (new session)
    setMessages([])                          // Clear all messages
    setHistoryError(null)                    // Clear error
    setInput('')                             // Clear input field
  }

  /**
   * Function for switching to another session
   * 
   * Description:
   * 1. Validate if it's the same session
   * 2. If not, load history for the new session
   * 
   * @param sessionId - ID of the session to switch to
   * @returns Promise<void>
   */
  const switchToSession = async (sessionId: string) => {
    // Step 1: Validate if it's the same session
    if (sessionId === currentSessionId) return
    
    // Step 2: Load history for the new session
    await loadChatHistory(sessionId)
  }

  // ===============================================
  // Form Handling Functions - Form handling functions
  // ===============================================
  
  /**
   * Function for handling form submission
   * 
   * Description:
   * 1. Prevent default form submission
   * 2. Validate if there's message in the input
   * 3. Call sendMessage if there's message
   * 
   * @param e - React Form Event
   */
  const handleSubmit = (e: React.FormEvent) => {
    // Step 1: Prevent page reload
    e.preventDefault()
    
    // Step 2 & 3: Validate and send message
    if (input.trim()) {
      sendMessage(input)
    }
  }

  // ===============================================
  // Return Object - Returning values from Hook
  // ===============================================
  
  /**
   * Return object containing states and functions
   * Grouped by usage:
   * 
   * 1. Messages and State - Message data and status
   * 2. Actions - Various actions
   * 3. Session Management - Session management
   * 4. Loading States - Various loading statuses
   */
  return {
    // ===============================================
    // Messages and State - Message data and status
    // ===============================================
    messages,           // List of messages in the current conversation
    loading,            // Message sending status (true = sending)
    input,              // Text typed by user in the input field
    setInput,           // Function to set input field text
    
    // ===============================================
    // Actions - Various actions
    // ===============================================
    sendMessage,        // Function for sending message (takes string parameter)
    stopMessage,        // Function to stop message transmission
    handleSubmit,       // Function for handling form submission
    
    // ===============================================
    // Session Management - Session management
    // ===============================================
    currentSessionId,   // Current Session ID (undefined = new session)
    setCurrentSessionId, // Function to set session ID
    loadChatHistory,    // Function for loading history from session ID
    startNewChat,       // Function for starting new chat (clear everything)
    switchToSession,    // Function for switching to another session
    
    // ===============================================
    // Loading States - Various loading statuses
    // ===============================================
    loadingHistory,     // History loading status (true = loading)
    historyError,       // Occurred error (null = no error)
  }
}