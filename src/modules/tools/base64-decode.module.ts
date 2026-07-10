import { ModuleDefinition } from "../types";
import { AppError } from "../../middleware/error.middleware";

const module: ModuleDefinition = {
  name: "فك ترميز Base64",
  description: "يحوّل نص Base64 إلى نصه الأصلي",
  method: "post",
  path: "/base64/decode",
  handler: (req, res) => {
    const { text } = req.body as { text?: string };
    if (!text) throw new AppError("الحقل text مطلوب", 422);

    let decoded: string;
    try {
      decoded = Buffer.from(text, "base64").toString("utf-8");
    } catch {
      throw new AppError("النص المُرسل ليس Base64 صالحًا", 422);
    }

    res.json({ success: true, data: { input: text, decoded } });
  },
};

export default module;
