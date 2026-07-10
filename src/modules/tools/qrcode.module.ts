import QRCode from "qrcode";
import { ModuleDefinition } from "../types";
import { AppError } from "../../middleware/error.middleware";

const module: ModuleDefinition = {
  name: "توليد QR Code",
  description: "يحوّل نصًا أو رابطًا إلى صورة QR (Data URL بصيغة PNG)",
  method: "post",
  path: "/qrcode",
  handler: async (req, res) => {
    const { text } = req.body as { text?: string };
    if (!text) throw new AppError("الحقل text مطلوب", 422);

    const dataUrl = await QRCode.toDataURL(text, { margin: 1, width: 320 });
    res.json({ success: true, data: { input: text, qrCode: dataUrl } });
  },
};

export default module;
