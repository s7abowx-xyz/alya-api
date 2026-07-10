import { ModuleDefinition } from "../types";
import { AppError } from "../../middleware/error.middleware";

const module: ModuleDefinition = {
  name: "إحصائيات النص",
  description: "يحسب عدد الكلمات والأحرف في نص معيّن",
  method: "post",
  path: "/wordcount",
  handler: (req, res) => {
    const { text } = req.body as { text?: string };
    if (!text) throw new AppError("الحقل text مطلوب", 422);

    const words = text.trim().length ? text.trim().split(/\s+/).length : 0;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;

    res.json({
      success: true,
      data: { words, characters, charactersNoSpaces },
    });
  },
};

export default module;
