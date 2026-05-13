export class KnownError extends Error {
  constructor(
    public readonly title: string,
    public readonly fix: string,
    public readonly cause?: unknown
  ) {
    super(title);
    this.name = "KnownError";
  }
}
