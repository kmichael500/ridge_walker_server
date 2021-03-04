/**
 * Class for logging. Right now it logs to the console but this makes it easier
 * to refactor later.
 */
class LogService {
  /**
   * Log messages to console.
   *
   * @param {string} message - The message to log.
   * @param {LogLevel} logLevel - Information, Warning, Fatal.
   * @returns {void}
   */
  static log(message: string, logLevel: LogLevel = LogLevel.Information): void {
    // TODO: Log to DataBase.

    // eslint-disable-next-line no-console
    console.log(logLevel.toString() + ": " + message);
  }
}
/** Use Fatal for a fatal error. */
// eslint-disable-next-line no-unused-vars
enum LogLevel {
  // eslint-disable-next-line no-unused-vars
  Information = "Information",
  // eslint-disable-next-line no-unused-vars
  Warning = "Warning",
  // eslint-disable-next-line no-unused-vars
  Fatal = "Fatal",
}

export { LogLevel, LogService as Logger };
