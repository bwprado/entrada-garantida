import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { getTwilioClient } from "./twilio";

const http = httpRouter();

auth.addHttpRoutes(http);

const twilio = getTwilioClient();
if (twilio) {
  twilio.registerRoutes(http);
}

export default http;
