import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../lib/jwt";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const tokenFromHeader = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : undefined;
  const token = tokenFromHeader ?? req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "يجب تسجيل الدخول للوصول إلى هذا المورد",
    });
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "جلسة الدخول غير صالحة أو منتهية، الرجاء تسجيل الدخول من جديد",
    });
  }
}
