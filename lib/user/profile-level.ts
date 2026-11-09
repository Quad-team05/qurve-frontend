export type LevelProfile = {
  learningLanguage?: 'JAPANESE' | 'ENGLISH';
  currentLevel: number | null;
  currentLevelJapanese?: number | null;
  currentLevelEnglish?: number | null;
  learningStage?: string | null;
};

function isAssignedLevel(level: number | null | undefined): level is number {
  return typeof level === 'number' && Number.isFinite(level) && level > 0;
}

export function getProfileCurrentLevel(profile: LevelProfile): number | null {
  const languageLevel =
    profile.learningLanguage === 'ENGLISH'
      ? profile.currentLevelEnglish
      : profile.currentLevelJapanese;

  if (isAssignedLevel(languageLevel)) return languageLevel;

  const hasLanguageSpecificLevel =
    profile.currentLevelEnglish !== undefined || profile.currentLevelJapanese !== undefined;

  if (hasLanguageSpecificLevel) return null;

  return isAssignedLevel(profile.currentLevel) ? profile.currentLevel : null;
}

export function hasCompletedLevelTest(profile: LevelProfile): boolean {
  return getProfileCurrentLevel(profile) !== null || Boolean(profile.learningStage);
}
