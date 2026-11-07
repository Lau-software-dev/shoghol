// The error every demo store throws: an HTTP-like status, a machine code, and a message ready to show.
export class ApiError extends Error {
  constructor(status, code, message) {
    super(message)
    this.status = status
    this.code = code
  }
}
