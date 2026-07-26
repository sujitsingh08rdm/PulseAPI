import config from "./index.js";
import logger from "./logger.js";
import mongoose from "mongoose";

/*
 * moggo DB
 */

class mongoConnection {
  constructor() {
    this.connection = null;
  }

  /*
  *connect to mongoDB
  @return promise {Promise<mongoose.Connection>}
  */

  async connect() {
    try {
      if (this.connection) {
        logger.info("MongoDB already connected");
        return this.connection;
      }
      await mongoose.connect(config.mongo.uri, {
        dbName: config.mongo.dbName,
      });

      this.connection = mongoose.connection;

      logger.info(`MongoDB connected : ${config.mongo.uri}`);

      this.connection.on("error", (err) => {
        logger.error("MongoDB connection error, ", err);
      });

      this.connection.on("disconnected", () => {
        logger.error("MongoDB disconnected");
      });

      return this.connection;
    } catch (error) {
      logger.error("MongoDB Connection failed :", error);
      throw error;
    }
  }

  /*
   *Help to disconnect the active mongodb connection
   */

  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.disconnect();
        this.connection = null;
        logger.info("Mongo DB Disconnected");
      }
    } catch (error) {
      logger.error("MongoDB Connection failed :", error);
      throw error;
    }
  }
  /*
   * Get the active connection
   * @returns {mongoose.Connection}
   */

  getConnection() {
    return this.connection;
  }
}

export default new mongoConnection();
