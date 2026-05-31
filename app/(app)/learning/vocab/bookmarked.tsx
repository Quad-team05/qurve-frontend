import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const bookmarkedWords = [
  { num: 1, jp: '仕事', read: 'しごと', ko: '일, 직업' },
  { num: 2, jp: '手紙', read: 'てがみ', ko: '편지' },
  { num: 3, jp: '学校', read: 'がっこう', ko: '학교' },
  { num: 4, jp: '銀行', read: 'ぎんこう', ko: '은행' },
  { num: 5, jp: '悪い', read: 'わるい', ko: '나쁘다' },
];

const bookmarkedWords2 = [
  { num: 1, jp: '広い', read: 'ひろい', ko: '넓다' },
  { num: 2, jp: '狭い', read: 'せまい', ko: '좁다' },
];

export default function BookmarkedVocabPage() {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const toggleReveal = (key: string) => {
    setRevealed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const WordCard = ({ w, unit }: { w: (typeof bookmarkedWords)[0]; unit: number }) => {
    const key = `${unit}-${w.num}`;
    return (
      <Pressable
        className="mb-2.5 flex-row items-center rounded-sm border border-border bg-white p-4"
        onPress={() => toggleReveal(key)}
        style={{ transform: [{ rotate: w.num % 2 === 0 ? '-0.2deg' : '0.2deg' }] }}
      >
        <Text className="mr-3 font-regular text-xs text-text-brown">{w.num}</Text>
        <View className="flex-1">
          <Text className="font-regular text-xl text-btn-dark">{w.jp}</Text>
          <Text className="font-regular text-xs text-text-brown">({w.read})</Text>
        </View>
        <Text className="font-semiBold mr-3 text-sm text-text-brown">
          {revealed[key] ? w.ko : '···'}
        </Text>
        <Text style={{ fontSize: 18, color: '#D97706' }}>🔖</Text>
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
        <Text className="mb-3 font-regular text-xs text-text-brown">N5 / UNIT 1</Text>
        {bookmarkedWords.map((w) => (
          <WordCard key={w.num} w={w} unit={1} />
        ))}

        <Text className="mb-3 mt-3 font-regular text-xs text-text-brown">N5 / UNIT 2</Text>
        {bookmarkedWords2.map((w) => (
          <WordCard key={w.num} w={w} unit={2} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
