import serverless from "serverless-http";
import { createApp } from "../api-backend/src/app.js";

const app = createApp();

export default serverless(app);
