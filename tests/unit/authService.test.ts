import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '@/modules/auth/services/authService';
import { authRepository } from '@/modules/auth/repositories/authRepository';
import bcrypt from 'bcryptjs';
import { jwtVerify } from 'jose';

vi.mock('@/modules/auth/repositories/authRepository', () => ({
  authRepository: {
    findByEmail: vi.fn(),
    createUser: vi.fn(),
  }
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  }
}));

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('register', () => {
    it('throws if email already exists', async () => {
      vi.mocked(authRepository.findByEmail).mockResolvedValue({ id: '1' } as any);
      
      await expect(authService.register('John Doe', 'john@test.com', 'password123'))
        .rejects.toThrow('Email already used');
    });

    it('creates a user with hashed password', async () => {
      vi.mocked(authRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed_password' as any);
      vi.mocked(authRepository.createUser).mockResolvedValue({ id: '1', email: 'john@test.com' } as any);

      const user = await authService.register('John Doe', 'john@test.com', 'password123');

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(authRepository.createUser).toHaveBeenCalledWith({
        fullName: 'John Doe',
        email: 'john@test.com',
        passwordHash: 'hashed_password'
      });
      expect(user.id).toBe('1');
    });
  });

  describe('login', () => {
    it('throws on invalid email', async () => {
      vi.mocked(authRepository.findByEmail).mockResolvedValue(null);
      await expect(authService.login('wrong@test.com', 'pwd')).rejects.toThrow('Invalid credentials');
    });

    it('throws on invalid password', async () => {
      vi.mocked(authRepository.findByEmail).mockResolvedValue({ passwordHash: 'hash' } as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as any);
      await expect(authService.login('john@test.com', 'wrong')).rejects.toThrow('Invalid credentials');
    });

    it('returns token and user on success', async () => {
      vi.mocked(authRepository.findByEmail).mockResolvedValue({ 
        id: '1', email: 'john@test.com', role: 'USER', fullName: 'John Doe', passwordHash: 'hash' 
      } as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as any);

      const { user, token } = await authService.login('john@test.com', 'correct');

      expect(user.id).toBe('1');
      
      // Verify token
      const secret = new TextEncoder().encode('test-secret');
      const { payload } = await jwtVerify(token, secret);
      expect(payload.userId).toBe('1');
      expect(payload.role).toBe('USER');
    });
  });
});
