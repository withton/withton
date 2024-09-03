export class WithTonConnectionError extends Error {
  private static readonly prefix = "WITH_TON_ERROR";
  public cause: unknown;

  protected get additionalInfo(): string {
    return "";
  }

  constructor(message: string, options?: { cause?: unknown }) {
    super(message);
    this.cause = options?.cause;

    this.message = `${WithTonConnectionError.prefix} - ${
      this.constructor.name
    }${this.additionalInfo ? ": " + this.additionalInfo : ""}${
      message ? "\n" + message : ""
    }`;

    Object.setPrototypeOf(this, WithTonConnectionError.prototype);
  }
}
