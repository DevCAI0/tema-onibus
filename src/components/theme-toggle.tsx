import { useEffect, useRef } from "react"
import { flushSync } from "react-dom"
import { MoonIcon, SunIcon } from "lucide-react"

import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import "./theme-toggle.css"

type ThemeToggleProps = React.ComponentProps<typeof Button> & {
  /** GIF/PNG/SVG with transparency; the new theme shows through its opaque pixels */
  maskSrc: string
  /**
   * Total time in ms. The mask holds still for 80% of it, so for an animated GIF
   * that plays once use about `gif length / 0.9`.
   */
  duration?: number
  /** Mask size while it holds in the center (any CSS length) */
  maskSize?: string
}

const canAnimate = () =>
  "startViewTransition" in document &&
  window.matchMedia("(prefers-reduced-motion: no-preference)").matches

export function ThemeToggle({
  maskSrc,
  duration = 2200,
  maskSize = "30vmax",
  onClick,
  children,
  ...props
}: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const mask = useRef<Promise<Blob> | null>(null)
  const transition = useRef<ViewTransition | null>(null)

  // download the mask once, before the first click
  useEffect(() => {
    mask.current = fetch(maskSrc).then((r) => r.blob())
  }, [maskSrc])

  // while the transition runs, clicks land on <html> (its overlay), not on the button:
  // clicking anywhere skips straight to the end
  useEffect(() => {
    const skip = (e: MouseEvent) => {
      if (transition.current && e.target === document.documentElement) {
        transition.current.skipTransition()
      }
    }
    document.addEventListener("click", skip)
    return () => document.removeEventListener("click", skip)
  }, [])

  async function toggle(e: Parameters<NonNullable<typeof onClick>>[0]) {
    onClick?.(e)
    const next = resolvedTheme === "dark" ? "light" : "dark"

    if (!canAnimate() || !mask.current) {
      setTheme(next)
      return
    }

    // a fresh blob URL per switch makes an animated GIF start from its first frame
    let url: string
    try {
      url = URL.createObjectURL(await mask.current)
      const img = new Image()
      img.src = url
      await img.decode()
    } catch {
      setTheme(next)
      return
    }

    const root = document.documentElement
    root.style.setProperty("--theme-toggle-mask", `url(${url})`)
    root.style.setProperty("--theme-toggle-duration", `${duration}ms`)
    root.style.setProperty("--theme-toggle-mask-size", maskSize)
    root.dataset.themeToggle = ""

    const vt = document.startViewTransition(() => flushSync(() => setTheme(next)))
    transition.current = vt
    vt.finished.finally(() => {
      transition.current = null
      delete root.dataset.themeToggle
      for (const prop of ["--theme-toggle-mask", "--theme-toggle-duration", "--theme-toggle-mask-size"]) {
        root.style.removeProperty(prop)
      }
      URL.revokeObjectURL(url)
    })
  }

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label={resolvedTheme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
      onClick={toggle}
      {...props}
    >
      {children ?? (resolvedTheme === "dark" ? <SunIcon /> : <MoonIcon />)}
    </Button>
  )
}
