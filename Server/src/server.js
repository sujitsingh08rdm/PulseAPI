import express from "express";
import cors from "cors";
import helmet from "helmet";
import ResponseFormatter from "../src/shared/utils/ResponseFormatter.js";
import logger from "../src/shared/config/logger.js";
import mongodb from "./shared/config/mongodb.js";
import postgres from "./shared/config/postgres.js";
import errorHandler from "./shared/middleware/errorHandler.js";
import rabbitmq from "./shared/config/rabbitmq.js";
import config from "./shared/config/index.js";

/**
 *
 * initialize express app
 */
const app = express();
/**
 * act as a middleware enable lot of security, cross site scripting xss.
 */

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  (logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  }),
    next());
});

app.get("/health", (req, res) => {
  res.status(200).json(
    ResponseFormatter.success(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
      "Service is healthy",
    ),
  );
});

app.get("/", (req, res) => {
  res.status(200).json(
    ResponseFormatter.success(
      {
        service: "API HIT monitoring services",
        version: "1.0.0",
        endpoints: {
          health: "/health",
          auth: "/api/auth",
          ingest: "/api/hit",
          analytics: "/api/analytics",
        },
      },
      "API HIT Monitoring Services",
    ),
  );
});

/**
 * 404 handler
 */

app.use((req, res) => {
  res.status(404).json(ResponseFormatter.error("Endpoint not found", 404));
});

app.use(errorHandler);

async function initializeConnection() {
  try {
    logger.info("initializing database connections...");

    //connect mongoDB
    logger.info("Connecting MongoDB...");
    await mongodb.connect();
    logger.info("MongoDB connected");

    // postgres connect
    logger.info("Connecting PostgreSQL...");

    await postgres.testConnection();
    logger.info("Connected PostgreSQL...");

    // connect to rabbitMQ
    logger.info("Connecting RabbitMQ...");

    await rabbitmq.connect();
    logger.info("RabbitMQ connected");

    logger.info("all database connections established...");
  } catch (error) {
    logger.error("connection inialization failed ho ho...", error);
    throw error;
  }
}

async function startServer() {
  try {
    await initializeConnection();

    const server = app.listen(config.port, () => {
      logger.info(`Server started on port : ${config.port}`);
      logger.info(`ENV : ${config.port}`);
      logger.info(`API avaibale at http://localhost:${config.port}`);
    });

    const gracefullShutdown = async (signal) => {
      logger.info(`${signal} received, shutting down gracefully...`);

      logger.close(async () => {
        logger.info("HTTP Server close");

        try {
          await mongodb.disconnect();
          await postgres.close();
          await rabbitmq.close();

          logger.info("All connections closed, existing process");
        } catch (error) {
          logger.error("Error during shutdown", error);
          process.exit(1);
        }
      });

      setTimeout(() => {
        logger.error("foced shutdown");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => gracefullShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefullShutdown("SIGINT"));

    process.on("uncaughtException", (error) => {
      logger.error("uncaughtException");
      gracefullShutdown("uncaughtException");
    });

    process.on("unhandledRejection", (reason, promise) => {
      logger.error("unhandled rejection at:", promise, "reason: ", reason);
      gracefullShutdown("unhandledRejection");
    });
  } catch (error) {
    logger.error("failed to start server", error);
    process.exit(1);
  }
}

startServer();

// app.use(errorHandler);
