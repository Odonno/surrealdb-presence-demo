export class MissingAuthenticationError extends Error {
  constructor(message?: string) {
    super(message || "You are not authenticated");
    this.name = "MissingAuthenticationError";
  }
}
