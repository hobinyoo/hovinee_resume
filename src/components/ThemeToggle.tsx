import { useEffect, useState } from "react"

type ThemeMode = "light" | "dark"

function getInitialMode(): ThemeMode {
  if (typeof window === "undefined") {
    return "light"
  }

  const stored = window.localStorage.getItem("theme")
  return stored === "dark" ? "dark" : "light"
}

function applyThemeMode(mode: ThemeMode) {
  document.documentElement.classList.remove("light", "dark")
  document.documentElement.classList.add(mode)
  document.documentElement.style.colorScheme = mode
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("light")

  useEffect(() => {
    const initialMode = getInitialMode()
    setMode(initialMode)
    applyThemeMode(initialMode)
  }, [])

  function toggleMode() {
    const nextMode: ThemeMode = mode === "light" ? "dark" : "light"
    setMode(nextMode)
    applyThemeMode(nextMode)
    window.localStorage.setItem("theme", nextMode)
  }

  const label = `Theme mode: ${mode}. Click to switch to ${mode === "light" ? "dark" : "light"} mode.`

  return (
    <button
      type="button"
      onClick={toggleMode}
      aria-label={label}
      title={label}
      className="rounded-md border border-border bg-card px-3.5 py-1 font-medium text-foreground hover:bg-muted"
    >
      {mode === "dark" ? "Dark" : "Light"}
    </button>
  )
}
