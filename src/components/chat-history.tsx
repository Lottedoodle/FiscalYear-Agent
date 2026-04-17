/**
 * ===============================================
 * Chat History Component
 * ===============================================
 * 
 * Purpose: Display conversation history from a specific session and support continuing the conversation
 * 
 * Features:
 * - Display message history from a specific session
 * - Support continuing the conversation on the same page
 * - Manage loading states and error handling
 * - Check authentication before displaying content
 * - Display UI states: loading, error, empty, content
 * - Support markdown rendering and message actions
 * 
 * Dependencies:
 * - useChatHistory hook for managing data and API calls
 * - UI components for rendering
 * 
 * Authentication: Requires userId to access data
 * Data Source: PostgreSQL database via API endpoints
 */

"use client"

// ============================================================================
// IMPORTS
// ============================================================================
import {useState, useRef, useEffect } from "react"                                    // React hooks for DOM and lifecycle
import {
  ChatContainerContent,
  ChatContainerRoot,
} from "@/components/ui/chat-container"                                      // Container for chat messages
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
} from "@/components/ui/message"                                             // Components for displaying messages
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input"                                        // Components for user input
import { ScrollButton } from "@/components/ui/scroll-button"                 // Button to scroll down
import { Button } from "@/components/ui/button"                             // Basic button component
import { SidebarTrigger } from "@/components/ui/sidebar"                    // Button to toggle sidebar
import { ModelSelector } from "@/components/model-selector"                 // Dropdown to select AI model
import { useChatHistory } from "@/hooks/use-chat-history"                   // Custom hook for chat history management
import {
  ArrowUp,
  Check,
  Copy,
  Globe,
  Mic,
  MoreHorizontal,
  Plus,
  Square,
} from "lucide-react"                                                        // Icons from Lucide React
import { DEFAULT_MODEL } from "@/constants/models"                           // Default AI model

// ============================================================================
// TypeScript Interface Definitions
// ============================================================================

/**
 * Interface for ChatHistory component Props
 * 
 * Structure:
 * - sessionId: string - ID of the session to display history for
 * - title: string - Title displayed in the header
 * - userId: string (optional) - User ID for authentication
 */
interface ChatHistoryProps {
  sessionId: string                                                          // ID of the session to display
  title: string                                                              // Title displayed in header
  userId?: string                                                            // User ID (optional for authentication)
}

// ============================================================================
// MAIN COMPONENT - Main view for displaying conversation history
// ============================================================================

/**
 * ChatHistory Component: Displays conversation history and supports continuing the chat
 * 
 * Purpose:
 * - Display message history from the specified session
 * - Support sending new messages to continue the conversation
 * - Manage authentication and authorization
 * - Display loading states and error handling
 * - Support markdown rendering and message actions
 * 
 * Process Flow:
 * 1. Check authentication (userId)
 * 2. Load conversation history from sessionId
 * 3. Display messages and support sending new messages
 * 4. Manage states: loading, error, empty, content
 * 
 * @param sessionId - ID of the session to display
 * @param title - Title displayed in the header
 * @param userId - User ID for authentication
 * @returns JSX Element or authentication prompt page
 */
export function ChatHistory({ sessionId, title, userId }: ChatHistoryProps) {

  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL)               // Selected AI model (default from constants)
  
  /**
   * State to track copy status of each message
   * key: message id, value: boolean (true = recently copied)
   */
  const [copiedMessages, setCopiedMessages] = useState<Record<string, boolean>>({})
  
  // ============================================================================
  // STEP 1: REF AND HOOK DECLARATIONS
  // ============================================================================
  
  /**
   * Reference for chat container
   * Used for scrolling and DOM manipulation
   */
  const chatContainerRef = useRef<HTMLDivElement>(null)
  
  /**
   * Custom hook for managing conversation history
   * 
   * Returns:
   * - messages: array of conversation messages
   * - loading: message sending status
   * - input: text entered by the user
   * - setInput: function to update input
   * - sendMessage: function to send a message
   * - loadChatHistory: function to load history
   * - loadingHistory: history loading status
   * - historyError: history loading error
   */
  const {
    messages,                                                                // array of conversation messages
    loading,                                                                 // message sending status
    input,                                                                   // current text input by user
    setInput,                                                                // function to set input
    sendMessage,                                                             // function to send message
    stopMessage,                                                             // function to stop message generation
    loadChatHistory,                                                         // function to load history
    loadingHistory,                                                          // history loading status
    historyError,                                                            // history loading error
  } = useChatHistory(sessionId, userId)                                      // Call custom hook

  // ============================================================================
  // STEP 2: EFFECTS - Managing Side Effects
  // ============================================================================

  /**
   * Effect to load chat history when sessionId changes
   * 
   * Purpose:
   * - Load conversation history when sessionId changes
   * - Ensure sessionId is not 'new' (used for creating new chats)
   * - Call history loading function from custom hook
   * 
   * Conditions:
   * - sessionId must have a value
   * - sessionId must not equal 'new'
   * 
   * Dependencies: [sessionId]
   * Note: Disabled eslint rule because loadChatHistory is from a hook and doesn't need to be in the dependency array
   */
  useEffect(() => {
    if (sessionId && sessionId !== 'new') {
      loadChatHistory(sessionId)                                             // Load history from sessionId
    }
  }, [sessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================================================
  // STEP 3: EVENT HANDLER FUNCTIONS
  // ============================================================================

  const handleCopyMessage = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content)
      
      // Show check icon
      setCopiedMessages(prev => ({ ...prev, [messageId]: true }))
      
      // Revert to copy icon after 2 seconds
      setTimeout(() => {
        setCopiedMessages(prev => ({ ...prev, [messageId]: false }))
      }, 2000)
      
      console.log('Message copied to clipboard')
    } catch (error) {
      console.error('Failed to copy message:', error)
    }
  }

  /**
   * Function to handle sending messages
   * 
   * Purpose:
   * - Validate data before sending
   * - Send message to API to continue conversation
   * - Prevent duplicate sending while loading
   * 
   * Validation:
   * - input must not be empty (trim)
   * - Currently not loading
   * - Must have userId (user is logged in)
   * 
   * Process:
   * 1. Check conditions
   * 2. Call sendMessage from hook
   * 3. Hook will handle sending and updating state
   */
  const onSubmit = () => {
    // Check conditions before sending message
    if (!input.trim() || loading || !userId) return
    
    // Send message via hook
    sendMessage(input)                                                       // Function from useChatHistory hook
  }

  const handleStop = () => {
    stopMessage()                                                            // Stop message generation
  }

  // ============================================================================
  // STEP 4: AUTHENTICATION GUARD
  // ============================================================================

  /**
   * Show authentication prompt when there is no userId
   * 
   * Purpose:
   * - Prevent data access by unauthenticated users
   * - Prompt the user to log in
   * - Secure conversation data
   * 
   * UI Components:
   * - Header with title and sidebar trigger
   * - Lock status icon
   * - Login prompt message
   * - Layout matching the main page
   */
  if (!userId) {
    return (
      <main className="flex h-screen flex-col overflow-hidden">
        {/* Header Section */}
        <header className="bg-background z-10 flex h-16 w-full shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />                              {/* Sidebar toggle button */}
          <div className="text-foreground flex-1">{title}</div>             {/* Page title from props */}
        </header>
        
        {/* Content Section */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            {/* Lock Icon */}
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
              <span className="text-red-500 text-xl">🔒</span>
            </div>
            
            {/* Authentication Message */}
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Please login</h2>
            <p className="text-gray-500">You must login before you can view the chat history</p>
          </div>
        </div>
      </main>
    )
  }

  // ============================================================================
  // STEP 5: MAIN RENDER
  // ============================================================================

  /**
   * Main render section of the component
   * 
   * Structure:
   * 1. Header - Header section with title
   * 2. Chat Container - Message rendering and states
   * 3. Input Section - Input area for continuing the chat
   * 
   * States Handled:
   * - Loading History: Showing history loading status
   * - Error: Showing errors and retry button
   * - Empty: Showing when there are no messages
   * - Content: Showing the list of messages
   */
  return (
    <main className="flex h-screen flex-col overflow-hidden">
      
      {/* ============================================================================ */}
      {/* HEADER SECTION */}
      {/* ============================================================================ */}
      
      <header className="bg-background z-10 flex h-16 w-full shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />                                {/* Sidebar toggle button */}
        <div className="text-foreground flex-1">{title}</div>               {/* Page title from props */}
        {/* Model Selector */}
        {/* <ModelSelector
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
        /> */}
      </header>

      {/* ============================================================================ */}
      {/* CHAT CONTAINER SECTION - Message rendering and States */}
      {/* ============================================================================ */}
      
      <div ref={chatContainerRef} className="relative flex-1 overflow-hidden">
        <ChatContainerRoot className="h-full">
          <ChatContainerContent className="p-4">
            
            {/* ============================================================================ */}
            {/* STATE: LOADING HISTORY */}
            {/* ============================================================================ */}
            
            {/* Rendered when history is loading */}
            {loadingHistory && (
              <div className="flex justify-center items-center py-8">
                <div className="text-center">
                  {/* Loading Spinner */}
                  <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
                  
                  {/* Loading Message */}
                  <div className="text-blue-600 dark:text-blue-400 font-medium">Loading chat history...</div>
                  <div className="text-sm text-gray-500 mt-1">Please wait...</div>
                </div>
              </div>
            )}
            
            {/* ============================================================================ */}
            {/* STATE: ERROR */}
            {/* ============================================================================ */}
            
            {/* Rendered when there is an error loading history */}
            {historyError && (
              <div className="flex justify-center items-center py-8">
                <div className="text-center max-w-md mx-auto">
                  {/* Error Icon */}
                  <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                    <span className="text-red-500 text-xl">⚠️</span>
                  </div>
                  
                  {/* Error Message */}
                  <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                    An error has occurred.
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {historyError}                                           {/* Error message from hook */}
                  </p>
                  
                  {/* Retry Button */}
                  <Button 
                    onClick={() => loadChatHistory(sessionId)}               
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                  >
                    Retry
                  </Button>
                </div>
              </div>
            )}
            
            {/* ============================================================================ */}
            {/* STATE: MESSAGES CONTENT */}
            {/* ============================================================================ */}
            
            {/* Rendered when there is no loading or error */}
            {!loadingHistory && !historyError && (
              <div className="space-y-3 max-w-3xl mx-auto w-full">
                {messages.map((message) => {
                  const isAssistant = message.role === "assistant"          // Check if message is from AI
                  
                  return (
                    /**
                     * Message Component
                     * 
                     * Props:
                     * - key: unique identifier from message.id
                     * - isAssistant: boolean to separate message types
                     * - bubbleStyle: use bubble style for displaying
                     */
                    <Message
                      key={message.id}                                       // unique key from message ID
                      isAssistant={isAssistant}                              // specify message type
                      bubbleStyle={true}                                     // use bubble style
                    >
                      
                      {/* Message Content */}
                      <MessageContent
                        isAssistant={isAssistant}
                        bubbleStyle={true}
                        markdown={isAssistant}                               // Display markdown only for assistant
                      >
                        {/* Message content from database */}
                        {message.content}                                    
                      </MessageContent>
                      
                      {/* Message Actions - Buttons to manage the message */}
                      <MessageActions
                        isAssistant={isAssistant}
                        bubbleStyle={true}
                      >
                        
                        {/* Copy Button */}
                        <MessageAction tooltip="" bubbleStyle={true}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-gray-500 hover:text-gray-700 rounded-full"
                            onClick={() => handleCopyMessage(message.content, message.id)}
                          >
                            {copiedMessages[message.id] ? (
                              <Check size={14} className="text-green-600" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </Button>
                        </MessageAction>
                        
                      </MessageActions>
                    </Message>
                  )
                })}
              </div>
            )}
            
            {/* ============================================================================ */}
            {/* STATE: EMPTY */}
            {/* ============================================================================ */}
            
            {/* Rendered when there is no loading, no error, and no messages */}
            {!loadingHistory && !historyError && messages.length === 0 && (
              <div className="flex justify-center items-center py-8">
                <div className="text-center max-w-md mx-auto">
                  {/* Chat Icon */}
                  <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">💬</span>
                  </div>
                  
                  {/* Empty State Message */}
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    Continue Your Conversation
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Type a message below to continue this chat session
                  </p>
                  
                  {/* Session Info */}
                  <div className="text-sm text-gray-400">
                    Session ID: {sessionId}
                  </div>
                </div>
              </div>
            )}
          </ChatContainerContent>
          
          {/* ============================================================================ */}
          {/* SCROLL BUTTON */}
          {/* ============================================================================ */}
          
          {/* Show scroll button only when there are messages */}
          {messages.length > 0 && (
            <div className="absolute bottom-4 left-1/2 flex w-full max-w-3xl -translate-x-1/2 justify-end px-5">
              <ScrollButton className="shadow-sm" />                        {/* Scroll to bottom button */}
            </div>
          )}
        </ChatContainerRoot>
      </div>

      {/* ============================================================================ */}
      {/* INPUT SECTION - Input area for continuing the chat */}
      {/* ============================================================================ */}
      
      <div className="bg-background z-[5] shrink-0 px-3 pb-3 md:px-5 md:pb-5">
        <div className="mx-auto max-w-3xl">
          
          {/* ============================================================================ */}
          {/* STATUS INDICATORS */}
          {/* ============================================================================ */}
          
          {/* Show message sending status (AI is replying) */}
          {loading && 
            <div className="flex items-center gap-2 text-gray-500 italic mb-2 text-sm">
              {/* Animated Dots - Loading indicators */}
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
              <span>AI is thinking...</span>
            </div>
          }
          
          {/* Show history loading status */}
          {loadingHistory && 
            <div className="text-blue-500 italic mb-2 text-sm flex items-center gap-2">
              {/* Loading Spinner */}
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span>Loading chat history...</span>
            </div>
          }
          
          {/* ============================================================================ */}
          {/* PROMPT INPUT COMPONENT - Main input area */}
          {/* ============================================================================ */}
          
          {/*
           * PromptInput Component
           * 
           * Purpose:
           * - Accept input from user to continue conversation
           * - Manage loading state
           * - Send message on Enter or button click
           * 
           * Props:
           * - isLoading: loading status (when sending message)
           * - value: current text input
           * - onValueChange: callback on text change
           * - onSubmit: callback on form submit
           */}

          {/* Show loading when sending a message */}
          <PromptInput
            isLoading={loading}
            value={input}                                                    // Current input text
            onValueChange={setInput}                                         // Callback to update text
            onSubmit={onSubmit}                                              // Callback to submit message
            className="border-input bg-popover relative z-10 w-full rounded-3xl border p-0 pt-1 shadow-xs"
          >
            <div className="flex flex-col">
              
              {/* ============================================================================ */}
              {/* TEXTAREA INPUT */}
              {/* ============================================================================ */}
              
              {/*
               * PromptInputTextarea Component
               * 
               * Purpose:
               * - Accept text from user to continue conversation
               * - Support multiline input
               * - Show placeholder to guide the user
               * 
               * Features:
               * - Auto-resize according to content
               * - Placeholder for continuing the chat
               * - Keyboard shortcuts to send message
               */}
              {/* Placeholder text */}
              <PromptInputTextarea
                placeholder="Continue the conversation..."
                className="min-h-[44px] pt-3 pl-4 text-base leading-[1.3] sm:text-base md:text-base"
              />

              {/* ============================================================================ */}
              {/* INPUT ACTIONS - Buttons in the input area */}
              {/* ============================================================================ */}
              
              {/*
               * PromptInputActions Component
               * 
               * Purpose:
               * - Group buttons in the input area
               * - Split into left and right groups
               * - Support actions like search, voice, send
               */}
              {/* Groups of buttons in input area */}
              <PromptInputActions className="mt-5 flex w-full items-center justify-between gap-2 px-3 pb-3">
                
                {/* Left Actions Group */}
                <div className="flex items-center gap-2">
                  
                  {/* Add Action Button */}
                  <PromptInputAction tooltip="Add a new action">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-9 rounded-full"
                    >
                      <Plus size={18} />
                    </Button>
                  </PromptInputAction>

                  {/* Search Button */}
                  <PromptInputAction tooltip="Search">
                    <Button variant="outline" className="rounded-full">
                      <Globe size={18} />
                      Search
                    </Button>
                  </PromptInputAction>

                  {/* More Actions Button */}
                  <PromptInputAction tooltip="More actions">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-9 rounded-full"
                    >
                      <MoreHorizontal size={18} />
                    </Button>
                  </PromptInputAction>
                </div>
                
                {/* Right Actions Group */}
                <div className="flex items-center gap-2">
                  
                  {/* Voice Input Button */}
                  <PromptInputAction tooltip="Voice input">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-9 rounded-full"
                    >
                      <Mic size={18} />
                    </Button>
                  </PromptInputAction>

                  {/* Send/Stop Button */}
                  {/*
                   * Send/Stop Button
                   * 
                   * Purpose:
                   * - Send message to continue conversation when not loading
                   * - Stop generating message when currently loading
                   * - Display loading state when sending
                   * - Check readiness before sending
                   * 
                   * Disabled Conditions:
                   * - Input is empty (!input.trim()) and not loading
                   * - No userId (not logged in)
                   */}
                  <Button
                    size="icon"
                    disabled={(!loading && (!input.trim() || !userId))}
                    onClick={loading ? handleStop : onSubmit}
                    className="size-9 rounded-full"
                    variant={loading ? 'destructive' : 'default'}
                  >
                    {/* Show icon based on loading state */}
                    {!loading ? (
                      /* Show arrow when ready */
                      <ArrowUp size={18} />
                    ) : (
                      /* Show stop button when loading */
                      <Square size={18} fill="currentColor" />
                    )}
                  </Button>
                </div>
              </PromptInputActions>
            </div>
          </PromptInput>
        </div>
      </div>
    </main>
  )
}