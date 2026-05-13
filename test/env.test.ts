import { describe, expect, it } from 'vitest';

import { isTruthyEnv } from '../lib/env';

describe('isTruthyEnv', () => {
  it('returns true for enabled values', () => {
    expect(isTruthyEnv('true')).toBe(true);
    expect(isTruthyEnv('YES')).toBe(true);
    expect(isTruthyEnv('1')).toBe(true);
    expect(isTruthyEnv('on')).toBe(true);
  });

  it('returns false for disabled or empty values', () => {
    expect(isTruthyEnv('false')).toBe(false);
    expect(isTruthyEnv('0')).toBe(false);
    expect(isTruthyEnv(undefined)).toBe(false);
    expect(isTruthyEnv('')).toBe(false);
  });
});
