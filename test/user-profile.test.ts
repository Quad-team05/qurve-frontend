import {
  getProfileCurrentLevel,
  hasCompletedLevelTest,
  type LevelProfile,
} from '../lib/user/profile-level';
import { describe, expect, it } from 'vitest';

function createProfile(overrides: Partial<LevelProfile> = {}): LevelProfile {
  return {
    learningLanguage: 'JAPANESE',
    currentLevel: null,
    ...overrides,
  };
}

describe('level test completion', () => {
  it('accepts the legacy currentLevel field', () => {
    const profile = createProfile({ currentLevel: 3 });

    expect(getProfileCurrentLevel(profile)).toBe(3);
    expect(hasCompletedLevelTest(profile)).toBe(true);
  });

  it('uses the level for the currently selected language', () => {
    const profile = createProfile({
      learningLanguage: 'ENGLISH',
      currentLevelEnglish: 4,
      currentLevelJapanese: 2,
    });

    expect(getProfileCurrentLevel(profile)).toBe(4);
    expect(hasCompletedLevelTest(profile)).toBe(true);
  });

  it('does not use a stale compatibility level from another language', () => {
    const profile = createProfile({
      learningLanguage: 'ENGLISH',
      currentLevel: 2,
      currentLevelEnglish: 4,
      currentLevelJapanese: 2,
    });

    expect(getProfileCurrentLevel(profile)).toBe(4);
  });

  it('requires the selected language level when language-specific fields exist', () => {
    const profile = createProfile({
      learningLanguage: 'ENGLISH',
      currentLevel: 2,
      currentLevelEnglish: null,
      currentLevelJapanese: 2,
    });

    expect(getProfileCurrentLevel(profile)).toBeNull();
    expect(hasCompletedLevelTest(profile)).toBe(false);
  });

  it('recognizes an assigned learning stage when the compatibility level is absent', () => {
    const profile = createProfile({ learningStage: 'JLPT_N3' });

    expect(hasCompletedLevelTest(profile)).toBe(true);
  });

  it('requires a test when no level or stage has been assigned', () => {
    expect(hasCompletedLevelTest(createProfile())).toBe(false);
  });
});
