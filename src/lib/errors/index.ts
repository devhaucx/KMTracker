export class CronAuthorizationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CronAuthorizationError'
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}
