import fs from "fs";
import path from "path";
import { Router, NextFunction, Request, Response } from "express";
import { requireApiKey } from "../middleware/apiKey.middleware";
import { ModuleDefinition } from "./types";

export interface RegistryEntry {
  category: string;
  name: string;
  description: string;
  method: string;
  path: string;
  public: boolean;
}

/** سجلّ بكل الوحدات المُحمَّلة، تستخدمه صفحة التوثيق /api/modules */
export const moduleRegistry: RegistryEntry[] = [];

function asyncWrap(handler: ModuleDefinition["handler"]) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res)).catch(next);
  };
}

/**
 * يفحص src/modules/<قسم>/*.module.(ts|js) ويسجّل كل وحدة صالحة
 * كمسار Express تلقائيًا، بدون أي تعديل يدوي على الراوتر الرئيسي.
 * لإضافة قسم جديد: أنشئ مجلد باسم القسم، وضع بداخله ملفات *.module.ts.
 */
export function loadModules(): Router {
  const router = Router();
  const modulesDir = __dirname;
  const runtimeExt = path.extname(__filename); // .ts في وضع التطوير، .js بعد البناء

  moduleRegistry.length = 0;

  const entries = fs.existsSync(modulesDir)
    ? fs.readdirSync(modulesDir, { withFileTypes: true })
    : [];

  const categoryDirs = entries.filter((entry) => entry.isDirectory());

  for (const categoryDir of categoryDirs) {
    const category = categoryDir.name;
    const categoryPath = path.join(modulesDir, category);

    const moduleFiles = fs
      .readdirSync(categoryPath)
      .filter((file) => file.endsWith(`.module${runtimeExt}`));

    for (const file of moduleFiles) {
      const fullPath = path.join(categoryPath, file);
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const imported = require(fullPath);
      const definition: ModuleDefinition | undefined = imported.default;

      if (!definition || !definition.path || !definition.handler || !definition.method) {
        console.warn(`⚠️  تم تجاهل وحدة غير صالحة: ${category}/${file}`);
        continue;
      }

      const mountPath = `/${category}${definition.path}`;
      const middlewares = definition.public ? [] : [requireApiKey];

      router[definition.method](mountPath, ...middlewares, asyncWrap(definition.handler));

      moduleRegistry.push({
        category,
        name: definition.name,
        description: definition.description,
        method: definition.method.toUpperCase(),
        path: `/api/modules${mountPath}`,
        public: !!definition.public,
      });

      console.log(`  ↳ وحدة مسجَّلة: [${category}] ${definition.method.toUpperCase()} ${mountPath}`);
    }
  }

  // نقطة توثيق تلقائية: تسرد كل الأقسام والوحدات المسجَّلة
  router.get("/", (req, res) => {
    const grouped = moduleRegistry.reduce<Record<string, RegistryEntry[]>>((acc, entry) => {
      acc[entry.category] = acc[entry.category] || [];
      acc[entry.category].push(entry);
      return acc;
    }, {});

    res.json({
      success: true,
      message: "قائمة الأقسام والوحدات المتاحة في ALYA API",
      data: grouped,
    });
  });

  return router;
}
