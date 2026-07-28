import config from "../config/index.js";
import logger from "../config/logger.js";
import ResponseFormatter from "../utils/ResponseFormatter.js";
import jwt from "jsonwebtoken";

const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.cookies && req.cookies.authToken) {
      token = req.cookies.authToken;
    }

    console.log("Token:", token);

    if (!token) {
      return res
        .status(401)
        .json(
          ResponseFormatter.error("Authenticatioon token is required.", 401),
        );
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    const { userId, email, username, role, clientId } = decoded;

    req.user = { userId, email, username, role, clientId };

    next();
  } catch (error) {
    logger.error("authentication failed", {
      error: error.message,
      name: error.name,
      stack: error.stack,
      path: req.path,
    });

    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json(ResponseFormatter.error("Token expired", 401));
    }

    return res.status(401).json(ResponseFormatter.error("Invalid Token", 401));
  }
};

export default authenticate;
