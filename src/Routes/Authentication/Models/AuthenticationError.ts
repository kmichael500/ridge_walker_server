/** Used for errors authenticating a user. I.e bad user name/password, invalid jwt, etc */
export class AuthenticationError extends Error {
  /** @param {string} message The error message. */
  constructor(message: string) {
    super(message);
    this.message = message;
    this.name = "AuthenticationError";
  }
}
