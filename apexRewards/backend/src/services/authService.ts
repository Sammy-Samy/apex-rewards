// ApexRewards — authentication service
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/userRepository';
import { AppError } from '../middleware/errorHandler';
import { JwtPayload, User } from '../types';

const JWT_SECRET = process.env.JWT_SECRET ?? 'apex-rewards-dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';

export const authService = {
  async register(
    email: string,
    password: string,
    role: User['role'] = 'customer'
  ): Promise<{ user: Omit<User, 'password_hash'>; token: string }> {
    const existing = await userRepository.findByEmail(email);
    if (existing) throw new AppError(409, 'Email already registered');

    const password_hash = await bcrypt.hash(password, 12);
    const user = await userRepository.create({ email, password_hash, role });

    const token = signToken(user);
    const { password_hash: _, ...safeUser } = user;
    return { user: safeUser, token };
  },

  async login(
    email: string,
    password: string
  ): Promise<{ user: Omit<User, 'password_hash'>; token: string }> {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new AppError(401, 'Invalid credentials');

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new AppError(401, 'Invalid credentials');

    const token = signToken(user);
    const { password_hash: _, ...safeUser } = user;
    return { user: safeUser, token };
  },

  async me(userId: string): Promise<Omit<User, 'password_hash'>> {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError(404, 'User not found');
    const { password_hash: _, ...safeUser } = user;
    return safeUser;
  },
};

function signToken(user: User): string {
  const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}
