import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import { getBookmarkedWords, removeVocabBookmark, type VocabWord } from '@/lib/api/vocabulary';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BookmarkedVocabPage() {
  const [words, setWords] = useState<VocabWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        setIsLoading(true);
        const result = await getBookmarkedWords();
        setWords(result);
      } catch (error) {
        console.error('북마크 단어를 불러오지 못했습니다.', error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadBookmarks();
  }, []);

  const toggleReveal = (wordId: number) => {
    setRevealed((prev) => ({ ...prev, [wordId]: !prev[wordId] }));
  };

  const handleRemoveBookmark = async (wordId: number) => {
    try {
      await removeVocabBookmark(wordId);
      setWords((prev) => prev.filter((w) => w.wordId !== wordId));
    } catch (error) {
      console.error('북마크 삭제에 실패했습니다.', error);
    }
  };

  const getMeaning = (w: VocabWord) =>
    w.koreanMeaning ?? w.meaningKo ?? w.meaningKr ?? w.meaningKorean ?? w.meaning;

  const WordCard = ({ w }: { w: VocabWord }) => {
    return (
      <Pressable
        className="mb-2.5 flex-row items-center rounded-sm border border-border bg-white p-4"
        onPress={() => toggleReveal(w.wordId)}
        style={{ transform: [{ rotate: w.orderNumber % 2 === 0 ? '-0.2deg' : '0.2deg' }] }}
      >
        <Text className="mr-3 font-regular text-xs text-text-brown">{w.orderNumber}</Text>
        <View className="flex-1">
          <Text className="font-regular text-xl text-btn-dark">{w.expression}</Text>
          <Text className="font-regular text-xs text-text-brown">({w.reading})</Text>
        </View>
        <Text className="font-semiBold mr-3 text-sm text-text-brown">
          {revealed[w.wordId] ? getMeaning(w) : '···'}
        </Text>
        <Pressable onPress={() => handleRemoveBookmark(w.wordId)} hitSlop={8}>
          <Text style={{ fontSize: 18, color: '#D97706' }}>🔖</Text>
        </Pressable>
      </Pressable>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="북마크 단어장" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4"
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <Text className="text-sm text-text-brown">불러오는 중...</Text>
        ) : words.length === 0 ? (
          <Text className="text-sm text-text-brown">북마크한 단어가 없어요.</Text>
        ) : (
          words.map((w) => <WordCard key={w.wordId} w={w} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
