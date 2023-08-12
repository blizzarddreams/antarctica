import PusherServer_ from "pusher";
import PusherClient_ from "pusher-js";

export const PusherServer = new PusherServer_({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export const PusherClient = new PusherClient_(process.env.PUSHER_KEY!, {
  cluster: process.env.PUSHER_CLUSTER!,
});
