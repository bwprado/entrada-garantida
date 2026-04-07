import { defineApp } from "convex/server";
import r2 from "@convex-dev/r2/convex.config.js";
import twilio from "@convex-dev/twilio/convex.config.js";

const app = defineApp();

app.use(r2);
app.use(twilio);

export default app;
