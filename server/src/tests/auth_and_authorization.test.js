import { describe, it, expect } from 'vitest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

describe('Authentication & JWT Authorization', () => {
  it('should hash passwords and verify bcrypt match correctly', async () => {
    const rawPassword = 'BakeryPassword@2026';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(rawPassword, salt);

    const user = new User({
      name: 'Chef Test',
      email: 'chef@richcakeshop.com',
      phone: '+919820098200',
      passwordHash: hash,
      role: 'admin',
    });

    const isMatch = await user.comparePassword(rawPassword);
    expect(isMatch).toBe(true);

    const isWrongMatch = await user.comparePassword('WrongPassword123');
    expect(isWrongMatch).toBe(false);
  });

  it('should generate valid JWT tokens with correct user role payload', () => {
    const user = new User({
      name: 'Admin Test',
      email: 'admin@richcakeshop.com',
      phone: '+919820098200',
      role: 'admin',
    });

    const token = user.generateAuthToken();
    expect(token).toBeDefined();

    const secret = process.env.JWT_SECRET || 'super_secret_rich_cake_shop_jwt_token_key_change_in_production_2026';
    const decoded = jwt.verify(token, secret);

    expect(decoded.email).toBe(user.email);
    expect(decoded.role).toBe('admin');
  });
});
