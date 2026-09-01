import { apiFetch } from '@/lib/api/client';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  code: string;
};

export type AttendanceDay = {
  dayOfWeek: string;
  checked: boolean;
};

export type Attendance = {
  streakDays: number;
  checkedToday: boolean;
  days: AttendanceDay[];
};

export type StudyTimeSaveResult = {
  addedStudyTimeMinutes: number;
  totalStudyTimeMinutes: number;
};

export async function getAttendance() {
  const response = await apiFetch<ApiResponse<Attendance>>('/attendance', {
    method: 'GET',
  });
  return response.data;
}

export async function checkAttendance() {
  const response = await apiFetch<ApiResponse<Attendance>>('/attendance', {
    method: 'POST',
  });
  return response.data;
}

export async function saveStudyTime(studyTimeMinutes: number) {
  const response = await apiFetch<ApiResponse<StudyTimeSaveResult>>('/attendance/study-time', {
    method: 'POST',
    body: JSON.stringify({ studyTimeMinutes }),
  });
  return response.data;
}
