import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();

app.listen(env.PORT, "0.0.0.0", () => {
  console.log(`TalentForge backend running on http://127.0.0.1:${env.PORT}`);
});
