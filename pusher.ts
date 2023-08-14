import PusherServer_ from "pusher";
import PusherClient_ from "pusher-js";

export const PusherServer = new PusherServer_({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});
console.log(process.env.PUSHER_KEY!);
export const PusherClient = new PusherClient_("7639df23b5053dbd1389", {
  cluster: "us2",
});
