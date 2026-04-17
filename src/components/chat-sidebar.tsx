/**
 * ===============================================
 * Chat Sidebar Component
 * ===============================================
 * 
 * Purpose: Sidebar for navigation and conversation history management
 * 
 * Features:
 * - View chat history grouped by date
 * - Create a new conversation
 * - Delete conversation history
 * - Toggle sidebar (collapsible)
 * - User and application settings
 * - User profile and logout
 * - Theme toggle
 * - Responsive design for mobile/desktop
 * 
 * Components:
 * - SettingsDialog: Dialog for various settings
 * - ChatSidebar: Main sidebar
 * 
 * Data Management:
 * - useChatSessions hook for sessions management
 * - useChatContext for state management
 * 
 * Authentication: Requires userId to access data
 * Navigation: Use Next.js router for navigation
 */

"use client"

// ============================================================================
// IMPORTS
// ============================================================================
import { Button } from "@/components/ui/button"                             // Basic button component
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar"                                             // Sidebar components and hooks
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"                                             // Popover for user menu
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"                                        // Alert dialog for delete confirmation
import { 
  PlusIcon, 
  Search, 
  Settings, 
  User, 
  X, 
  Bell,
  Palette,
  Plug,
  Calendar,
  Database,
  Shield,
  UserCircle,
  Trash2
} from "lucide-react"                                                        // Icons from Lucide React
import { LogoutButton } from "@/components/logout-button"                   // Component for logout
import Link from "next/link"                                                 // Next.js Link for navigation
import { usePathname, useRouter } from "next/navigation"                     // Next.js hooks for routing
import { useState, useEffect, useRef } from "react"                          // React hooks
import { createPortal } from "react-dom"                                     // Portal for modal rendering
import { useChatContext } from "@/contexts/chat-context"                     // Context for chat state
import { useChatSessions } from "@/hooks/use-chat-sessions"                  // Custom hook for chat sessions
import { groupSessionsByDate } from "@/lib/utils"                            // Utility for grouping by date
import {
  GeneralTab,
  NotificationsTab,
  PersonalizationTab,
  ConnectorsTab,
  SchedulesTab,
  DataControlsTab,
  SecurityTab,
  AccountTab
} from "@/components/settings"                                               // Settings tab components
import { ThemeToggle } from "@/components/ui/theme-toggle"                   // Theme toggle component

// ============================================================================
// TypeScript Interface Definitions
// ============================================================================

/**
 * Interface for ChatSidebar component Props
 * 
 * Structure:
 * - display_name: string - User's display name
 * - email: string - User's email
 * - userId: string (optional) - User ID for authentication
 */
interface ChatSidebarProps {
  display_name: string                                                       // User's display name
  email: string                                                              // User's email
  userId?: string                                                            // User ID (optional for authentication)
}

// ============================================================================
// SETTINGS DIALOG COMPONENT
// ============================================================================

/**
 * SettingsDialog Component: Dialog for application settings
 * 
 * Purpose:
 * - Display settings as a modal dialog
 * - Support multiple tabs for different categories
 * - Responsive design for mobile/desktop
 * - Portal rendering to display outside DOM tree
 * 
 * Features:
 * - Tab navigation for setting categories
 * - Horizontal scroll for mobile tabs
 * - Backdrop click to close dialog
 * - Keyboard navigation support
 * 
 * @param isOpen - Status of dialog open/close
 * @param onClose - callback when dialog is closed
 * @returns JSX Element or null
 */
function SettingsDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  // ============================================================================
  // STEP 1: STATE DECLARATIONS
  // ============================================================================
  
  /**
   * States of Settings Dialog
   * 
   * Variables:
   * - activeTab: currently selected tab
   * - mounted: component mount status
   * - tabsContainerRef: reference for tabs container
   */
  const [activeTab, setActiveTab] = useState("general")                      // currently selected tab (defaults to "general")
  const [mounted, setMounted] = useState(false)                             // component mount status
  const tabsContainerRef = useRef<HTMLDivElement>(null)                     // ref for tabs container (for scrolling)

  // ============================================================================
  // STEP 2: EFFECTS - Managing Side Effects
  // ============================================================================

  /**
   * Effect to set mounted state
   * 
   * Purpose:
   * - Prevent hydration mismatch in SSR
   * - Ensure component is mounted before rendering
   */
  useEffect(() => {
    setMounted(true)                                                         // set mounted to true when component mounts
  }, [])

  /**
   * Effect to handle horizontal scroll in mobile tabs
   * 
   * Purpose:
   * - Support scrolling with mouse wheel in tabs container
   * - Improve UX for mobile devices
   * - Use native event listener for better control
   * 
   * Dependencies: [mounted]
   */
  useEffect(() => {
    const container = tabsContainerRef.current
    if (!container || !mounted) return

    /**
     * Handler สำหรับ wheel event
     * 
     * Purpose:
     * - แปลง vertical scroll เป็น horizontal scroll
     * - ป้องกัน default behavior ของ wheel event
     * 
     * @param e - WheelEvent object
     */
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault()                                                   // prevent default scroll behavior
        container.scrollLeft += e.deltaY > 0 ? 50 : -50                     // scroll left/right 50px
      }
    }

    // Add non-passive event listener
    container.addEventListener('wheel', handleWheel, { passive: false })

    /**
     * Cleanup function
     * Remove event listener when component unmounts
     */
    return () => {
      container.removeEventListener('wheel', handleWheel)
    }
  }, [mounted])

  // ============================================================================
  // STEP 3: EVENT HANDLER FUNCTIONS
  // ============================================================================

  /**
   * Function to handle tab selection and scrolling
   * 
   * Purpose:
   * - Change active tab
   * - Scroll the selected tab into view
   * - Improve UX for mobile navigation
   * 
   * Process:
   * 1. Set active tab
   * 2. Wait for DOM update
   * 3. Scroll to the selected tab
   * 
   * @param tabId - ID of the tab to select
   */
  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId)                                                      // set active tab
    
    // Ensure the clicked tab is in view
    setTimeout(() => {
      if (tabsContainerRef.current) {
        // Find the button element of the selected tab
        const activeButton = tabsContainerRef.current.querySelector(`[data-tab-id="${tabId}"]`) as HTMLElement
        if (activeButton) {
          // scroll to selected tab with smooth animation
          activeButton.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest', 
            inline: 'center' 
          })
        }
      }
    }, 50)                                                                   // Wait 50ms for DOM update
  }

  // ============================================================================
  // STEP 4: RENDER GUARD
  // ============================================================================

  /**
   * Check status before rendering dialog
   * 
   * Conditions:
   * - Do not show if isOpen = false
   * - Do not show if component is not mounted (prevents SSR issues)
   */
  if (!isOpen || !mounted) return null

  // ============================================================================
  // STEP 5: TABS CONFIGURATION
  // ============================================================================

  /**
   * Tab configuration for Settings Dialog
   * 
   * Structure:
   * - id: unique identifier for tab
   * - label: display text
   * - icon: component icon from Lucide React
   */
  const tabs = [
    { id: "general", label: "General", icon: Settings },                     // General settings
    { id: "notifications", label: "Notifications", icon: Bell },             // Notifications
    { id: "personalization", label: "Personalization", icon: Palette },      // Personalization
    { id: "connectors", label: "Connectors", icon: Plug },                   // Connectors
    { id: "schedules", label: "Schedules", icon: Calendar },                 // Schedules
    { id: "data-controls", label: "Data controls", icon: Database },         // Data controls
    { id: "security", label: "Security", icon: Shield },                     // Security
    { id: "account", label: "Account", icon: UserCircle },                   // User account
  ]

  // ============================================================================
  // STEP 6: TAB CONTENT RENDERER
  // ============================================================================

  /**
   * Function to render the content of the selected tab
   * 
   * Purpose:
   * - Render the appropriate component based on the active tab
   * - Manage routing within the settings dialog
   * 
   * @returns JSX Element of the tab content
   */
  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return <GeneralTab />                                                // Render General settings
      case "notifications":
        return <NotificationsTab />                                          // Render Notifications settings
      case "personalization":
        return <PersonalizationTab />                                        // Render Personalization settings
      case "connectors":
        return <ConnectorsTab />                                             // Render Connectors settings
      case "schedules":
        return <SchedulesTab />                                              // Render Schedules settings
      case "data-controls":
        return <DataControlsTab />                                           // Render Data controls settings
      case "security":
        return <SecurityTab />                                               // Render Security settings
      case "account":
        return <AccountTab />                                                // Render Account settings
      default:
        return <GeneralTab />                                                // Render General settings as default
    }
  }

  // ============================================================================
  // STEP 7: DIALOG CONTENT STRUCTURE
  // ============================================================================

  /**
   * Structure of the Settings Dialog content
   * 
   * Structure:
   * 1. Backdrop - background to close the dialog
   * 2. Dialog Container - main container
   * 3. Mobile/Desktop Tab Navigation
   * 4. Main Content Area
   * 
   * Features:
   * - Responsive layout (mobile/desktop)
   * - Portal rendering
   * - Backdrop click to close
   * - Keyboard navigation
   */
  const dialogContent = (
    <>
      {/* ============================================================================ */}
      {/* BACKDROP */}
      {/* ============================================================================ */}
      
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50"                          
        onClick={onClose}                                                    // Click backdrop to close dialog
      />
      
      {/* ============================================================================ */}
      {/* DIALOG CONTAINER */}
      {/* ============================================================================ */}
      
      {/* Dialog */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-4xl h-[80vh] sm:h-[80vh] overflow-hidden border border-gray-200 dark:border-gray-700 pointer-events-auto">
          <div className="flex h-full min-h-0 flex-col sm:flex-row mobile-dialog-layout">
            
            {/* ============================================================================ */}
            {/* MOBILE TAB NAVIGATION */}
            {/* ============================================================================ */}
            
            {/* Mobile Tab Navigation */}
            <div 
              ref={tabsContainerRef}                                         // ref for scroll handling
              className="flex sm:hidden mobile-tabs-scroll bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-2 py-2"
            >
              <div className="flex gap-1" style={{ minWidth: 'max-content' }}>
                {tabs.map((tab) => {
                  const IconComponent = tab.icon                             // Get icon component
                  return (
                    <button
                      key={tab.id}
                      data-tab-id={tab.id}                                  // attribute for scroll targeting
                      onClick={() => handleTabClick(tab.id)}               // call tab selection function
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-xs whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                        activeTab === tab.id
                          ? 'bg-gray-400 dark:bg-gray-700 text-white font-medium'  // style for active tab
                          : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'  // style for inactive tab
                      }`}
                      role="tab"                                             // accessibility role
                      tabIndex={0}                                           // keyboard navigation
                    >
                      <IconComponent className="h-3 w-3" />                 {/* Show icon */}
                      {tab.label}                                            {/* Show text */}
                    </button>
                  )
                })}
              </div>
            </div>
            
            {/* ============================================================================ */}
            {/* DESKTOP SIDEBAR */}
            {/* ============================================================================ */}
            
            {/* Desktop Sidebar */}
            <div className="hidden sm:block w-64 bg-gray-50 dark:bg-gray-800 p-4 border-r border-gray-200 dark:border-gray-700">
              <div className="space-y-1">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon                             // Get icon component
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}                   // Select tab (no scroll needed for desktop)
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${
                        activeTab === tab.id
                          ? 'bg-gray-400 dark:bg-gray-700 text-white font-medium'  // style for active tab
                          : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'  // style for inactive tab
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />                 {/* Show icon */}
                      {tab.label}                                            {/* Show text */}
                    </button>
                  )
                })}
              </div>
            </div>
            
            {/* ============================================================================ */}
            {/* MAIN CONTENT AREA */}
            {/* ============================================================================ */}
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden sm:overflow-visible">
              
              {/* ============================================================================ */}
              {/* HEADER */}
              {/* ============================================================================ */}
              
              {/* Header */}
              <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                {/* Title - Show current tab name */}
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white capitalize">
                  {tabs.find(tab => tab.id === activeTab)?.label || "General"}  {/* Find tab name by ID */}
                </h2>
                
                {/* Close Button */}
                <button 
                  onClick={onClose}                                          // Close dialog
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              
              {/* ============================================================================ */}
              {/* SETTINGS CONTENT */}
              {/* ============================================================================ */}
              
              {/* Settings Content */}
              <div className="flex-1 mobile-content-area sm:dialog-content-scroll sm:overflow-y-auto">
                <div className="p-4 sm:p-6">
                  {renderTabContent()}                                      {/* Render content based on active tab */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )

  // ============================================================================
  // STEP 8: PORTAL RENDERING
  // ============================================================================

  /**
   * Render dialog using createPortal
   * 
   * Purpose:
   * - Render dialog outside the component's DOM tree
   * - Prevent z-index and overflow issues
   * - Support SSR by checking mounted state
   * 
   * Conditions:
   * - Show only when mounted = true
   * - Use document.body as target
   */
  return mounted ? createPortal(dialogContent, document.body) : null
}

// ============================================================================
// MAIN CHAT SIDEBAR COMPONENT
// ============================================================================

/**
 * ChatSidebar Component: Sidebar for navigation and chat history management
 * 
 * Purpose:
 * - Display chat history grouped by date
 * - Create new conversations
 * - Delete conversation history
 * - Manage user profile and settings
 * - Support responsive design
 * 
 * Features:
 * - Collapsible sidebar
 * - Chat sessions grouped by date
 * - Delete confirmation
 * - Settings dialog
 * - User profile popover
 * - Theme toggle
 * 
 * @param display_name - User's display name
 * @param email - User's email
 * @param userId - User ID for authentication
 * @returns JSX Element
 */
export function ChatSidebar({ display_name, email, userId }: ChatSidebarProps) {
  
  // ============================================================================
  // STEP 1: HOOKS AND STATE DECLARATIONS
  // ============================================================================
  
  /**
   * React and Next.js Hooks
   * 
   * Variables:
   * - state: status of the sidebar (collapsed/expanded)
   * - pathname: current URL path
   * - router: router object for navigation
   * - resetChat: function to reset chat state from context
   */
  const { state } = useSidebar()                                             // sidebar state from UI component
  const pathname = usePathname()                                             // current URL path
  const router = useRouter()                                                 // router for navigation
  const { resetChat } = useChatContext()                                     // reset chat function from context
  
  /**
   * Local State Variables
   * 
   * Variables:
   * - isSettingsOpen: status of settings dialog (open/closed)
   * - deleteDialogOpen: status of delete confirmation dialog (open/closed)
   * - sessionToDelete: ID of session to be deleted
   */
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)               // status of settings dialog (open/closed)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)           // status of delete confirmation dialog
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null) // ID of session to be deleted
  
  /**
   * Custom Hook for managing Chat Sessions
   * 
   * Returns:
   * - sessions: array of chat sessions
   * - loading: loading status
   * - fetchSessions: function to fetch sessions
   * - deleteSession: function to delete a session
   */
  const { sessions, loading, fetchSessions, deleteSession } = useChatSessions(userId)
  
  /**
   * Group sessions by date
   * 
   * Purpose:
   * - Organize display for better readability
   * - Group by periods (Today, Yesterday, Last 7 days, etc.)
   */
  const groupedSessions = groupSessionsByDate(sessions)                      // group sessions by date

  // ============================================================================
  // STEP 2: EFFECTS
  // ============================================================================

  /**
   * Effect to fetch sessions on component mount or when userId changes
   * 
   * Purpose:
   * - Load user's chat sessions
   * - Refresh data when userId changes
   * - Prevent API call when there is no userId
   * 
   * Dependencies: [userId]
   * Note: Disabled eslint rule because fetchSessions comes from a hook and doesn't need to be in the dependency array
   */
  useEffect(() => {
    if (userId) {
      fetchSessions()                                                        // Fetch sessions only if userId exists
    }
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================================================
  // STEP 3: EVENT HANDLER FUNCTIONS
  // ============================================================================

  /**
   * Function to handle the New Chat button
   * 
   * Purpose:
   * - Reset chat state to start a new conversation
   * - Clear sessionId from localStorage
   * - Navigate to welcome screen
   * - Handle errors
   * 
   * Process:
   * 1. Check userId
   * 2. Reset chat state
   * 3. Clear localStorage
   * 4. Navigate to chat page
   */
  const handleNewChat = async () => {
    if (!userId) return                                                      // prevent execution if no userId
    
    try {
      // Reset chat state
      resetChat()                                                            // call reset function from context
      
      // Clear sessionId from localStorage
      localStorage.removeItem('currentSessionId')                           // remove stored session ID
      
      // Go to New Chat (Welcome screen) without creating a new session immediately
      router.push("/chat")                                                   // navigate to chat page
      
    } catch (error) {
      console.error('Error navigating to new chat:', error)
      // If error occurs, go to the default chat page
      router.push("/chat")                                                   // fallback navigation
    }
  }

  /**
   * Function to handle session deletion
   * 
   * Purpose:
   * - Open confirmation dialog for deletion
   * - Prevent navigation when delete button is clicked
   * - Set the session to be deleted
   * 
   * Process:
   * 1. Prevent event propagation
   * 2. Check userId
   * 3. Store the ID of the session to be deleted
   * 4. Open confirmation dialog
   * 
   * @param sessionId - ID of the session to delete
   * @param e - React Mouse Event
   */
  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.preventDefault()                                                       // prevent navigation to Link
    e.stopPropagation()                                                      // prevent event bubbling
    
    if (!userId) return                                                      // prevent execution if no userId
    
    // Open Alert Dialog
    setSessionToDelete(sessionId)                                            // Store ID of session to be deleted
    setDeleteDialogOpen(true)                                                // open confirmation dialog
  }

  /**
   * Function to confirm session deletion
   * 
   * Purpose:
   * - Delete session from database
   * - Handle navigation if the current session is deleted
   * - Refresh sessions list
   * - Close dialog and clear state
   * 
   * Process:
   * 1. Check sessionToDelete
   * 2. Call API to delete session
   * 3. Check if it's the current session
   * 4. Navigate and refresh data
   * 5. Close dialog
   */
  const confirmDeleteSession = async () => {
    if (!sessionToDelete) return                                             // prevent execution if no sessionToDelete
    
    try {
      const success = await deleteSession(sessionToDelete)                   // call API to delete session
      if (success) {
        // If the current session was deleted, navigate to new chat
        if (pathname === `/chat/${sessionToDelete}`) {
          resetChat()                                                        // reset chat state
          localStorage.removeItem('currentSessionId')                       // remove from localStorage
          router.push("/chat")                                               // navigate to new chat page
        }
        // Refresh sessions list
        fetchSessions()                                                      // Load updated sessions list
      }
    } catch (error) {
      console.error('Error deleting session:', error)                       // Show error in console
    } finally {
      // Close dialog and clear state
      setDeleteDialogOpen(false)                                             // Close confirmation dialog
      setSessionToDelete(null)                                               // Clear session to be deleted
    }
  }

  // ============================================================================
  // STEP 4: MAIN RENDER
  // ============================================================================

  /**
   * Main render section of ChatSidebar
   * 
   * Structure:
   * 1. Sidebar Header - Header with logo and controls
   * 2. Sidebar Content - Main content and sessions list
   * 3. Sidebar Footer - Footer with user profile
   * 4. Dialogs - Settings dialog and delete confirmation
   */
  return (
    <Sidebar collapsible="icon">                                            {/* Collapsible Sidebar component */}
      
      {/* ============================================================================ */}
      {/* SIDEBAR HEADER */}
      {/* ============================================================================ */}
      
      <SidebarHeader className="flex flex-row items-center justify-between gap-2 px-2 py-3 border-b border-sky-100/70 dark:border-slate-800">
        
        {/* Logo and App Name */}
        <div className="flex flex-row items-center gap-2 px-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
          {/* BKK AI Logo */}
          <div className="h-8 px-3 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-sm shadow-sky-200 dark:shadow-sky-900/30 whitespace-nowrap">
            <span className="text-white font-bold text-xs">BKK AI</span>
          </div>
        </div>
        
        {/* Control Buttons - Hidden when sidebar is collapsed */}
        <div className="flex items-center gap-1 group-data-[collapsible=icon]:hidden">

          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* Search Button */}
          <Button
            variant="ghost"
            className="size-8"
          >
            <Search className="size-4" />
          </Button>
        </div>
      </SidebarHeader>

      {/* ============================================================================ */}
      {/* SIDEBAR CONTENT */}
      {/* ============================================================================ */}
      
      <SidebarContent className="pt-4">
        
        {/* ============================================================================ */}
        {/* NEW CHAT BUTTON */}
        {/* ============================================================================ */}
        
        <div className="px-3 group-data-[collapsible=icon]:px-2">
          <Button
            variant="outline"
            className="mb-3 flex w-full items-center gap-2 group-data-[collapsible=icon]:size-8 cursor-pointer group-data-[collapsible=icon]:p-0 border-sky-200 hover:bg-sky-50 hover:border-sky-300 text-slate-600 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-300 rounded-xl text-sm"
            title={state === "collapsed" ? "New Chat" : undefined}
            onClick={handleNewChat}
          >
            <PlusIcon className="size-4" />
            <span className="group-data-[collapsible=icon]:hidden cursor-pointer">
              New Chat
            </span>
          </Button>
        </div>

        {/* ============================================================================ */}
        {/* LOADING STATE */}
        {/* ============================================================================ */}
        
        {/* Loading state */}
        {loading && (
          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>Loading...</SidebarGroupLabel>
          </SidebarGroup>
        )}

        {/* ============================================================================ */}
        {/* CHAT SESSIONS LIST */}
        {/* ============================================================================ */}
        
        {/* Chat sessions grouped by date */}
        {!loading && groupedSessions.map((group) => (
          <SidebarGroup
            key={group.period}                                              // unique key for group
            className="group-data-[collapsible=icon]:hidden"               // hide when collapsed
          >
            <SidebarGroupLabel>{group.period}</SidebarGroupLabel>           {/* Display group name e.g., "Today", "Yesterday" */}
            <SidebarMenu>
              {group.sessions.map((session) => (
                <div key={session.id} className="relative group/item">
                  {/* Session Link */}
                  <Link href={`/chat/${session.id}`}>
                    <SidebarMenuButton
                      isActive={pathname === `/chat/${session.id}`}
                      tooltip={
                        state === "collapsed" ? session.title : undefined
                      }
                      className="cursor-pointer pr-8"
                    >
                      <span className="group-data-[collapsible=icon]:hidden truncate">
                        {session.title}
                      </span>
                    </SidebarMenuButton>
                  </Link>
                  
                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDeleteSession(session.id, e)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-500 hover:text-red-700 dark:hover:text-red-400"
                    title="Delete Chat History"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}

        {/* ============================================================================ */}
        {/* EMPTY STATE */}
        {/* ============================================================================ */}
        
        {/* Empty state */}
        {!loading && groupedSessions.length === 0 && (
          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
              No chat history yet.<br />
              Start a new conversation!
            </div>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* ============================================================================ */}
      {/* SIDEBAR FOOTER */}
      {/* ============================================================================ */}
      
      {/* User Profile Footer */}
      <SidebarFooter className="p-3 border-t border-sky-100/70 dark:border-slate-800 group-data-[collapsible=icon]:p-2">
        <Popover>
          <PopoverTrigger asChild>
            {/* User Profile Button */}
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-1">
              {/* User Avatar */}
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shrink-0 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 shadow-sm">
                <span className="text-white font-semibold text-sm group-data-[collapsible=icon]:text-xs">
                  {display_name
                    ? display_name.charAt(0).toUpperCase()
                    : email.charAt(0).toUpperCase()}
                </span>
              </div>
              
              {/* User Info */}
              <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                  {display_name || email.split("@")[0]}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                  {email}
                </p>
              </div>
            </div>
          </PopoverTrigger>
          
          {/* ============================================================================ */}
          {/* USER PROFILE POPOVER */}
          {/* ============================================================================ */}
          
          <PopoverContent side="top" align="start" className="w-80 p-0">
            <div className="space-y-0">
              
              {/* User Info Header */}
              <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-700">
                {/* User Avatar */}
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {display_name
                      ? display_name.charAt(0).toUpperCase()
                      : email.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                {/* User Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {display_name || email.split("@")[0]}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {email}
                  </p>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2 space-y-1">
                
                {/* Upgrade Plan Button */}
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-10 text-left px-3"
                >
                  <User className="h-4 w-4" />
                  Upgrade plan
                </Button>

                {/* Customize Genius AI Button */}
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-10 text-left px-3"
                >
                  <Settings className="h-4 w-4" />
                  Customize Genius AI
                </Button>

                {/* Settings Button */}
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-10 text-left px-3"
                  onClick={() => setIsSettingsOpen(true)}                    // Open settings dialog
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>

                <hr className="my-2 border-slate-200 dark:border-slate-700" />

                {/* Logout Button */}
                <div className="px-1">
                  <LogoutButton />                                            {/* Logout component */}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </SidebarFooter>

      {/* ============================================================================ */}
      {/* DIALOGS */}
      {/* ============================================================================ */}
      
      {/* Settings Dialog */}
      <SettingsDialog 
        isOpen={isSettingsOpen}                                             // open/close status
        onClose={() => setIsSettingsOpen(false)}                           // callback to close dialog
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat History</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this chat history? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {/* Cancel Button */}
            <AlertDialogCancel onClick={() => {
              setDeleteDialogOpen(false)                                     // close dialog
              setSessionToDelete(null)                                       // clear session to delete
            }}>
              Cancel
            </AlertDialogCancel>
            
            {/* Confirm Delete Button */}
            <AlertDialogAction 
              onClick={confirmDeleteSession}                                 // call delete confirmation function
              className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  )
}