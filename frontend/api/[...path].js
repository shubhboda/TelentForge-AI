import serverless from "serverless-http";
import { createApp } from "../api-backend/bundle.mjs";

const app = createApp();

export default serverless(app);
