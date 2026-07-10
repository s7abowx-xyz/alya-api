import { ModuleDefinition } from "../types";
import { AppError } from "../../middleware/error.middleware";

/**
 * يستخدم نقطة oEmbed الرسمية المتوفرة من تيك توك نفسه
 * (https://www.tiktok.com/oembed) للحصول على معلومات الفيديو
 * (العنوان، الناشر، الصورة المصغّرة، وكود embed رسمي).
 *
 * ملاحظة مهمة: هذه الوحدة لا ترجّع رابط تحميل مباشر للفيديو،
 * لأن تيك توك لا يوفّر هذا رسميًا، واستخراجه يتطلب طرقًا غير
 * رسمية (scraping) تخالف شروط استخدام المنصة. إن كان لديك
 * اشتراك في خدمة تحميل مرخّصة، يمكن دمجها هنا بنفس النمط.
 */
const module: ModuleDefinition = {
  name: "معلومات فيديو TikTok",
  description: "يجلب عنوان ومعلومات وصورة مصغّرة لفيديو TikTok عبر oEmbed الرسمي",
  method: "get",
  path: "/tiktok",
  handler: async (req, res) => {
    const { url } = req.query as { url?: string };
    if (!url) throw new AppError("الباراميتر url مطلوب، مثال: ?url=https://www.tiktok.com/@user/video/123", 422);

    let tiktokUrl: URL;
    try {
      tiktokUrl = new URL(url);
    } catch {
      throw new AppError("الرابط المُرسل غير صالح", 422);
    }
    if (!tiktokUrl.hostname.includes("tiktok.com")) {
      throw new AppError("الرابط يجب أن يكون من نطاق tiktok.com", 422);
    }

    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(tiktokUrl.toString())}`;

    let response: Response;
    try {
      response = await fetch(oembedUrl);
    } catch {
      throw new AppError("تعذّر الاتصال بخدمة tiktok.com/oembed", 502);
    }

    if (!response.ok) {
      throw new AppError("لم يتم العثور على الفيديو أو الرابط غير صالح", 404);
    }

    const data = (await response.json()) as {
      title?: string;
      author_name?: string;
      author_url?: string;
      thumbnail_url?: string;
      html?: string;
    };

    res.json({
      success: true,
      data: {
        title: data.title ?? null,
        authorName: data.author_name ?? null,
        authorUrl: data.author_url ?? null,
        thumbnailUrl: data.thumbnail_url ?? null,
        embedHtml: data.html ?? null,
        note: "هذه بيانات رسمية عبر tiktok.com/oembed ولا تتضمن رابط تحميل مباشر للفيديو",
      },
    });
  },
};

export default module;
