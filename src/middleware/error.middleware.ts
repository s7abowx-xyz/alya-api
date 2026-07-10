import { NextFunction, Request, Response } from "express";

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message =
    err instanceof AppError
      ? err.message
      : "حدث خطأ غير متوقع في الخادم، الرجاء المحاولة لاحقًا";

  if (statusCode === 500) {
    console.error("[ALYA API ERROR]", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    message: "المسار المطلوب غير موجود",
  });
}
