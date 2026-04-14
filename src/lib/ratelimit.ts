import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Define strict rate limiting variables
// Configuration: Sliding Window allows a maximum of 5 transaction requests every 10 seconds.
// `Redis.fromEnv()` automatically extracts `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "10 s"),
  analytics: true, 
  prefix: "@upstash/ratelimit",
});
