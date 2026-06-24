export type AppError = Error & { statusCode: number; code: string };

export function appError(statusCode: number, code: string, message: string): AppError {
  const err = new Error(message) as AppError;
  err.statusCode = statusCode;
  err.code = code;
  return err;
}
