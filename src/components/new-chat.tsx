/**
 * ===============================================
 * New Chat Component - New conversation page
 * ===============================================
 * 
 * Purpose: Main page for starting new conversations and managing chat history
 * 
 * Features:
 * - Display Welcome screen for new conversations
 * - Load chat history from session ID
 * - Send messages to AI and receive responses
 * - Manage authentication and session
 * - Support creating new chat sessions
 * - Show loading and typing status
 * 
 * Authentication: Uses Supabase Authentication
 * State Management: Uses React Context and Local State
 * Chat Transport: Uses AI SDK for streaming management
 */

"use client"

// ============================================================================
// IMPORTS - Importing necessary components and libraries
// ============================================================================
import {
  ChatContainerContent,
  ChatContainerRoot,
} from "@/components/ui/chat-container"                                      // Container for displaying chat messages
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
} from "@/components/ui/prompt-input"                                       // Components for receiving user input
import { ScrollButton } from "@/components/ui/scroll-button"                // Button for scrolling to the bottom
import { Button } from "@/components/ui/button"                             // Basic button component
import { SidebarTrigger } from "@/components/ui/sidebar"                    // Button for toggling the sidebar
import { ModelSelector } from "@/components/model-selector"                 // Dropdown for selecting AI models
import { cn } from "@/lib/utils"                                            // Utility for managing CSS classes
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
import { useRef, useState, useEffect } from "react"                          // React Hooks
import { useChatContext } from "@/contexts/chat-context"                     // Context for managing chat state
import { useChat } from '@ai-sdk/react'                                      // Hook for managing AI chat
import { createCustomChatTransport } from '@/lib/custom-chat-transport';     // Custom transport for data transmission
import { createClient } from '@/lib/client'                                  // Supabase client
import { DEFAULT_MODEL } from "@/constants/models"                           // Default AI model
import { API_BASE, buildApiUrl } from "@/constants/api"   // API endpoints constants

/**
 * Interface for Message Object
 * 
 * Structure:
 * - id: string - ID of the message
 * - role: string - Role ('user' or 'assistant')
 * - parts: Array - Message components
 */
interface MessageType {
  id: string;                                                                // ID of the message
  role: string;                                                              // Sender's role (user/assistant)
  parts: Array<{ type: string; text: string }>;                            // Message content in parts format
}

// Sample Prompt Interface
interface SamplePrompt {
  title: string;
  prompt: string;
  icon: string;
}

// Sample Prompt Data
const samplePrompts: SamplePrompt[] = [
    {
      title: 'Summary of information extracted from the article',
      prompt: 'Could you please summarize the key points from the article I have provided?',
      icon: '📋'
    },
    {
      title: 'Write code to work',
      prompt: 'Could you please write Python code to read a CSV file and display the data as a graph?',
      icon: '💻'
    },
    {
      title: 'Translate language',
      prompt: 'Could you please translate this text from Thai to English?',
      icon: '🌐'
    },
    {
      title: 'Analyze data',
      prompt: 'Could you please analyze the sales data of the company in the past quarter?',
      icon: '📊'
    },
    {
      title: 'Write email',
      prompt: 'Could you please write an email to schedule a meeting with the customer?',
      icon: '✉️'
    },
    {
      title: 'Fix errors',
      prompt: 'My code has errors, could you please help find and fix them?',
      icon: '🐛'
    }
]

export function NewChat() {
  
  // ============================================================================
  // STEP 1: STATE DECLARATIONS - Declaring State Variables
  // ============================================================================

  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL)               // Selected AI model (default from constants)
  
  /**
   * Message text typed by the user in the input field
   * Used to store the message to be sent to AI
   */
  const [prompt, setPrompt] = useState("")
  
  /**
   * Welcome screen display status and function to change the status
   * From ChatContext shared across the entire application
   */
  const { showWelcome, setShowWelcome } = useChatContext()
  
  /**
   * Reference for DOM elements needing direct access
   * Used for scrolling and focusing
   */
  const chatContainerRef = useRef<HTMLDivElement>(null)                      // Container for chat messages
  const textareaRef = useRef<HTMLTextAreaElement>(null)                      // Textarea for typing messages
  
  /**
   * State for tracking the copy status of each message
   * key: message id, value: boolean (true = just clicked copy)
   */
  const [copiedMessages, setCopiedMessages] = useState<Record<string, boolean>>({})
  
  /**
   * ID of the currently logged-in user
   * Used for identification and data recording
   */
  const [userId, setUserId] = useState<string>('')

  /**
   * ID of the current chat session
   * Used for storing chat history and continuity
   */
  const [sessionId, setSessionId] = useState<string | undefined>(undefined)
  
  /**
   * Chat history loading status
   * Displays loading message when fetching data from the database
   */
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  
  /**
   * Messages loaded from conversation history in the database
   * Stores messages retrieved from old sessions to continue display
   */
  const [loadedMessages, setLoadedMessages] = useState<MessageType[]>([])    // Stores messages loaded from history

  // ============================================================================
  // STEP 2: FUNCTION DEFINITIONS - Declaring Functions
  // ============================================================================

  const loadChatHistory = async (sessionIdToLoad: string) => {
    // Check if sessionId exists
    if (!sessionIdToLoad) return

    // Start showing loading status
    setIsLoadingHistory(true)
    
    try {
      // Call API to retrieve chat history
      const apiUrl = buildApiUrl(API_BASE, { sessionId: sessionIdToLoad })
      const response = await fetch(apiUrl)
      
      // Check if API response was successful
      if (!response.ok) {
        throw new Error('Failed to load chat history')
      }
      
      // Extract JSON data from the response
      const data = await response.json()
      const loadedMessagesData = data.messages || []
      
      /**
       * Convert messages from database format to UI format
       * 
       * Database Format: { id, role, content/text }
       * UI Format: { id, role, parts: [{ type: 'text', text }] }
       */
      const formattedMessages = loadedMessagesData.map((msg: { 
        id?: string; 
        role?: string; 
        content?: string; 
        text?: string 
      }, index: number) => ({
        id: msg.id || `loaded-${index}`,                                     // Use ID from DB or create a new one
        role: msg.role || 'user',                                            // Use the role obtained directly from API
        parts: [{ type: 'text', text: msg.content || msg.text || '' }]       // Convert to parts format
      }))
      
      // Store loaded messages in state
      setLoadedMessages(formattedMessages)
      console.log('Loaded messages:', formattedMessages)
      
    } catch (error) {
      // Handle errors that occur
      console.error('Error loading chat history:', error)
    } finally {
      // Stop showing loading status (runs whether successful or not)
      setIsLoadingHistory(false)
    }
  }

  // ============================================================================
  // STEP 3: CHAT HOOK INITIALIZATION - Setting up useChat Hook
  // ============================================================================
  const { messages, sendMessage, status, setMessages, stop } = useChat({

    transport: createCustomChatTransport({
      api: API_BASE,                                                        // API endpoint for sending messages
      
      onResponse: (response: Response) => {
        const newSessionId = response.headers.get('x-session-id');           // Retrieve session ID from the header
        if (newSessionId) {
          console.log('Received new session ID:', newSessionId);
          setSessionId(newSessionId);                                        // Update session ID in the state
          localStorage.setItem('currentSessionId', newSessionId);            // Save the latest sessionId in localStorage
          
          // Trigger event so the sidebar reloads history and shows the latest session
          window.dispatchEvent(new Event('chat-session-created'));
          
          // Navigate to the new chat's history page using replaceState (without reloading the page)
          window.history.replaceState(null, '', `/chat/${newSessionId}`);
        }
      },
    }),
  })

  // ============================================================================
  // STEP 4: AUTHENTICATION EFFECT - Authentication Checking and Management
  // ============================================================================

  useEffect(() => {
    const supabase = createClient()                                          // Create Supabase client
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()              // Retrieve user data
      if (user) {
        setUserId(user.id)                                                   // Store user ID

        const savedSessionId = localStorage.getItem('currentSessionId')
        if (savedSessionId && showWelcome) {
          setSessionId(savedSessionId)                                       // Set session ID
          setShowWelcome(false)                                              // Hide welcome to show history
        }
      }
    }

    getUser()                                                                // Call the function

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUserId(session.user.id)                                           // Store user ID
      } else {
        setUserId('')                                                        // Clear user ID
      }
    })

    /**
     * Cleanup function
     * Cancel subscription when the component unmounts
     */
    return () => subscription.unsubscribe()
  }, [setShowWelcome, showWelcome])

  // ============================================================================
  // STEP 5: UI FOCUS EFFECT - Managing UI Focus
  // ============================================================================

  useEffect(() => {
    if (showWelcome) {
      setTimeout(() => {
        textareaRef.current?.focus()                                         // Focus textarea after 100ms
      }, 100)
    }
  }, [showWelcome])

  // ============================================================================
  // STEP 6: CHAT RESET EFFECT - Managing Chat Reset
  // ============================================================================

  useEffect(() => {
    // When New Chat is clicked (showWelcome = true from context)
    if (showWelcome) {
      // Clear sessionId and messages immediately
      setSessionId(undefined)                                                // Clear session ID
      setMessages([])                                                        // Clear messages from useChat
      setLoadedMessages([])                                                  // Clear messages loaded from history
    }
  }, [showWelcome, setMessages])

  // ============================================================================
  // STEP 7: HISTORY LOADING EFFECT - Loading Chat History
  // ============================================================================
  useEffect(() => {
    // Load history only when not in welcome state and sessionId exists
    if (sessionId && userId && !showWelcome) {
      loadChatHistory(sessionId)                                             // Call history loading function
    }
  }, [sessionId, userId, showWelcome])

  // ============================================================================
  // STEP 8: EVENT HANDLER FUNCTIONS - Event Handler Functions
  // ============================================================================
  const handleSubmit = () => {
    // Check for userId and empty messages
    if (!prompt.trim() || !userId) return

    const messageToSend = {
      role: 'user' as const,
      parts: [{ type: 'text' as const, text: prompt.trim() }],
    }

    sendMessage(messageToSend, {
      body: {
        userId: userId,                                                      // Send user ID for identification
        sessionId: sessionId,                                               // Send session ID for continuity
      },
    })

    // Reset UI state
    setPrompt("")                                                            // Clear input message
    setShowWelcome(false)                                                    // Hide welcome screen
  }

  const handleSamplePrompt = (samplePrompt: string) => {
    setPrompt(samplePrompt)                                                  // Set input message
  }

  const handleStop = () => {
    stop()                                                                   // Stop message transmission
  }

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

  // ============================================================================
  // STEP 9: AUTHENTICATION GUARD - Access Rights Checking
  // ============================================================================
  if (!userId) {
    return (
      <main className="flex h-screen flex-col overflow-hidden">
        {/* Header Section */}
        <header className="bg-white/80 backdrop-blur-md z-10 flex h-14 w-full shrink-0 items-center gap-2 border-b border-sky-100/80 px-4 dark:bg-slate-900/80 dark:border-slate-800">
          <SidebarTrigger className="-ml-1 text-slate-500 hover:text-sky-600" />
          <div className="text-slate-700 dark:text-slate-200 flex-1 font-medium text-sm">New Chat</div>
        </header>
        
        {/* Content Section */}
        <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-white to-sky-50/40 dark:from-slate-950 dark:to-slate-900">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">Please log in</h2>
            <p className="text-slate-400 dark:text-slate-500 text-sm">You must log in first to use the Chat</p>
          </div>
        </div>
      </main>
    )
  }

  // ============================================================================
  // STEP 10: MAIN RENDER - Main Render Section
  // ============================================================================
  return (
    <main className="flex h-screen flex-col overflow-hidden">
      
      {/* HEADER SECTION */}
      <header className="bg-white/80 backdrop-blur-md z-10 flex h-14 w-full shrink-0 items-center gap-2 border-b border-sky-100/80 px-4 dark:bg-slate-900/80 dark:border-slate-800">
        <SidebarTrigger className="-ml-1 text-slate-500 hover:text-sky-600" />
        <div className="text-slate-700 dark:text-slate-200 flex-1 font-medium text-sm">New Chat</div>
        
        {/* Model Selector */}
        {/* <ModelSelector
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
        /> */}
      </header>

      {/* ============================================================================ */}
      {/* CHAT CONTAINER SECTION - Message Display Area */}
      {/* ============================================================================ */}
      
      <div ref={chatContainerRef} className="relative flex-1 overflow-hidden bg-gradient-to-b from-white to-sky-50/30 dark:from-slate-950 dark:to-slate-900">
        <ChatContainerRoot className="h-full">
          <ChatContainerContent
            className={cn(
              "p-4",
              (showWelcome && messages.length === 0 && loadedMessages.length === 0) 
                ? "flex items-center justify-center h-full" 
                : ""
            )}
          >
            {/* ============================================================================ */}
            {/* CONDITIONAL CONTENT - Content Displayed Based on Status */}
            {/* ============================================================================ */}
            
            {/* Welcome Screen - Welcome page for new conversations */}
            {(showWelcome && messages.length === 0 && loadedMessages.length === 0) ? (
              /**
               * Welcome Screen Layout
               * 
               * Components:
               * 1. AI Avatar and Welcome Message
               * 2. Sample Prompts Grid
               * 3. Interactive Buttons for quick start
               */
              <div className="text-center max-w-3xl mx-auto">
                
                {/* AI Avatar & Welcome */}
                <div className="mb-10 flex flex-col items-center">
                  <div className="h-[72px] px-8 mb-5 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-200 dark:shadow-sky-900/40 whitespace-nowrap">
                    <span className="text-white font-bold text-2xl">BKK AI</span>
                  </div>
                  <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-3 tracking-tight">
                    Welcome to BKK AI
                  </h1>
                  <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg mx-auto">
                    Welcome to BKK AI <br />
                    I'm ready to help you with a variety of tasks. Start with the examples below or type your question now.
                  </p>
                </div>

                {/* Sample Prompts Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {samplePrompts.map((sample, index) => (
                    <button 
                      key={index}
                      onClick={() => handleSamplePrompt(sample.prompt)}
                      className="bg-white hover:bg-sky-50 border border-sky-100 hover:border-sky-200 dark:bg-slate-800/70 dark:hover:bg-slate-800 dark:border-slate-700 rounded-xl p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm shadow-none group"
                    >
                      <div className="text-2xl mb-2">{sample.icon}</div>
                      <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-200 mb-1">{sample.title}</h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">{sample.prompt}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              // ============================================================================
              // CHAT MESSAGES DISPLAY - Conversation Message Display
              // ============================================================================
              <div className="space-y-3 max-w-3xl mx-auto w-full">
                {/* Combine loadedMessages and messages from useChat while filtering duplicates */}
                {(() => {
                  // For New Chat, use only messages from useChat
                  if (!sessionId || loadedMessages.length === 0) {
                    return messages
                  }
                  
                  // For chats with history, combine them with duplicate filtering
                  const allMessages = [...loadedMessages, ...messages]
                  const uniqueMessages = []
                  const seenContent = new Set()
                  
                  for (const message of allMessages) {
                    const content = typeof message === 'object' && 'parts' in message && message.parts
                      ? message.parts.map((part) => 'text' in part ? part.text : '').join('')
                      : String(message)
                    
                    const key = `${message.role}-${content}`
                    if (!seenContent.has(key)) {
                      seenContent.add(key)
                      uniqueMessages.push(message)
                    }
                  }
                  
                  return uniqueMessages
                })().map((message, index) => {
                  const isAssistant = message.role === "assistant"
                  
                  // Calculate content for use in the copy function
                  const messageContent = typeof message === 'object' && 'parts' in message && message.parts
                    ? message.parts.map((part) => 'text' in part ? part.text : '').join('')
                    : String(message)
                  
                  return (
                    <Message
                      key={`${message.id}-${index}`}
                      isAssistant={isAssistant}
                      bubbleStyle={true}
                    >
                      <MessageContent
                        isAssistant={isAssistant}
                        bubbleStyle={true}
                        markdown={isAssistant} // Display markdown for assistant only
                      >
                        {messageContent}
                      </MessageContent>
                      
                      <MessageActions
                        isAssistant={isAssistant}
                        bubbleStyle={true}
                      >
                        <MessageAction tooltip="" bubbleStyle={true}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-gray-500 hover:text-gray-700 rounded-full"
                            onClick={() => handleCopyMessage(messageContent, message.id)}
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
          </ChatContainerContent>
          
          {/* ============================================================================ */}
          {/* SCROLL BUTTON - Button for scrolling to the bottom */}
          {/* ============================================================================ */}
          
          {/* Show scroll button only when not on the welcome screen */}
          {!(showWelcome && messages.length === 0 && loadedMessages.length === 0) && (
            <div className="absolute bottom-4 left-1/2 flex w-full max-w-3xl -translate-x-1/2 justify-end px-5">
              <ScrollButton className="shadow-sm" />                        {/* Scroll to bottom button */}
            </div>
          )}
        </ChatContainerRoot>
      </div>

      {/* ============================================================================ */}
      {/* INPUT SECTION - User Input Area */}
      {/* ============================================================================ */}
      
      <div className="bg-white/90 backdrop-blur-md dark:bg-slate-900/90 border-t border-sky-100/60 dark:border-slate-800 z-[5] shrink-0 px-3 pb-3 md:px-5 md:pb-5">
        <div className="mx-auto max-w-3xl">
          
          {/* Status Indicators */}
          {(status === 'submitted' || status === 'streaming') && 
            <div className="text-sky-500 dark:text-sky-400 italic mb-2 text-xs font-medium flex items-center gap-1.5"><span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse"></span>AI is thinking...</div>
          }
          
          {isLoadingHistory && 
            <div className="text-sky-500 dark:text-sky-400 italic mb-2 text-xs font-medium">📚 Loading chat history...</div>
          }
          
          {/* ============================================================================ */}
          {/* PROMPT INPUT COMPONENT - Main Input Section */}
          {/* ============================================================================ */}
          <PromptInput
            isLoading={status !== 'ready'}
            value={prompt}
            onValueChange={setPrompt}
            onSubmit={handleSubmit}
            className="border-sky-200/80 bg-white dark:bg-slate-800 dark:border-slate-700 relative z-10 w-full rounded-3xl border p-0 pt-1 shadow-md shadow-sky-100/50 dark:shadow-slate-900/50 transition-all duration-200 focus-within:shadow-lg focus-within:border-sky-300 dark:focus-within:border-sky-700"
          >
            <div className="flex flex-col">
              
              {/* ============================================================================ */}
              {/* TEXTAREA INPUT - Text Typing Field */}
              {/* ============================================================================ */}
              
              <PromptInputTextarea
                ref={textareaRef}
                placeholder="Ask anything to start a new chat..."
                className="min-h-[44px] pt-3 pl-4 text-base leading-[1.3] sm:text-base md:text-base"
              />

              {/* ============================================================================ */}
              {/* INPUT ACTIONS - Various buttons in the input area */}
              {/* ============================================================================ */}

              <PromptInputActions className="mt-5 flex w-full items-center justify-between gap-2 px-3 pb-3">
                
                {/* Left Actions Group - Button group on the left */}
                <div className="flex items-center gap-2">
                  
                  {/* Add Action Button - Button to add an action */}
                  <PromptInputAction tooltip="Add a new action">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-9 rounded-full"
                    >
                      <Plus size={18} />
                    </Button>
                  </PromptInputAction>

                  {/* Search Button - Search button */}
                  <PromptInputAction tooltip="Search">
                    <Button variant="outline" className="rounded-full">
                      <Globe size={18} />
                      Search
                    </Button>
                  </PromptInputAction>

                  {/* More Actions Button - Additional actions button */}
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
                
                {/* Right Actions Group - Button group on the right */}
                <div className="flex items-center gap-2">
                  
                  {/* Voice Input Button - Voice input button */}
                  <PromptInputAction tooltip="Voice input">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-9 rounded-full"
                    >
                      <Mic size={18} />
                    </Button>
                  </PromptInputAction>

                  {/* Send/Stop Button - Send or Stop message button */}
                  <Button
                    size="icon"
                    disabled={
                      (status === 'ready' && (!prompt.trim() || !userId)) ||
                      (status !== 'ready' && status !== 'streaming' && status !== 'submitted')
                    }
                    onClick={
                      status === 'ready' ? handleSubmit : handleStop
                    }
                    className="size-9 rounded-full"
                    variant={status === 'ready' ? 'default' : 'destructive'}
                  >
                    {/* Display icon based on status */}
                    {status === 'ready' ? (
                      /* Show arrow when ready */
                      <ArrowUp size={18} />
                    ) : status === 'streaming' || status === 'submitted' ? (
                      /* Show stop button when sending */
                      <Square size={18} fill="currentColor" />
                    ) : (
                      /* Show loading indicator for other statuses */
                      <span className="size-3 rounded-xs bg-white" />
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