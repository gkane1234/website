import { ZodError } from "zod";

export class ServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ServiceError";
  }
}

export function errorText(error: unknown) {
  if (error instanceof ServiceError) return error.message;
  if (error instanceof ZodError) return error.issues[0]?.message ?? "Invalid input";
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}
