export class SafeEvaluationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SafeEvaluationError";
  }
}
