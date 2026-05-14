import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import {
  authRepository,
  AuthEmailInUseError,
} from "../repositories/authRepository";
import { ServiceError } from "@/shared/errors";

export class AuthServiceError extends ServiceError {}
export class EmailInUseError extends AuthServiceError {
  constructor(options?: { cause?: unknown }) {
    super("Email already used", options);
  }
}
export class InvalidCredentialsError extends AuthServiceError {
  constructor() {
    super("Invalid credentials");
  }
}

export const authService = {
  /**
   * Creates a new user in the database.
   * @throws EmailInUseError if the email is already registered.
   */
  async register(fullName: string, email: string, password: string) {
    const existing = await authRepository.findByEmail(email);
    if (existing) throw new EmailInUseError();

    const passwordHash = await bcrypt.hash(password, 10);

    try {
      return await authRepository.createUser({ fullName, email, passwordHash });
    } catch (err) {
      if (err instanceof AuthEmailInUseError) {
        throw new EmailInUseError({ cause: err });
      }
      throw err;
    }
  },

  /**
   * Logs in a user and returns the user plus a signed JWT.
   * @throws InvalidCredentialsError if the email or password is incorrect.
   */
  async login(email: string, password: string) {
    const user = await authRepository.findByEmail(email);
    if (user === null) throw new InvalidCredentialsError();

    const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordMatch) throw new InvalidCredentialsError();

    if (process.env.JWT_SECRET === undefined)
      throw new Error(
        "Invalid JWT_SECRET, please set it up in the configuration",
      );

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({
      userId: user.id,
      role: user.role,
      email: user.email,
      fullName: user.fullName,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1d")
      .sign(secret);

    return { user, token };
  },
};
