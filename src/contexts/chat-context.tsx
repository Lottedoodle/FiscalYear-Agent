/**
 * ===============================================
 * Chat Context Provider
 * ===============================================
 * 
 * Purpose: Manage chat state at a global level
 * 
 * Features:
 * - Manage list of conversation messages
 * - Control welcome message display
 * - Chat reset function
 * - Share state between various components
 * 
 * Pattern: React Context API
 * - Use createContext to create context
 * - Use Provider to share state
 * - Use custom hook to access context
 * 
 * State Management:
 * - chatMessages: All conversation messages
 * - showWelcome: Welcome screen display status
 * - resetChat: Conversation reset function
 */

"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'

// ===============================================
// TypeScript Interface Definitions - Defining types
// ===============================================

/**
 * Interface for Chat Context Type
 * 
 * Properties:
 * - chatMessages: Array of conversation messages
 * - setChatMessages: Function to update message list
 * - showWelcome: Welcome screen display status
 * - setShowWelcome: Function to change welcome screen status
 * - resetChat: Conversation reset function
 */
interface ChatContextType {
  chatMessages: Array<{
    id: number                                                              // Unique message ID
    role: string                                                            // Sender's role (user/assistant)
    content: string                                                         // Message content
  }>
  setChatMessages: React.Dispatch<React.SetStateAction<Array<{
    id: number                                                              // Unique message ID
    role: string                                                            // Sender's role (user/assistant)
    content: string                                                         // Message content
  }>>>
  showWelcome: boolean                                                      // Welcome screen display status
  setShowWelcome: React.Dispatch<React.SetStateAction<boolean>>            // Function to change welcome screen status
  resetChat: () => void                                                     // Conversation reset function
}

// ===============================================
// Context Creation - Creating React Context
// ===============================================

/**
 * Creating Chat Context for sharing state between components
 * 
 * Initial Value: undefined
 * - To force context usage via Provider only
 * - Prevent context usage outside Provider
 */
const ChatContext = createContext<ChatContextType | undefined>(undefined)

// ===============================================
// Chat Provider Component - Main State Handler
// ===============================================

/**
 * ChatProvider Component: Manages all conversation state
 * 
 * Purpose:
 * - A wrapper component that shares chat state
 * - Manages message state and rendering
 * - Provides context to all child components
 * 
 * State Management:
 * - Use useState to manage local state
 * - Use useCallback for performance optimization
 * 
 * @param children - Child components that will receive context
 * @returns JSX.Element that wraps children with Context Provider
 */
export function ChatProvider({ children }: { children: React.ReactNode }) {
  // ===============================================
  // Step 1: State Initialization - Defining initial state
  // ===============================================
  
  /**
   * State to store list of conversation messages
   * 
   * Initial Value: [] (empty array)
   * 
   * Message Structure:
   * - id: number - Unique message ID
   * - role: string - Role ('user' or 'assistant')
   * - content: string - Message content
   */
  const [chatMessages, setChatMessages] = useState<Array<{
    id: number                                                              // Unique message ID
    role: string                                                            // Sender's role
    content: string                                                         // Message content
  }>>([])                                                                   // Initialize with an empty array
  /**
   * State to control welcome screen display
   * 
   * Initial Value: true
   * 
   * Usage:
   * - true: Show welcome screen (when no conversation yet)
   * - false: Hide welcome screen (when conversation started)
   */
  const [showWelcome, setShowWelcome] = useState(true)                      // Welcome screen display status
  // ===============================================
  // Step 2: Callback Functions - Functions to manage state
  // ===============================================
  
  /**
   * Conversation reset function
   * 
   * Purpose:
   * - Clear all conversation messages
   * - Show welcome screen again
   * - Revert to initial state
   * 
   * Performance Optimization:
   * - Use useCallback to prevent unnecessary re-renders
   * - Empty dependency array [] as it doesn't depend on external values
   * 
   * Usage:
   * - Used when a new conversation is needed
   * - Used when chat history needs to be cleared
   */
  const resetChat = useCallback(() => {
    setChatMessages([])                                                     // Clear message list
    setShowWelcome(true)                                                    // Show welcome screen
  }, [])                                                                    // No dependencies
  // ===============================================
  // Step 3: Context Provider - Providing context values
  // ===============================================
  
  /**
   * Return Context Provider with all values
   * 
   * Provider Values:
   * - chatMessages: List of current messages
   * - setChatMessages: Function to update messages
   * - showWelcome: Welcome screen display status
   * - setShowWelcome: Function to change welcome screen status
   * - resetChat: Conversation reset function
   * 
   * Child Components:
   * - Every component under this Provider
   * - Can access context values via useChatContext hook
   */
  return (
    <ChatContext.Provider value={{
      chatMessages,                                                         // List of messages
      setChatMessages,                                                      // Function to update messages
      showWelcome,                                                          // Welcome screen status
      setShowWelcome,                                                       // Function to change welcome screen status
      resetChat                                                             // Conversation reset function
    }}>
      {children}
    </ChatContext.Provider>
  )
}

// ===============================================
// Custom Hook: useChatContext - Hook for accessing Chat Context
// ===============================================

/**
 * useChatContext Hook: Custom hook for accessing Chat Context
 * 
 * Purpose:
 * - Provides an easy interface for accessing chat context
 * - Verify if the hook is used under a Provider
 * - Prevent runtime errors from misusing context
 * 
 * Usage Pattern:
 * ```tsx
 * function MyComponent() {
 *   const { chatMessages, setChatMessages, resetChat } = useChatContext()
 *   // Use context values directly
 * }
 * ```
 * 
 * Error Handling:
 * - If used outside ChatProvider, throw an error
 * - Helps developers immediately identify misuse
 * 
 * @returns ChatContextType object containing all state and functions
 * @throws Error if used outside ChatProvider
 */
export function useChatContext() {
  // ===============================================
  // Step 1: Get Context Value - Retrieving context values
  // ===============================================
  
  /**
   * Retrieve context value from ChatContext
   * 
   * Return Value:
   * - ChatContextType object if under a Provider
   * - undefined if not under a Provider
   */
  const context = useContext(ChatContext)                                   // Retrieve context value  
  // ===============================================
  // Step 2: Validation Check - Validating state
  // ===============================================
  
  /**
   * Check if context has a value
   * 
   * Validation Logic:
   * - If context is undefined, it means it's not used under a Provider
   * - Throw an error to inform the developer
   * 
   * Error Message:
   * - Explain the problem and solution clearly
   */
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider')   // Error for unauthorized usage  }
  
  // ===============================================
  // Step 3: Return Context Value - Returning context values
  // ===============================================
  
  /**
   * Return context object with all values
   * 
   * Available Values:
   * - chatMessages: List of messages
   * - setChatMessages: Function to update messages
   * - showWelcome: Welcome screen status
   * - setShowWelcome: Function to change welcome screen status
   * - resetChat: Conversation reset function
   */
  return context                                                            // Return context values}