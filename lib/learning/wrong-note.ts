import type { WrongNoteSummary } from '../api/wrongnote';

export function filterBookmarkedWrongNotes(
  wrongNotes: WrongNoteSummary[],
  bookmarkedProblemIds: Iterable<number>,
) {
  const bookmarkIds = new Set(bookmarkedProblemIds);
  return wrongNotes.filter((wrongNote) => bookmarkIds.has(wrongNote.problemId));
}
