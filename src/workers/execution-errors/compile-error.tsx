export class CompileError extends Error {
  constructor(message: Error) {
    super(message.message);
    this.stack = message.stack;
    this.name = message.name;
  }
}
