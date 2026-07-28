import config from "../../../shared/config/index.js";
import ApiError from "../../../shared/utils/ApiError.js";
import jwt from "jsonwebtoken";
import logger from "../../../shared/config/logger.js";
import AppError from "../../../shared/utils/ApiError.js";
import bcrypt from "bcryptjs";

export class AuthService {
  constructor(userRespository) {
    if (!userRespository) {
      throw new Error("UserRespository is required");
    }
    this.userRespository = userRespository;
  }

  generateToken(user) {
    const { _id, email, username, role, clientId } = user;

    const payload = {
      userId: _id,
      username,
      role,
      clientId,
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  formatUserForResponse(user) {
    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.password;
    return userObj;
  }

  async comparePassword(userEnteredPassword, hashedPassword) {
    return await bcrypt.compare(userEnteredPassword, hashedPassword);
  }

  async onboardSuperAdmin(superAdminData) {
    try {
      const existingUser = await this.userRespository.findAll();
      if (existingUser && existingUser.length > 0) {
        throw new ApiError("Super admin oboarding is disabled", 403);
      }

      const user = await this.userRespository.create(superAdminData);
      const token = this.generateToken(user);

      logger.info("Admin onboarded succesfully", {
        username: user.username,
      });

      return { user: this.formatUserForResponse(user), token };
    } catch (error) {
      console.log(error);
      logger.error("Error in onboarding superadmin", error);
      throw error;
    }
  }

  async register(userData) {
    try {
      const existingUser = await this.userRespository.findByUsername(
        userData.username,
      );

      if (existingUser) {
        throw new AppError("Username already exist", 409);
      }

      const existingEmail = await this.userRespository.findByEmail(
        userData.email,
      );

      if (existingEmail) {
        throw new AppError("email already exist", 409);
      }

      const user = await this.userRespository.create(userData);
      console.log("Hitt", user);

      const token = this.generateToken(user);

      logger.info("user onboarded succesfully", {
        username: user.username,
      });

      return { user: this.formatUserForResponse(user), token };
    } catch (error) {
      logger.error("Error in register service", error);
      throw error;
    }
  }

  async login(username, password) {
    try {
      const user = await this.userRespository.findByUsername(username);
      if (!user) {
        throw new ApiError("Invalid credentials", 401);
      }

      if (!user.isActive) {
        throw new ApiError("Account is deactivated", 401);
      }

      const isPasswordValid = await this.comparePassword(
        password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new ApiError("invalid credentials", 401);
      }

      logger.info("User logged in sucessfully", { username: user.username });
      const token = this.generateToken(user);

      return { user: this.formatUserForResponse(user), token };
    } catch (error) {
      logger.error("Error in log service", error);
      throw error;
    }
  }

  async getProfile(userId) {
    try {
      const user = await this.userRespository.findById(userId);

      if (!user) {
        throw new ApiError("User not found", 404);
      }

      return this.formatUserForResponse(user);
    } catch (error) {
      logger.error("Error in log service", error);
      throw error;
    }
  }
}
