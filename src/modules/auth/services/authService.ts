import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { authRepository } from '../repositories/authRepository';

export const authService = {
  async register(fullName: string, email: string, password: string) {
    const existing = await authRepository.findByEmail(email);

    if (existing)
      throw new Error('Email already used');

    const passwordHash = await bcrypt.hash(password, 10);

    return authRepository.createUser({ fullName, email, passwordHash });
  },

  async login(email: string, password: string) {
    const user = await authRepository.findByEmail(email);

    if (user === null)
      throw new Error("Invalid credentials");

    const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordMatch)
      throw new Error('Invalid credentials');

    if (process.env.JWT_SECRET === undefined)
      throw new Error("Invalid JWT_SECRET, please set it up in the configuration");

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({ userId: user.id, role: user.role, email: user.email, fullName: user.fullName })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1d')
      .sign(secret);

    return { user, token };
  }
};
