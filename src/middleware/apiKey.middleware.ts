import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";

/**
 * يتحقق من مفتاح الـ API المُرسل عبر الترويسة x-api-key
 * أو عبر باراميتر الرابط ?apiKey=...
 * ويُرفق بيانات المستخدم في req.apiUser عند النجاح.
 */
export async function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey =
    (req.headers["x-api-key"] as string | undefined) ||
    (req.query.apiKey as string | undefined);

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: "مفتاح API مطلوب. أرسله عبر الترويسة x-api-key أو الباراميتر apiKey",
    });
  }

  const user = await prisma.user.findUnique({ where: { apiKey } });

  if (!user) {
    return res.status(403).json({
      success: false,
      message: "مفتاح API غير صالح",
    });
  }

  req.apiUser = { id: user.id, name: user.name, email: user.email };
  next();
}
