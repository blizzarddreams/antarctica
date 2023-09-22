import { createClient } from "redis";

const redis = createClient({
  url: process.env.KV_URL,
});

(async () => {
  await redis.connect();
})();

export default redis;
