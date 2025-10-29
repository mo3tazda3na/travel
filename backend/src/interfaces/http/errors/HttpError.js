export default class HttpError extends Error {
  constructor({ message, status = 500, code, data = null, src }) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
    this.data = data;
    this.src = src;
  }
}
