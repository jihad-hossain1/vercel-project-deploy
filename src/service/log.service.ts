
import prisma from "../lib/prisma";

/**
 * Interface for log parameters
 */
interface LogParams {
  source: string; // Service name (e.g., "auth-service")
  message: string; // Short description
  details?: string; // Optional stack trace or verbose info
  context?: object; // Optional metadata (user, request, etc.)
  metadata?: string; // Optional stringified trace ID, etc.
}

class LogService {
  /**
   * Internal log writer
   */
  async _write(logType: "ERROR" | "INFO" | "WARNING" | "DEBUG", data: LogParams): Promise<object> {
    const {
      source,
      message,
      details = null,
      context = null,
      metadata = null,
    } = data;

    if (!source || !message) {
      throw new Error("Missing required fields: source and message");
    }

    try {
      const logEntry = await prisma.logs.create({
        data: {
          logType,
          source,
          message,
          details,
          context,
          metadata,
        }
      });

      return logEntry;
    } catch (error) {
      console.error(`[LogService] Failed to log ${logType}:`, error);
      throw error;
    }
  }

  info(data: LogParams) {
    return this._write("INFO", data);
  }

  error(data: LogParams) {
    return this._write("ERROR", data);
  }

  warn(data: LogParams) {
    return this._write("WARNING", data);
  }

  debug(data: LogParams) {
    return this._write("DEBUG", data);
  }
}

const logService = new LogService();

export default {
  info: logService.info.bind(logService),
  error: logService.error.bind(logService),
  warn: logService.warn.bind(logService),
  debug: logService.debug.bind(logService)
};
