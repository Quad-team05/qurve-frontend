import { apiFetch } from '@/lib/api/client';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  code: string;
};

export type TodayLearning = {
  level: string;
  categoryCode: string;
  subTypeCode: string;
  offset: number;
  category: string;
  title: string;
  totalQuestionCount: number;
  estimatedMinutes: number;
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

export type StudyTimeSaveResult = {
  addedStudyTimeMinutes: number;
  totalStudyTimeMinutes: number;
};

export async function getTodayLearning(date?: string) {
  const query = date ? `?date=${date}` : '';
  const response = await apiFetch<ApiResponse<TodayLearning>>(`/learnings/today${query}`, {
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

export async function saveLearningStudyTime(studyTimeMinutes: number) {
  const response = await apiFetch<ApiResponse<StudyTimeSaveResult>>('/learnings/study-time', {
    method: 'POST',
    body: JSON.stringify({ studyTimeMinutes }),
  });
  return response.data;
}
