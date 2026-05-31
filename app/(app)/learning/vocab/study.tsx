import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const initialWords = [
  { num: 1, jp: '仕事', read: 'しごと', meaning: '일, 직업', bookmarked: true, revealed: true },
  { num: 2, jp: '財布', read: 'さいふ', meaning: '지갑', bookmarked: false, revealed: false },
  { num: 3, jp: '病院', read: 'びょういん', meaning: '병원', bookmarked: false, revealed: false },
  { num: 4, jp: '話す', read: 'はなす', meaning: '말하다', bookmarked: false, revealed: false },
  { num: 5, jp: '電話', read: 'でんわ', meaning: '전화', bookmarked: false, revealed: false },
];

export default function VocabStudyPage() {
  const router = useRouter();
  const [words, setWords] = useState(initialWords);

  const toggleReveal = (index: number) => {
    setWords((prev) => prev.map((w, i) => (i === index ? { ...w, revealed: !w.revealed } : w)));
  };

  const toggleBookmark = (index: number) => {
    setWords((prev) => prev.map((w, i) => (i === index ? { ...w, bookmarked: !w.bookmarked } : w)));
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="단어 학습하기" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4"
        showsVerticalScrollIndicator={false}
      >
        <Text className="mb-3 font-regular text-xs text-text-brown">N5 / UNIT 1</Text>

        {words.map((w, i) => (
          <View key={i} className="mb-2.5 rounded-sm border border-border bg-white p-4">
            {/* 번호 + 북마크 */}
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="font-regular text-xs text-text-brown">{w.num}</Text>
              <Pressable onPress={() => toggleBookmark(i)}>
                <Text style={{ fontSize: 18, color: w.bookmarked ? '#D97706' : '#C8C0B0' }}>
                  🔖
                </Text>
              </Pressable>
            </View>

            {/* 한자 */}
            <Text className="mb-1 text-center font-regular text-4xl text-btn-dark">{w.jp}</Text>

            {/* 읽기 */}
            <Text className="mb-3 text-center font-regular text-sm text-text-brown">{w.read}</Text>

            {/* 뜻 보기 버튼 */}
            <Pressable
              className="rounded-sm border border-border bg-bg py-2"
              onPress={() => toggleReveal(i)}
            >
              <Text
                className="text-center font-regular text-sm"
                style={{ color: w.revealed ? '#2A2018' : '#A09080' }}
              >
                {w.revealed ? w.meaning : '뜻 보기'}
              </Text>
            </Pressable>
          </View>
        ))}

        {/* 하단 */}
        <View className="mt-2 flex-row items-center justify-between border-t border-dashed border-border pt-4">
          <Text className="text-2xl text-text-brown">↓</Text>
          <Pressable className="rounded-sm bg-btn-dark px-7 py-3" onPress={() => router.back()}>
            <Text className="font-semiBold text-sm text-white">학습완료</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
