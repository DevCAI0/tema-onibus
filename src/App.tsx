import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <main className="grid min-h-svh place-items-center p-4">
        <ThemeToggle maskSrc="/onibus-mascara.gif" duration={2200} maskSize="30vmax" />
      </main>
    </ThemeProvider>
  )
}

export default App
