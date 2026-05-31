import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type WrongNoteQuestion = {
  prompt: string;
  sentence: string;
  options: string[];
  selectedIndex: number | null;
  correctIndex: number;
  explanationTitle: string;
  explanationOptions: string[];
};

const WRONG_NOTE_QUESTIONS: WrongNoteQuestion[] = [
  {
    prompt: '밑줄 친 단어의 읽는 방법으로 올바른 것을 고르세요.',
    sentence: '彼女は毎朝新聞を読みます。',
    options: ['1. しんもん', '2. しんぶん', '3. せんもん', '4. にゅうもん'],
    selectedIndex: 0,
    correctIndex: 1,
    explanationTitle: '新聞의 올바른 읽기를 고르세요.',
    explanationOptions: ['1. 신문', '2. 심문', '3. 선문', '4. 입문'],
  },
  {
    prompt: '밑줄 친 단어의 읽는 방법으로 올바른 것을 고르세요.',
    sentence: '今日は図書館で勉強します。',
    options: ['1. としょかん', '2. ずしょかん', '3. とそうかん', '4. ずそうかん'],
    selectedIndex: 2,
    correctIndex: 0,
    explanationTitle: '図書館의 올바른 읽기를 고르세요.',
    explanationOptions: ['1. 도서관', '2. 도서감', '3. 도총관', '4. 도상관'],
  },
  {
    prompt: '밑줄 친 단어의 읽는 방법으로 올바른 것을 고르세요.',
    sentence: '来週、友達と映画を見ます。',
    options: ['1. えいか', '2. えが', '3. えいが', '4. えがい'],
    selectedIndex: 1,
    correctIndex: 2,
    explanationTitle: '映画의 올바른 읽기를 고르세요.',
    explanationOptions: ['1. 영화', '2. 영가', '3. 영예', '4. 영상'],
  },
  {
    prompt: '밑줄 친 단어의 읽는 방법으로 올바른 것을 고르세요.',
    sentence: '母は毎日料理を作ります。',
    options: ['1. りょり', '2. りょうり', '3. りょあり', '4. りょうい'],
    selectedIndex: 1,
    correctIndex: 1,
    explanationTitle: '料理의 올바른 읽기를 고르세요.',
    explanationOptions: ['1. 요리', '2. 용의', '3. 요이', '4. 료아리'],
  },
  {
    prompt: '밑줄 친 단어의 읽는 방법으로 올바른 것을 고르세요.',
    sentence: '駅まで歩いて行きます。',
    options: ['1. えき', '2. えぎ', '3. えこ', '4. えく'],
    selectedIndex: 2,
    correctIndex: 0,
    explanationTitle: '駅의 올바른 읽기를 고르세요.',
    explanationOptions: ['1. 역', '2. 액', '3. 익', '4. 엣'],
  },
];

const UNDERLINED_WORDS = ['新聞', '図書館', '映画', '料理', '駅'] as const;

const questionCardShadowStyle = {
  shadowColor: '#000000',
  shadowOpacity: 0.04,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
} as const;

export default function WrongNoteDetailPage() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const currentQuestion = WRONG_NOTE_QUESTIONS[currentQuestionIndex];
  const underlinedWord = UNDERLINED_WORDS[currentQuestionIndex] ?? '';
  const progressPercent = ((currentQuestionIndex + 1) / WRONG_NOTE_QUESTIONS.length) * 100;

  const handlePrev = () => {
    if (currentQuestionIndex === 0) return;
    setCurrentQuestionIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentQuestionIndex === WRONG_NOTE_QUESTIONS.length - 1) {
      router.push('/(tabs)/study');
      return;
    }
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const renderSentence = (sentence: string, word: string) => {
    if (!word || !sentence.includes(word)) {
      return <Text className="mb-6 mt-5 font-regular text-lg text-black">{sentence}</Text>;
    }

    const [before, ...rest] = sentence.split(word);
    const after = rest.join(word);

    return (
      <Text className="mb-6 mt-5 font-regular text-lg text-black">
        {before}
        <Text className="font-regular text-lg text-black underline">{word}</Text>
        {after}
      </Text>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="문제보기" />

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
            className="mb-4 rounded-sm border border-border bg-white px-4 pb-5 pt-5"
            style={questionCardShadowStyle}
          >
            <Text className="font-bold text-sm text-[#A09080]">Q{currentQuestionIndex + 1}.</Text>
            <Text className="mt-2 font-regular text-lg text-black">{currentQuestion.prompt}</Text>
            {renderSentence(currentQuestion.sentence, underlinedWord)}

            {currentQuestion.options.map((option, idx) => {
              const selected = idx === currentQuestion.selectedIndex;
              return (
                <View
                  key={`wrong-note-q${currentQuestionIndex + 1}-${option}`}
                  className={`mb-3 rounded-sm border px-[14px] py-4 ${selected ? 'border-[#D7CEBF] bg-[#E8E2D4]' : 'border-border bg-white'}`}
                >
                  <Text
                    className={`text-sm font-semibold ${selected ? 'text-gray' : 'text-[#2A2018]'}`}
                  >
                    {option}
                  </Text>
                </View>
              );
            })}

            <View className="mb-4 mt-2 h-px border-t border-dashed border-border" />

            <Text className="text-xs font-semibold text-text-brown">정답 해설</Text>
            <Text className="mt-2 text-sm font-semibold text-[#8C877D]">
              {currentQuestion.explanationTitle}
            </Text>

            <View className="mt-2">
              {currentQuestion.explanationOptions.map((item, idx) => {
                const isCorrect = idx === currentQuestion.correctIndex;
                return (
                  <Text
                    key={`wrong-note-explain-${currentQuestionIndex + 1}-${item}`}
                    className={`mt-[2px] text-sm font-semibold ${isCorrect ? 'text-[#059669]' : 'text-[#2A2018]'}`}
                  >
                    {item}
                  </Text>
                );
              })}
            </View>
          </View>

          <View className="self-end rounded-xl border border-border bg-white px-5 py-2">
            <Text className="text-sm font-semibold text-[#2A2018]">북마크 ★</Text>
          </View>
        </ScrollView>

        <View className="pb-[18px]">
          <View className="mb-5 h-px w-full border-t border-dashed border-border" />

          <View className="flex-row gap-11">
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
              <Text className="font-bold text-sm text-white">
                {currentQuestionIndex === WRONG_NOTE_QUESTIONS.length - 1
                  ? '학습 종료하기'
                  : '다음'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
