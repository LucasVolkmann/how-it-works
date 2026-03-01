import { describe, expect, it } from 'vitest';
import { comparePassword, hashPassword } from './password.utils.js';

describe('password unit', () => {
  describe('hashPassword unit', () => {
    it('should not output the same string in input', async () => {
      const inputPasswordString = 'mock-input-pass';

      const outputPasswordHash = await hashPassword(inputPasswordString);

      expect(outputPasswordHash).not.toBe(inputPasswordString);
    });
  });
  describe('comparePassword unit', () => {
    it('should return false when the passwords is not equals', async () => {
      const inputPasswordString = 'mock-input-pass';

      const outputPasswordHash = await hashPassword(inputPasswordString);

      const result = await comparePassword(
        inputPasswordString + 'wrong',
        outputPasswordHash,
      );

      expect(result).toBe(false);
    });
    it('should return true when the passwords is equals', async () => {
      const inputPasswordString = 'mock-input-pass';

      const outputPasswordHash = await hashPassword(inputPasswordString);

      const result = await comparePassword(inputPasswordString, outputPasswordHash);

      expect(result).toBe(true);
    });
  });
});
