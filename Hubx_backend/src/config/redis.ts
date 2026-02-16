import Redis from "ioredis"

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000)
    return delay
  },
  maxRetriesPerRequest: null,
})

redis.on("connect", () => {
  console.log("Redis connected")
})

redis.on("error", (error) => {
  console.error("Redis error:", error)
})

export default redis
