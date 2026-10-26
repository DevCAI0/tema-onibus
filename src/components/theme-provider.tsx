import { createContext, useCallback, useContext, useEffect, useState } from "react"

export type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  resolvedTheme: "dark" | "light"
  setTheme: (theme: Theme) => void
}

const ThemeProviderContext = createContext<ThemeProviderState | null>(null)

const systemTheme = (): "dark" | "light" =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"

function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.remove("light", "dark")
  root.classList.add(theme === "system" ? systemTheme() : theme)
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )
  const [system, setSystem] = useState(systemTheme)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // follows the OS while the theme is "system"
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => {
      setSystem(systemTheme())
      if (theme === "system") applyTheme("system")
    }
    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [theme])

  // applies the class right away (not only in the effect) so a View Transition
  // captures the new theme in the same callback
  const setTheme = useCallback(
    (next: Theme) => {
      localStorage.setItem(storageKey, next)
      applyTheme(next)
      setThemeState(next)
    },
    [storageKey]
  )

  return (
    <ThemeProviderContext.Provider
      value={{ theme, resolvedTheme: theme === "system" ? system : theme, setTheme }}
    >
      {children}
    </ThemeProviderContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeProviderContext)
  if (!context) throw new Error("useTheme must be used within a ThemeProvider")
  return context
}
