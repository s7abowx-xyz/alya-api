import { ModuleDefinition } from "../types";
import { AppError } from "../../middleware/error.middleware";

const module: ModuleDefinition = {
  name: "تحويل حالة الأحرف",
  description: "يحوّل النص إلى أحرف كبيرة/صغيرة أو Title Case",
  method: "post",
  path: "/case",
  handler: (req, res) => {
    const { text, mode } = req.body as { text?: string; mode?: string };
    if (!text) throw new AppError("الحقل text مطلوب", 422);

    let result: string;
    switch (mode) {
      case "upper":
        result = text.toUpperCase();
        break;
      case "lower":
        result = text.toLowerCase();
        break;
      case "title":
        result = text
          .toLowerCase()
          .split(" ")
          .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
          .join(" ");
        break;
      default:
        throw new AppError("قيمة mode يجب أن تكون upper أو lower أو title", 422);
    }

    res.json({ success: true, data: { input: text, mode, result } });
  },
};

export default module;
