import { describe, it, expect, vi } from 'vitest';

vi.mock('../../config/env.config.js', () => ({
  env: {
    jwt: {
      secret: 'integration-test-secret',
      expiresIn: '1s',
    },
  },
}));

import { signToken, verifyToken } from './jwt.utils.js';

describe('JWT Service (integration test)', () => {
  it('should generate a valid token and verify correctly', () => {
    const payload = { userId: 'abc-123' };

    const token = signToken(payload);
    const decoded = verifyToken(token);

    expect(decoded.userId).toBe(payload.userId);
    expect(decoded).toHaveProperty('iat');
    expect(decoded).toHaveProperty('exp');
  });

  it('should throw error when token is invalid', () => {
    expect(() => verifyToken('token-invalido')).toThrow(/jwt malformed/i);
  });

  it('should throw error when token is expired', async () => {
    vi.useFakeTimers();

    const token = signToken({ userId: 'expire-test' });

    vi.advanceTimersByTime(1100);

    expect(() => verifyToken(token)).toThrow(/expired/i);
    vi.useRealTimers();
  });
});
