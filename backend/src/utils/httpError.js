// Controllers throw fail(...) instead of building error responses by hand; the error handler in app.js
// turns it into { success: false, code, message }. Express 5 passes thrown async errors along by itself.
export class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function fail(status, code, message) {
  throw new HttpError(status, code, message);
}
