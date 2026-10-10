import { describe, expect, it } from 'vitest';

import type { WrongNoteSummary } from '../lib/api/wrongnote';
import { filterBookmarkedWrongNotes } from '../lib/learning/wrong-note';

function createWrongNote(problemId: number): WrongNoteSummary {
  return {
    wrongNoteId: problemId,
    problemId,
    wrongSubmissionId: problemId * 10,
    title: `problem ${problemId}`,
    level: 'N3',
    category: 'VOCABULARY',
    subType: 'CONTEXT_VOCABULARY',
    wrongAnsweredDate: '2026-10-10',
    reviewedDate: null,
    reviewed: false,
    retryCorrect: false,
  };
}

describe('filterBookmarkedWrongNotes', () => {
  it('keeps only wrong answers that the user bookmarked', () => {
    const wrongNotes = [createWrongNote(1), createWrongNote(2), createWrongNote(3)];

    expect(filterBookmarkedWrongNotes(wrongNotes, [2, 3]).map((note) => note.problemId)).toEqual([
      2, 3,
    ]);
  });

  it('returns an empty list when no wrong answers are bookmarked', () => {
    expect(filterBookmarkedWrongNotes([createWrongNote(1)], [])).toEqual([]);
  });
});
