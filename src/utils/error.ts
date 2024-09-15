export class AppError extends Error {
  userMessage?: string;
  constructor(message: string, userMessage?: string) {
    super(message);
    this.name = 'AppError';
    this.userMessage = userMessage;
  }
}
