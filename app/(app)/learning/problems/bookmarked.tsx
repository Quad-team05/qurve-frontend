import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import { getBookmarkedProblems, removeProblemBookmark, type Problem } from '@/lib/api/problem';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BORDER = '#E0D8C8';
const TEXT = '#2A2018';
const TEXT3 = '#A09080';

export default function BookmarkedProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        setIsLoading(true);
        const result = await getBookmarkedProblems();
        setProblems(result);
      } catch (error) {
        console.error('북마크 문제를 불러오지 못했습니다.', error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadBookmarks();
  }, []);

  const handleRemoveBookmark = async (problemId: number) => {
    try {
      await removeProblemBookmark(problemId);
      setProblems((prev) => prev.filter((p) => p.problemId !== problemId));
    } catch (error) {
      console.error('북마크 해제에 실패했습니다.', error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="북마크 문제" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 gap-y-2.5"
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <Text className="text-sm text-text-brown">불러오는 중...</Text>
        ) : problems.length === 0 ? (
          <Text className="text-sm text-text-brown">북마크한 문제가 없어요.</Text>
        ) : (
          problems.map((problem) => (
            <View
              key={problem.problemId}
              style={{
                borderWidth: 0.5,
                borderColor: BORDER,
                borderRadius: 6,
                backgroundColor: '#fff',
                padding: 14,
              }}
            >
              <View className="mb-2 flex-row items-center justify-between">
                <Text style={{ fontSize: 10, color: TEXT3 }}>
                  {problem.level} · {problem.category}
                </Text>
                <Pressable onPress={() => handleRemoveBookmark(problem.problemId)} hitSlop={8}>
                  <Text style={{ fontSize: 16, color: '#D97706' }}>🔖</Text>
                </Pressable>
              </View>
              <Text style={{ fontSize: 14, color: TEXT, lineHeight: 20 }}>
                {problem.questionText}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
