import TopBar from '@/components/ui/TopBar';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const questionOneOptions = ['처음 시작해요(0개월)', '3개월 미만', '3개월 ~ 1년 미만', '1년 이상'];
const questionTwoOptions = ['둘 다 읽을수 있어요', '히라가나만 읽을 수 있어요', '아직 어려워요'];
const questionThreeOptions = [
  '네, 간단한 회화가 가능해요',
  '짧은 문장, 단어만 말할 수 있어요',
  '아직 어려워요',
];

export default function LevelTestSurveyPage() {
  const [selectedQ1, setSelectedQ1] = useState<number | null>(0);
  const [selectedQ2, setSelectedQ2] = useState<number | null>(null);
  const [selectedQ3, setSelectedQ3] = useState<number | null>(null);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="레벨 테스트" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pt-3 pb-8"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-4">
          <View className="mb-2 flex-row items-center justify-between px-1">
            <Text className="w-1/3 text-center text-xs font-semibold text-gray">설문</Text>
            <Text className="w-1/3 text-center text-xs font-semibold text-text-brown">
              레벨테스트
            </Text>
            <Text className="w-1/3 text-center text-xs font-semibold text-text-brown">결과</Text>
          </View>

          <View className="h-[3px] w-full bg-[#D8D2C7]">
            <View className="h-[3px] w-1/3 bg-[#6F7486]" />
          </View>
        </View>

        <View className="mb-[10px] rounded-xl border border-[#C8E0D6] bg-[#F2F9EE] px-4 pb-6 pt-4">
          <View className="flex-row items-center">
            <Text className="mb-5 mr-[10px] text-[28px]">📚</Text>
            <View>
              <Text className="font-bold text-base text-gray">맞춤 레벨 진단을 위해</Text>
              <Text className="mt-[2px] font-bold text-base text-gray">
                간단한 설문을 진행할게요.
              </Text>
              <Text className="mb-[14px] mt-1 text-xs font-medium text-text-brown">
                3가지 질문으로 시작해요
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between">
            <View className="mr-3 h-[3px] flex-1 bg-white">
              <View className="h-[3px] w-1/3 bg-[#6F7486]" />
            </View>
            <Text className="text-sm font-semibold text-[#A09A8D]">1/3</Text>
          </View>
        </View>

        <Text className="mb-[10px] text-sm font-semibold text-black">
          <Text className="text-sm text-gray">Q1 </Text>
          일본어를 배워본 기간이 얼마나 되나요?
        </Text>

        {questionOneOptions.map((option, idx) => {
          const selected = idx === selectedQ1;
          return (
            <Pressable
              key={`q1-${option}`}
              onPress={() => setSelectedQ1(idx)}
              className={`mb-[10px] flex-row items-center rounded-sm border px-3 py-4 ${selected ? 'border-[#C8E0D6] bg-[#F2F9EE]' : 'border-border bg-white'}`}
            >
              <View
                className={`mr-2 h-[18px] w-[18px] items-center justify-center rounded-full border ${selected ? 'border-border' : 'border-[#E4E4E4]'}`}
              >
                {selected ? <View className="h-2.5 w-2.5 rounded-full bg-[#059669]" /> : null}
              </View>
              <Text className="font-bold text-sm text-gray">{option}</Text>
            </Pressable>
          );
        })}

        <Text className="mb-[10px] text-sm font-semibold text-black">
          <Text className="text-sm text-gray">Q2 </Text>
          히라가나 · 카타카나를 읽을 수 있나요?
        </Text>

        {questionTwoOptions.map((option, idx) => {
          const selected = idx === selectedQ2;
          return (
            <Pressable
              key={`q2-${option}`}
              onPress={() => setSelectedQ2(idx)}
              className={`mb-[10px] flex-row items-center rounded-sm border px-3 py-4 ${selected ? 'border-[#C8E0D6] bg-[#F2F9EE]' : 'border-border bg-white'}`}
            >
              <View
                className={`mr-2 h-[18px] w-[18px] items-center justify-center rounded-full border ${selected ? 'border-border' : 'border-[#E4E4E4]'}`}
              >
                {selected ? <View className="h-2.5 w-2.5 rounded-full bg-[#059669]" /> : null}
              </View>
              <Text className="font-bold text-sm text-gray">{option}</Text>
            </Pressable>
          );
        })}

        <Text className="mb-[10px] mt-1 text-sm font-semibold text-black">
          <Text className="text-sm text-gray">Q3 </Text>
          일본어로 말할 수 있나요?
        </Text>

        {questionThreeOptions.map((option, idx) => {
          const selected = idx === selectedQ3;
          return (
            <Pressable
              key={`q3-${option}`}
              onPress={() => setSelectedQ3(idx)}
              className={`mb-[10px] flex-row items-center rounded-sm border px-3 py-4 ${selected ? 'border-[#C8E0D6] bg-[#F2F9EE]' : 'border-border bg-white'}`}
            >
              <View
                className={`mr-2 h-[18px] w-[18px] items-center justify-center rounded-full border ${selected ? 'border-border' : 'border-[#E4E4E4]'}`}
              >
                {selected ? <View className="h-2.5 w-2.5 rounded-full bg-[#059669]" /> : null}
              </View>
              <Text className="font-bold text-sm text-gray">{option}</Text>
            </Pressable>
          );
        })}

        <Pressable className="mt-3 h-[52px] items-center justify-center rounded-xl bg-[#2A2018]">
          <Text className="text-base font-medium text-white">레벨 테스트 시작하기</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
