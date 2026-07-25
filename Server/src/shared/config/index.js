import dotenv from "dotenv";

dotenv.config();

const config = {
  //server:
  node_env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "5000", 10),

  //mongoDB
  mongo: {
    uri: process.env.MONGO_URI || "mongodb://localhost:27018/api_monitoring",
    dbName: process.env.MONGO_DB_NAME || "api_monitoring",
  },

  //postgres
  postgres: {
    host: process.env.PG_HOST || "localhost",
    port: parseInt(process.env.PG_PORT || "5432", 10),
    database: process.env.PG_DATABASE || "api_monitoring",
    user: process.env.PG_USER || "postgres",
    password: process.env.PG_PASSWORD || 12345,
  },

  //rabbit mq
  rabbitmq: {
    url: process.env.RABBIT_URL || "ampq://localhost:5672",
    queue: process.env.RABBIT_QUEUE || "api_hits",
    publisherComfirms:
      process.env.RABBITMQ_PUBLISHER_CONFIRMS === "true" || false,
    retryAttempts: parseInt(process.env.RABBITMQ_RETRY_ATTEMPT || "3", 10),
    retryDelay: parseInt(process.env.RABBITMQ_RETRY_DELAY || "1000", 10),
  },

  jwt: {
    secret: process.env.JWT_SECRET || "Good_job_Sujit",
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "90000", 10), // 15 minutes
    maxRequest: parseInt(process.env.RATE_LIMIT_MAX_REQUEST || "1000", 10), //1000 req/15mins per IP
  },
};

export default config;
