// ApexRewards — user repository
import { db } from '../config/database';
import { User } from '../types';

export const userRepository = {
  async findById(id: string): Promise<User | null> {
    const { rows } = await db.query<User>('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0] ?? null;
  },

  async findByEmail(email: string): Promise<User | null> {
    const { rows } = await db.query<User>('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0] ?? null;
  },

  async create(data: Pick<User, 'email' | 'password_hash' | 'role'>): Promise<User> {
    const { rows } = await db.query<User>(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [data.email, data.password_hash, data.role]
    );
    return rows[0];
  },

  async updateStellarKey(id: string, publicKey: string): Promise<void> {
    await db.query('UPDATE users SET stellar_public_key = $1, updated_at = NOW() WHERE id = $2', [
      publicKey,
      id,
    ]);
  },
};
