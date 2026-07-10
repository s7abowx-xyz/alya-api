import { Router } from "express";
import rateLimit from "express-rate-limit";
import { login, logout, me, refresh, register } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "عدد محاولات كبير، الرجاء المحاولة بعد قليل",
  },
});

function wrap(fn: (req: any, res: any) => Promise<void>) {
  return (req: any, res: any, next: any) => fn(req, res).catch(next);
}

router.post("/register", authLimiter, wrap(register));
router.post("/login", authLimiter, wrap(login));
router.post("/refresh", wrap(refresh));
router.post("/logout", wrap(logout));
router.get("/me", requireAuth, wrap(me));

export default router;
