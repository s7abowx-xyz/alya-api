import { ModuleDefinition } from "../types";
import { AppError } from "../../middleware/error.middleware";

const module: ModuleDefinition = {
  name: "عكس النص",
  description: "يعكس ترتيب أحرف النص المُرسل",
  method: "post",
  path: "/reverse",
  handler: (req, res) => {
    const { text } = req.body as { text?: string };
    if (!text) throw new AppError("الحقل text مطلوب", 422);

    const result = [...text].reverse().join("");
    res.json({ success: true, data: { input: text, result } });
  },
};

export default module;
