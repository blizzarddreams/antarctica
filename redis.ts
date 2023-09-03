import { createClient } from "redis";

const redis = createClient();

(async () => {
  await redis.connect();
})();

export default redis;
