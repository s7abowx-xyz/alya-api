import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import apiRoutes from "./routes";
import { loadModules } from "./modules/loader";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import { env } from "./config/env";

const app = express();

app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// الواجهات الأمامية (HTML + Tailwind + JS عادي)
app.use(express.static(path.join(__dirname, "..", "public")));

// مسارات الـ API
app.use("/api", apiRoutes);

// نظام الأقسام (modules) القابل للتوسّع — كل قسم مجلد داخل src/modules
console.log("📦 جاري تحميل أقسام ALYA API...");
app.use("/api/modules", loadModules());

app.use("/api", notFoundHandler);
app.use(errorHandler);

export default app;
