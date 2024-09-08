function loggerMessage(
  logFn: (...args: any[]) => void,
  logType: string,
  ...args: any[]
): void {
  if (typeof console !== "undefined") {
    try {
      logFn(`[WITHTON_PACKAGE] [${logType}]`, ...args);
    } catch (error) {
      console.warn("Logging failed:", error);
    }
  }
}

export function loggerDebug(...args: Parameters<Console["debug"]>): void {
  loggerMessage(console.debug, "DEBUG", ...args);
}

export function loggerError(...args: Parameters<Console["error"]>): void {
  loggerMessage(console.error, "ERROR", ...args);
}

export function loggerWarning(...args: Parameters<Console["warn"]>): void {
  loggerMessage(console.warn, "WARNING", ...args);
}
