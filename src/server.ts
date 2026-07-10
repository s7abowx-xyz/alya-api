import app from "./app";
import { env } from "./config/env";

app.listen(env.port, () => {
  console.log(`🚀 ALYA API يعمل الآن على المنفذ ${env.port} (${env.nodeEnv})`);
});
