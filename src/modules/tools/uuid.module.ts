import crypto from "crypto";
import { ModuleDefinition } from "../types";

const module: ModuleDefinition = {
  name: "توليد UUID",
  description: "يولّد معرّف فريد (UUID v4)",
  method: "get",
  path: "/uuid",
  handler: (req, res) => {
    res.json({ success: true, data: { uuid: crypto.randomUUID() } });
  },
};

export default module;
