import { apiFetch } from '@/lib/api/client';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  code: string;
};

export type TodayLearning = {
  level: string;
  learningLanguage: 'JAPANESE' | 'ENGLISH';
  language: 'JA' | 'EN';
  cefrLevel: string | null;
  qurveLevel: string | null;
  categoryCode: string;
  subTypeCode: string;
  offset: number;
  category: string;
  title: string;
  totalQuestionCount: number;
  estimatedMinutes: number;
};

export type LearningMain = {
  wrongNoteCount: number;
};

export type DailyStudyTime = {
  dayOfWeek: string;
  dayLabel: string;
  studyTimeMinutes: number;
};

export type StudyTimeStatistics = {
  weekStartDate: string;
  weekEndDate: string;
  todayStudyTimeMinutes: number;
  weeklyStudyTimeMinutes: number;
  dailyStudyTimes: DailyStudyTime[];
};

export type MonthlyStudyTime = {
  yearMonth: string;
  studyTimeMinutes: number;
};

export type MonthlyStudyTimeStatistics = {
  startYearMonth: string;
  endYearMonth: string;
  monthlyStudyTimes: MonthlyStudyTime[];
};

export type StudyTimeSaveResult = {
  addedStudyTimeMinutes: number;
  totalStudyTimeMinutes: number;
};

export async function getTodayLearning(date?: string) {
  const query = date ? `?date=${date}` : '';
  const response = await apiFetch<ApiResponse<TodayLearning>>(`/learnings/today${query}`, {
    method: 'GET',
  });
  if (response.data.language !== 'EN') return response.data;

  return {
    ...response.data,
    totalQuestionCount: Math.max(20, response.data.totalQuestionCount),
    estimatedMinutes: Math.max(10, response.data.estimatedMinutes),
  };
}

export async function getLearningMain() {
  const response = await apiFetch<ApiResponse<LearningMain>>('/learnings/main', {
    method: 'GET',
  });
  return response.data;
}

export async function getStudyTimeStatistics() {
  const response = await apiFetch<ApiResponse<StudyTimeStatistics>>(
    '/learnings/study-time/statistics',
    { method: 'GET' },
  );
  return response.data;
}

export async function getMonthlyStudyTimeStatistics(yearMonth?: string) {
  const query = yearMonth ? `?yearMonth=${encodeURIComponent(yearMonth)}` : '';
  const response = await apiFetch<ApiResponse<MonthlyStudyTimeStatistics>>(
    `/learnings/study-time/statistics/monthly${query}`,
    { method: 'GET' },
  );
  return response.data;
}

export async function saveLearningStudyTime(studyTimeMinutes: number) {
  const response = await apiFetch<ApiResponse<StudyTimeSaveResult>>('/learnings/study-time', {
    method: 'POST',
    body: JSON.stringify({ studyTimeMinutes }),
  });
  return response.data;
}
