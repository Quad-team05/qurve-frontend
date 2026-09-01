import { apiFetch } from '@/lib/api/client';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  code: string;
};

export type AiChatResult = {
  message: string;
};

export async function sendAiChatMessage(message: string) {
  const response = await apiFetch<ApiResponse<AiChatResult>>('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
  return response.data;
}

export async function clearAiChat() {
  await apiFetch<ApiResponse<null>>('/ai/chat', {
    method: 'DELETE',
  });
}
