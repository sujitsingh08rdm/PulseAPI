import { AuthController } from "../controller/authController.js";
import { AuthService } from "../service/authService.js";
import MongoUserRepository from "../repository/UserRepository.js";

class Container {
  //with static . We can call the method directly using the class name (like ClassName.methodName()) instead of an object.
  static init() {
    const repositories = {
      userRepository: new MongoUserRepository(),
    };

    const services = {
      AuthService: new AuthService(repositories.userRepository),
    };

    const controller = {
      authController: new AuthController(services.AuthService),
    };

    return { repositories, services, controller };
  }
}

const initialized = Container.init();
export { Container };
export default initialized;
