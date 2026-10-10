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
  if (isAssignedLevel(profile.currentLevel)) return profile.currentLevel;

  const languageLevel =
    profile.learningLanguage === 'ENGLISH'
      ? profile.currentLevelEnglish
      : profile.currentLevelJapanese;

  return isAssignedLevel(languageLevel) ? languageLevel : null;
}

export function hasCompletedLevelTest(profile: LevelProfile): boolean {
  return getProfileCurrentLevel(profile) !== null || Boolean(profile.learningStage);
}
