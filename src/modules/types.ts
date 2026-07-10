import { Request, Response } from "express";

/**
 * كل ملف داخل src/modules/<القسم>/ لازم يصدّر (export default) كائن
 * من هذا النوع. اسم القسم نفسه يُستنتج تلقائيًا من اسم المجلد،
 * ولا داعي لكتابته داخل الملف — هذا هو أساس نمط "انسخ ووسّع".
 *
 * المسار النهائي للوحدة = /api/modules/<اسم المجلد><path>
 */
export interface ModuleDefinition {
  /** اسم مختصر للوحدة، يظهر في صفحة التوثيق */
  name: string;
  /** وصف قصير لما تفعله الوحدة */
  description: string;
  /** طريقة HTTP */
  method: "get" | "post";
  /** المسار داخل القسم، يبدأ بـ / مثل "/base64/encode" */
  path: string;
  /** إن كانت true، لا تتطلب مفتاح API (افتراضيًا: false) */
  public?: boolean;
  /** منطق الوحدة */
  handler: (req: Request, res: Response) => void | Promise<void>;
}
