import { createRequire } from "node:module";
import serverless from "serverless-http";

const require = createRequire(import.meta.url);
const { createApp } = require("../api-backend/bundle.cjs");

const app = createApp();

export default serverless(app);
