import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt";
import { AppError } from "../middleware/error.middleware";
import { env } from "../config/env";

const registerSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(8, "كلمة المرور يجب ألا تقل عن 8 أحرف"),
});

const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

const REFRESH_COOKIE_NAME = "refreshToken";
const ACCESS_COOKIE_NAME = "accessToken";

const cookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: "lax" as const,
};

function refreshExpiryDate(): Date {
  const days = 7;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.errors[0].message, 422);
  }
  const { name, email, password } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError("هذا البريد الإلكتروني مسجل مسبقًا", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });

  const accessToken = signAccessToken({ userId: user.id, email: user.email });
  const refreshToken = signRefreshToken({ userId: user.id, email: user.email });

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt: refreshExpiryDate() },
  });

  res
    .cookie(ACCESS_COOKIE_NAME, accessToken, cookieOptions)
    .cookie(REFRESH_COOKIE_NAME, refreshToken, cookieOptions)
    .status(201)
    .json({
      success: true,
      message: "تم إنشاء الحساب بنجاح",
      data: {
        user: { id: user.id, name: user.name, email: user.email, apiKey: user.apiKey },
        accessToken,
      },
    });
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.errors[0].message, 422);
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError("البريد الإلكتروني أو كلمة المرور غير صحيحة", 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError("البريد الإلكتروني أو كلمة المرور غير صحيحة", 401);
  }

  const accessToken = signAccessToken({ userId: user.id, email: user.email });
  const refreshToken = signRefreshToken({ userId: user.id, email: user.email });

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt: refreshExpiryDate() },
  });

  res
    .cookie(ACCESS_COOKIE_NAME, accessToken, cookieOptions)
    .cookie(REFRESH_COOKIE_NAME, refreshToken, cookieOptions)
    .status(200)
    .json({
      success: true,
      message: "تم تسجيل الدخول بنجاح",
      data: {
        user: { id: user.id, name: user.name, email: user.email, apiKey: user.apiKey },
        accessToken,
      },
    });
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!token) {
    throw new AppError("لا يوجد رمز تجديد، الرجاء تسجيل الدخول", 401);
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError("جلسة التجديد غير صالحة، الرجاء تسجيل الدخول من جديد", 401);
  }

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new AppError("جلسة التجديد غير صالحة، الرجاء تسجيل الدخول من جديد", 401);
  }

  const accessToken = signAccessToken({ userId: payload.userId, email: payload.email });

  res.cookie(ACCESS_COOKIE_NAME, accessToken, cookieOptions).status(200).json({
    success: true,
    message: "تم تجديد الجلسة",
    data: { accessToken },
  });
}

export async function logout(req: Request, res: Response) {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (token) {
    await prisma.refreshToken.deleteMany({ where: { token } });
  }
  res
    .clearCookie(ACCESS_COOKIE_NAME)
    .clearCookie(REFRESH_COOKIE_NAME)
    .status(200)
    .json({ success: true, message: "تم تسجيل الخروج بنجاح" });
}

export async function me(req: Request, res: Response) {
  const userId = req.user!.userId;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, apiKey: true, isVerified: true, createdAt: true },
  });

  if (!user) {
    throw new AppError("المستخدم غير موجود", 404);
  }

  res.status(200).json({ success: true, data: { user } });
}
