import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Question = {
  prompt: string;
  sentence: string;
  options: string[];
};

const QUESTIONS: Question[] = [
  {
    prompt: '밑줄 친 단어의 읽는 방법으로 올바른 것을 고르세요.',
    sentence: '彼女は毎朝新聞を読みます。',
    options: ['1. しんもん', '2. しんぶん', '3. せんもん', '4. にゅうもん'],
  },
  {
    prompt: '밑줄 친 단어의 읽는 방법으로 올바른 것을 고르세요.',
    sentence: '今日は図書館で勉強します。',
    options: ['1. としょかん', '2. ずしょかん', '3. とそうかん', '4. ずそうかん'],
  },
  {
    prompt: '밑줄 친 단어의 읽는 방법으로 올바른 것을 고르세요.',
    sentence: '来週、友達と映画を見ます。',
    options: ['1. えいか', '2. えが', '3. えいが', '4. えがい'],
  },
  {
    prompt: '밑줄 친 단어의 읽는 방법으로 올바른 것을 고르세요.',
    sentence: '母は毎日料理を作ります。',
    options: ['1. りょり', '2. りょうり', '3. りょあり', '4. りょうい'],
  },
  {
    prompt: '밑줄 친 단어의 읽는 방법으로 올바른 것을 고르세요.',
    sentence: '駅まで歩いて行きます。',
    options: ['1. えき', '2. えぎ', '3. えこ', '4. えく'],
  },
  {
    prompt: '밑줄 친 단어의 읽는 방법으로 올바른 것을 고르세요.',
    sentence: '昨日、先生に質問しました。',
    options: ['1. しつもん', '2. しちもん', '3. しっもん', '4. しつぼん'],
  },
  {
    prompt: '밑줄 친 단어의 읽는 방법으로 올바른 것을 고르세요.',
    sentence: '週末は家族と買い物に行きます。',
    options: ['1. かいぶつ', '2. かいもの', '3. かいもつ', '4. がいもの'],
  },
  {
    prompt: '밑줄 친 단어의 읽는 방법으로 올바른 것을 고르세요.',
    sentence: '電車で会社へ通っています。',
    options: ['1. でんしゃ', '2. てんしゃ', '3. でんさ', '4. てんさ'],
  },
  {
    prompt: '밑줄 친 단어의 읽는 방법으로 올바른 것을 고르세요.',
    sentence: '朝ご飯を食べました。',
    options: ['1. あさごぱん', '2. あさごはん', '3. あさはん', '4. あさごばん'],
  },
  {
    prompt: '밑줄 친 단어의 읽는 방법으로 올바른 것을 고르세요.',
    sentence: '明日は病院へ行く予定です。',
    options: ['1. びょいん', '2. びょういん', '3. ひょういん', '4. びょおいん'],
  },
  {
    prompt: '밑줄 친 단어의 읽는 방법으로 올바른 것을 고르세요.',
    sentence: '新しい辞書を買いました。',
    options: ['1. じしょ', '2. じしょう', '3. ちしょ', '4. じそ'],
  },
  {
    prompt: '밑줄 친 단어의 읽는 방법으로 올바른 것을 고르세요.',
    sentence: '家で日本語を練習しています。',
    options: ['1. れんしゅう', '2. れんしゅ', '3. れいしゅう', '4. れんしょう'],
  },
  {
    prompt: '밑줄 친 단어의 읽는 방법으로 올바른 것을 고르세요.',
    sentence: '空港までバスで行きます。',
    options: ['1. くうこう', '2. こうくう', '3. くこう', '4. くうごう'],
  },
  {
    prompt: '밑줄 친 단어의 읽는 방법으로 올바른 것을 고르세요.',
    sentence: '今日は天気がいいですね。',
    options: ['1. てんき', '2. ていき', '3. でんき', '4. てんぎ'],
  },
  {
    prompt: '밑줄 친 단어의 읽는 방법으로 올바른 것을 고르세요.',
    sentence: '毎晩音楽を聞いています。',
    options: ['1. おんかく', '2. おんがく', '3. おうがく', '4. おんらく'],
  },
  {
    prompt: '밑줄 친 단어의 읽는 방법으로 올바른 것을 고르세요.',
    sentence: '来月、京都へ旅行します。',
    options: ['1. りょうこう', '2. りょこう', '3. りょうごう', '4. りょごう'],
  },
  {
    prompt: '밑줄 친 단어의 읽는 방법으로 올바른 것을 고르세요.',
    sentence: '教室で友達と話しました。',
    options: ['1. きょうしつ', '2. きょしつ', '3. きょうじつ', '4. きょじつ'],
  },
  {
    prompt: '밑줄 친 단어의 읽는 방법으로 올바른 것을 고르세요.',
    sentence: '昼ご飯はカレーを食べました。',
    options: ['1. ひるごばん', '2. ひるごはん', '3. ひるはん', '4. ひろごはん'],
  },
  {
    prompt: '밑줄 친 단어의 읽는 방법으로 올바른 것을 고르세요.',
    sentence: '先生の説明は分かりやすいです。',
    options: ['1. せつめ', '2. せつめい', '3. せつまい', '4. せいめい'],
  },
  {
    prompt: '밑줄 친 단어의 읽는 방법으로 올바른 것을 고르세요.',
    sentence: '図書館で本を借りました。',
    options: ['1. かりました', '2. からりました', '3. かえりました', '4. かりまた'],
  },
];

const questionCardShadowStyle = {
  shadowColor: '#000000',
  shadowOpacity: 0.04,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
} as const;

export default function SolveProblemPage() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedByQuestion, setSelectedByQuestion] = useState<(number | null)[]>(
    Array.from({ length: QUESTIONS.length }, () => null),
  );

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const selectedIndex = selectedByQuestion[currentQuestionIndex];
  const progressPercent = ((currentQuestionIndex + 1) / QUESTIONS.length) * 100;

  const handleSelectOption = (optionIndex: number) => {
    setSelectedByQuestion((prev) => {
      const next = [...prev];
      next[currentQuestionIndex] = optionIndex;
      return next;
    });
  };

  const handlePrev = () => {
    if (currentQuestionIndex === 0) return;
    setCurrentQuestionIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentQuestionIndex === QUESTIONS.length - 1) {
      router.push('/(app)/learning/problems/result');
      return;
    }
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  useFocusEffect(
    useCallback(() => {
      setCurrentQuestionIndex(0);
      setSelectedByQuestion(Array.from({ length: QUESTIONS.length }, () => null));
    }, []),
  );

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="문제풀기" />

      <View className="flex-1 px-4 pt-3">
        <View className="mb-4 flex-row gap-2">
          <Pressable className="rounded-sm border border-border bg-white px-4 py-2">
            <Text className="text-xs font-semibold text-text-brown">객관식</Text>
          </Pressable>
          <Pressable className="rounded-sm border border-border bg-white px-4 py-2">
            <Text className="text-xs font-semibold text-text-brown">문맥규정</Text>
          </Pressable>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-4"
          showsVerticalScrollIndicator={false}
        >
          <View className="mx-auto h-[10px] w-[50px] rounded-[1px] bg-[#F9C8D8]" />
          <View
            className="mb-4 rounded-sm border border-border bg-white px-4 pb-4 pt-5"
            style={questionCardShadowStyle}
          >
            <Text className="font-bold text-sm text-[#A09080]">Q{currentQuestionIndex + 1}.</Text>
            <Text className="mt-2 font-regular text-lg text-black">{currentQuestion.prompt}</Text>

            <Text className="mb-6 mt-5 font-regular text-lg text-black">
              {currentQuestion.sentence}
            </Text>

            {currentQuestion.options.map((option, idx) => {
              const selected = idx === selectedIndex;
              return (
                <Pressable
                  key={`q${currentQuestionIndex + 1}-${option}`}
                  onPress={() => handleSelectOption(idx)}
                  className={`mb-3 rounded-sm border px-[14px] py-4 ${selected ? 'border-[#C8E0D6] bg-[#F2F9EE]' : 'border-border bg-white'}`}
                >
                  <Text
                    className={`text-sm font-semibold ${selected ? 'text-gray' : 'text-[#2A2018]'}`}
                  >
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View className="pb-[18px]">
          <Text className="pb-[10px] text-sm font-semibold text-[#8C877D]">
            {currentQuestionIndex + 1} / {QUESTIONS.length}
          </Text>
          <View className="mb-5 h-[3px] w-full bg-[#E0D8C8]">
            <View className="h-[3px] bg-gray" style={{ width: `${progressPercent}%` }} />
          </View>

          <View className="h-px w-full border-t border-dashed border-border" />

          <View className="mt-[18px] flex-row gap-11">
            <Pressable
              className={`px-25 h-[43px] flex-1 items-center justify-center rounded-xl border py-3 ${currentQuestionIndex === 0 ? 'border-[#D8D2C7] bg-[#F4F2EE]' : 'border-border bg-white'}`}
              onPress={handlePrev}
              disabled={currentQuestionIndex === 0}
            >
              <Text className="font-old text-sm text-black">이전</Text>
            </Pressable>
            <Pressable
              className="px-25 h-[43px] flex-1 items-center justify-center rounded-xl bg-btn-dark py-3"
              onPress={handleNext}
            >
              <Text className="font-bold text-sm text-white">다음</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
