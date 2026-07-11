/**
 * Centralised logger. Use this throughout the codebase instead of console.log.
 * In production, swap the implementation here to send logs to a remote sink
 * (e.g. Sentry, Axiom, Datadog) without touching call-sites.
 */

type LogLevel = "debug" | "info" | "warn" | "error"

const isDev = process.env.NODE_ENV !== "production"

function formatMessage(level: LogLevel, context: string, message: string): string {
  const ts = new Date().toISOString()
  return `[${ts}] [${level.toUpperCase()}] [${context}] ${message}`
}

function log(level: LogLevel, context: string, message: string, data?: unknown): void {
  if (!isDev && level === "debug") return // suppress debug in production

  const formatted = formatMessage(level, context, message)

  switch (level) {
    case "debug":
      // biome-ignore lint/suspicious/noConsole: logger module is the single allowed console access point
      console.debug(formatted, data ?? "")
      break
    case "info":
      // biome-ignore lint/suspicious/noConsole: logger module
      console.info(formatted, data ?? "")
      break
    case "warn":
      // biome-ignore lint/suspicious/noConsole: logger module
      console.warn(formatted, data ?? "")
      break
    case "error":
      // biome-ignore lint/suspicious/noConsole: logger module
      console.error(formatted, data ?? "")
      break
  }
}

export const logger = {
  debug: (context: string, message: string, data?: unknown) =>
    log("debug", context, message, data),
  info: (context: string, message: string, data?: unknown) =>
    log("info", context, message, data),
  warn: (context: string, message: string, data?: unknown) =>
    log("warn", context, message, data),
  error: (context: string, message: string, data?: unknown) =>
    log("error", context, message, data),
}
