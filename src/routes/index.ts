import { Router } from "express";
import authRoutes from "./auth.routes";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ success: true, message: "ALYA API تعمل بشكل طبيعي", timestamp: new Date() });
});

router.use("/auth", authRoutes);

export default router;
