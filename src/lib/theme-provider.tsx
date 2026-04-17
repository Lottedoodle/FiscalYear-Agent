/**
 * ============================================================================
 * THEME PROVIDER - Theme Management System for Light/Dark Mode
 * ============================================================================
 * 
 * This provider manages the theme of the entire application, supporting:
 * - Light Mode
 * - Dark Mode
 * - System Mode: Adjust based on system preference
 * 
 * Features:
 * - Store theme preference in localStorage
 * - Support system preference detection
 * - Provide force override for light/dark mode
 * - Use CSS classes and data attributes
 */

"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

// Supported theme types
type Theme = "light" | "dark" | "system"

// Props for ThemeProvider component
type ThemeProviderProps = {
  children: React.ReactNode           // Child components to be wrapped
  defaultTheme?: Theme               // Initial theme (default: "system")
  storageKey?: string                // Key for localStorage storage (default: "ui-theme")
}

// State and methods that will be passed via Context
type ThemeProviderState = {
  theme: Theme                       // Current theme
  setTheme: (theme: Theme) => void   // Function to change theme
}

// Context initial state
const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

// Create Context for sharing theme state
const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

// Export Context so other components can use it
export { ThemeProviderContext }

/**
 * ThemeProvider Component - Manages application-wide theme
 * 
 * Responsibilities:
 * - Maintain current theme state
 * - Load theme from localStorage
 * - Update CSS classes and attributes based on theme
 * - Listen for system preference changes
 */
export function ThemeProvider({
  children,
  defaultTheme = "system",     // Initial theme
  storageKey = "ui-theme",     // Key for localStorage
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)  // Current theme
  const [mounted, setMounted] = useState(false)           // Component mount status

  /**
   * Initial Effect: Load theme from localStorage when component mounts
   */
  useEffect(() => {
    setMounted(true)                                               // Set mounted status to true
    const storedTheme = localStorage?.getItem(storageKey) as Theme // Retrieve theme from localStorage
    if (storedTheme) {
      setTheme(storedTheme)                                        // Apply theme from localStorage
    }
  }, [storageKey])

  /**
   * Main Effect: Update CSS classes and attributes based on theme
   * Executes when theme or mounted state changes
   */
  useEffect(() => {
    if (!mounted) return                                           // Wait for component to complete mounting

    const root = window.document.documentElement                   // Retrieve root element (<html>)

    // Remove existing classes and attributes first
    root.classList.remove("light", "dark", "force-light", "force-dark")
    root.removeAttribute("data-theme")

    if (theme === "system") {
      // For system mode: Adjust based on system preference
      const applySystemTheme = () => {
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches  // Check system preference
        
        root.classList.remove("light", "dark")                    // Remove existing theme classes
        if (systemPrefersDark) {
          root.classList.add("dark")                              // Add dark class
        } else {
          root.classList.add("light")                             // Add light class
        }
      }

      applySystemTheme()                                           // Apply theme immediately
      
      root.setAttribute("data-theme", "system")                   // Add data-theme="system"

      // Listen for system preference changes
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      mediaQuery.addEventListener("change", applySystemTheme)
      
      // Cleanup listener on unmount or theme change
      return () => {
        mediaQuery.removeEventListener("change", applySystemTheme)
      }
    }

    // For forced theme (light or dark)
    root.setAttribute("data-theme", theme)                         // Add data-theme attribute
    root.classList.add(theme)                                      // Add theme class (backward compatibility)
    
    // Add force class to override media query
    if (theme === "light") {
      root.classList.add("force-light")                           // Force light mode
    } else if (theme === "dark") {
      root.classList.add("force-dark")                            // Force dark mode
    }
  }, [theme, mounted])

  // Create value object for Context Provider
  const value = {
    theme,                                                         // Current theme
    setTheme: (theme: Theme) => {                                  // Function to change theme
      localStorage?.setItem(storageKey, theme)                     // Store theme in localStorage
      setTheme(theme)                                              // Update theme state
    },
  }

  // Render Provider with value
  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

/**
 * Custom Hook for using Theme Context
 * 
 * Used for:
 * - Retrieve current theme
 * - Change theme via setTheme function
 * 
 * Must be used within ThemeProvider
 */
export const useTheme = () => {
  const context = useContext(ThemeProviderContext)                 // Retrieve context

  // Validate Usage within ThemeProvider
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context                                                   // Return theme state and methods
}