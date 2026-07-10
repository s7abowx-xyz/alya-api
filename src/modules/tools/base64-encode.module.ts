import { ModuleDefinition } from "../types";
import { AppError } from "../../middleware/error.middleware";

const module: ModuleDefinition = {
  name: "ترميز Base64",
  description: "يحوّل نصًا عاديًا إلى Base64",
  method: "post",
  path: "/base64/encode",
  handler: (req, res) => {
    const { text } = req.body as { text?: string };
    if (!text) throw new AppError("الحقل text مطلوب", 422);

    const encoded = Buffer.from(text, "utf-8").toString("base64");
    res.json({ success: true, data: { input: text, encoded } });
  },
};

export default module;
