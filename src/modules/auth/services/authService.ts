import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { authRepository } from "../repositories/authRepository";
import { ServiceError } from "@/shared/errors";

export class AuthServiceError extends ServiceError {}

export const authService = {

  /*
    Creates a new user in the database
    @param fullName - The full name of the user
    @param email - The email address of the user
    @param password - The password of the user
    @returns The created user
    @throws Error if the email already exists
  */
  async register(fullName: string, email: string, password: string) {
    const existing = await authRepository.findByEmail(email);

    if (existing)
      throw new AuthServiceError("Email already used");

    const passwordHash = await bcrypt.hash(password, 10);

    try {
      return await authRepository.createUser({ fullName, email, passwordHash });
    } catch (err) {
      if (err instanceof Error && err.message === "Email already used") {
        throw new AuthServiceError("Email already used");
      }
      throw err;
    }
  },

  /*
    Logs in a user
    @param email - The email address of the user
    @param password - The password of the user
    @returns The created user and token
    @throws Error if the email or password is incorrect
  */
  async login(email: string, password: string) {
    const user = await authRepository.findByEmail(email);

    if (user === null)
      throw new AuthServiceError("Invalid credentials");

    const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordMatch) throw new AuthServiceError("Invalid credentials");

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
