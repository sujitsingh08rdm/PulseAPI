import BaseRespository from "./BaseRepository.js";
import User from "../../../shared/models/user.js";
import logger from "../../../shared/config/logger.js";

class MongoUserRepository extends BaseRespository {
  constructor() {
    //what super does is to take the value pass to it and passed it to Base repository's constructor param
    super(User);
  }

  async create(userData) {
    try {
      let data = { ...userData };
      if (userData.role === "super_admin" && !userData.permissions) {
        data.permissions = {
          canCreateApiKeys: true,
          canManageUsers: true,
          canViewAnalytics: true,
          canExportData: true,
        };
      }

      //this is same as writting const user = new User(data);
      const user = new this.model(data);
      await user.save();

      logger.info("User created : ", { username: user.username });
      return user;
    } catch (error) {
      logger.error("error creating user", error);
      throw error;
    }
  }

  async findById(userId) {
    try {
      const user = await this.model.findById(userId);
      return user;
    } catch (error) {
      logger.error("Error finding user by id", error);
      throw error;
    }
  }

  async findByUsername(username) {
    try {
      const user = await this.model.findOne({ username });
      return user;
    } catch (error) {
      logger.error("Error finding user by username", error);
      throw error;
    }
  }

  async findByEmail(email) {
    try {
      const user = await this.model.findOne({ email });
      return user;
    } catch (error) {
      logger.error("Error finding user by email", error);
      throw error;
    }
  }

  async findAll() {
    try {
      const user = await this.model
        .find({ isActive: true })
        .select("-password");
      return user;
    } catch (error) {
      logger.error("Error finding all users", error);
      throw error;
    }
  }
}

export default MongoUserRepository;
