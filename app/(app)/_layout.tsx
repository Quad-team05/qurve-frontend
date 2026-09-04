import { Stack } from 'expo-router';

export default function AppRoutesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="auth/login" options={{ title: '로그인' }} />
      <Stack.Screen name="auth/signup" options={{ title: '회원가입' }} />
      <Stack.Screen name="auth/find-id" options={{ title: '아이디 찾기' }} />
      <Stack.Screen name="auth/find-password" options={{ title: '비밀번호 찾기' }} />
      <Stack.Screen name="auth/social-callback" options={{ title: '소셜 로그인' }} />
      <Stack.Screen name="auth/terms" options={{ title: '약관 확인' }} />

      <Stack.Screen name="level/test-survey" options={{ title: '레벨 테스트 설문' }} />
      <Stack.Screen name="level/test" options={{ title: '레벨 테스트' }} />
      <Stack.Screen name="level/assign" options={{ title: '레벨 부여' }} />

      <Stack.Screen name="learning/problems/today" options={{ title: '오늘의 학습' }} />
      <Stack.Screen name="learning/problems/solve" options={{ title: '문제 풀기' }} />
      <Stack.Screen name="learning/problems/result" options={{ title: '학습 결과' }} />
      <Stack.Screen name="learning/problems/review" options={{ title: '정답 해설' }} />
      <Stack.Screen name="learning/wrong-note/list" options={{ title: '오답노트 목록' }} />
      <Stack.Screen name="learning/wrong-note/detail" options={{ title: '오답노트 문제 보기' }} />
      <Stack.Screen name="learning/vocab/list" options={{ title: '단어장 목록' }} />
      <Stack.Screen name="learning/vocab/study" options={{ title: '단어 학습' }} />
      <Stack.Screen name="learning/vocab/bookmarked" options={{ title: '북마크 단어' }} />

      <Stack.Screen name="mypage/profile-edit" options={{ title: '회원정보 수정' }} />
      <Stack.Screen name="mypage/challenge" options={{ title: '챌린지 관리' }} />
      <Stack.Screen
        name="mypage/challenge/create-goal-select"
        options={{ title: '챌린지 추가 - 목표 선택' }}
      />
      <Stack.Screen
        name="mypage/challenge/create-goal-settings"
        options={{ title: '챌린지 추가 - 목표 설정' }}
      />
      <Stack.Screen
        name="mypage/challenge/create-confirm"
        options={{ title: '챌린지 추가 - 확인 및 등록' }}
      />
      <Stack.Screen name="mypage/challenge/edit" options={{ title: '챌린지 수정' }} />
      <Stack.Screen name="mypage/activity" options={{ title: '내 활동' }} />

      <Stack.Screen name="mypage/level-guide" options={{ title: '레벨 가이드' }} />

      <Stack.Screen name="mypage/xp-history" options={{ title: 'XP 획득 기록' }} />

      <Stack.Screen name="mypage/badge" options={{ title: '나의 배지' }} />
    </Stack>
  );
}
