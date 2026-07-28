import { isValidRole } from "../../../shared/constants/roles.js";

export const onboardSuperAdminSchema = {
  email: { required: true },
  username: { required: true },
  password: { required: true, minLength: 6 },
};

export const registrationSchema = {
  username: { required: true },
  email: { required: true },
  password: { required: true, minLength: 6 },
  role: {
    required: false,
    custom: (value) => {
      if (!value) return null;
      return isValidRole(value) ? null : "invalid role.";
    },
  },
};

export const loginSchema = {
  username: { required: true },
  password: { required: true },
};
