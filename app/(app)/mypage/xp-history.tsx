import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import { getTodayXp, type XpActionType, type XpHistoryItem } from '@/lib/api/xp';
import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GREEN = '#059669';
const GREEN_LIGHT = '#ECFDF5';
const GREEN_MID = '#A7F3D0';
const BORDER = '#E0D8C8';
const BG = '#F5F3EE';

const ACTION_LABELS: Record<XpActionType, { icon: string; label: string }> = {
  DAILY_ATTENDANCE: { icon: '📅', label: '일일 출석' },
  STREAK_3_DAYS: { icon: '🔥', label: '3일 연속 출석 보너스' },
  STREAK_7_DAYS: { icon: '🔥', label: '7일 연속 출석 보너스' },
  PROBLEM_CORRECT: { icon: '✅', label: '문제 정답' },
  PROBLEM_SET_COMPLETE: { icon: '✅', label: '문제 1세트 완료' },
  PROBLEM_SET_PERFECT: { icon: '💯', label: '문제 1세트 100점' },
  WRONG_NOTE_COMPLETE: { icon: '🔍', label: '오답노트 복습 완료' },
  WRONG_NOTE_CORRECT: { icon: '🔍', label: '오답 복습 후 정답' },
  WORD_LEARN: { icon: '📚', label: '단어 학습' },
  WORD_SET_COMPLETE: { icon: '📚', label: '단어 학습 1세트 완료' },
  WORD_BOOKMARK: { icon: '🔖', label: '단어 북마크 등록' },
  CHALLENGE_COMPLETE: { icon: '🏆', label: '챌린지 달성' },
  DAILY_GOAL_COMPLETE: { icon: '🎯', label: '일일 목표 달성' },
  AI_COACH_FIRST: { icon: '💬', label: 'AI 학습 코치 첫 사용' },
  AI_COACH_DAILY: { icon: '💬', label: 'AI 학습 코치 일일 사용' },
};

function formatTime(isoString: string) {
  const date = new Date(isoString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `오늘 ${hours}:${minutes}`;
}

export default function XPHistoryPage() {
  const [totalXp, setTotalXp] = useState<number | null>(null);
  const [histories, setHistories] = useState<XpHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTodayXp = async () => {
      try {
        setIsLoading(true);
        const today = await getTodayXp();
        setTotalXp(today.totalXp);
        setHistories(today.histories);
      } catch (error) {
        // TODO: 에러 토스트 처리
        console.error('XP 기록을 불러오지 못했습니다.', error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadTodayXp();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="XP 획득 기록" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 gap-y-3"
        showsVerticalScrollIndicator={false}
      >
        {/* 오늘 획득 XP */}
        <View
          style={{
            backgroundColor: GREEN_LIGHT,
            borderWidth: 1,
            borderColor: GREEN_MID,
            borderRadius: 8,
            padding: 14,
          }}
        >
          <Text
            className="font-regular text-xs"
            style={{ color: GREEN, fontStyle: 'italic', marginBottom: 4 }}
          >
            오늘 획득 XP
          </Text>
          <Text className="font-semiBold text-btn-dark" style={{ fontSize: 28 }}>
            {isLoading ? '-' : `${totalXp ?? 0} XP`}
          </Text>
        </View>

        {/* 기록 리스트 */}
        {isLoading ? (
          <Text className="text-center font-regular text-sm text-text-brown">불러오는 중...</Text>
        ) : histories.length === 0 ? (
          <Text className="text-center font-regular text-sm text-text-brown">
            오늘 획득한 XP 기록이 없어요.
          </Text>
        ) : (
          histories.map((r, i) => {
            const info = ACTION_LABELS[r.actionType];
            return (
              <View
                key={i}
                style={{
                  backgroundColor: '#fff',
                  borderWidth: 0.5,
                  borderColor: BORDER,
                  borderRadius: 6,
                  padding: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: BG,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 18 }}>{info?.icon ?? '⭐'}</Text>
                  </View>
                  <View>
                    <Text className="font-regular text-sm text-btn-dark">
                      {info?.label ?? r.actionType}
                    </Text>
                    <Text
                      className="font-regular text-text-brown"
                      style={{ fontSize: 10, marginTop: 2 }}
                    >
                      {formatTime(r.earnedAt)}
                    </Text>
                  </View>
                </View>
                <Text className="font-semiBold text-sm" style={{ color: GREEN }}>
                  +{r.xpAmount} XP
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
