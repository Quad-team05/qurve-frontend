import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const questionOneOptions = ['처음 시작해요(0개월)', '3개월 미만', '3개월 ~ 1년 미만', '1년 이상'];
const questionTwoOptions = ['둘 다 읽을수 있어요', '히라가나만 읽을 수 있어요', '아직 어려워요'];

export default function LevelTestSurveyPage() {
  const router = useRouter();
  const totalQuestions = 2;
  const [selectedQ1, setSelectedQ1] = useState<number | null>(null);
  const [selectedQ2, setSelectedQ2] = useState<number | null>(null);
  const answeredCount = [selectedQ1, selectedQ2].filter((answer) => answer !== null).length;
  const progressPercent = (answeredCount / totalQuestions) * 100;
  const canStartTest = answeredCount === totalQuestions;

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="border-b border-border bg-bg px-4 pb-3 pt-0">
        <View className="h-12 items-center justify-center">
          <Text className="font-bold text-[16px] text-black">레벨 테스트</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pt-3 pb-4"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
              <Text className="mb-[14px] mt-1 text-xs font-medium text-gray">
                2가지 질문으로 시작해요
              </Text>
            </View>
          </View>
          <View className="flex-row items-center justify-between">
            <View className="mr-3 h-[3px] flex-1 bg-white">
              <View className="h-[3px] bg-[#059669]" style={{ width: `${progressPercent}%` }} />
            </View>
            <Text className="text-sm font-semibold text-[#A09A8D]">
              {answeredCount}/{totalQuestions}
            </Text>
          </View>
        </View>

        <Text className="mb-[10px] text-sm font-semibold text-black">
          <Text className="text-sm text-gray">Q1 </Text>
          일본어를 배워본 기간이 얼마나 되나요?
        </Text>

        {questionOneOptions.map((option, idx) => {
          const selected = idx === selectedQ1;
          return (
            <TouchableOpacity
              key={`q1-${option}`}
              onPress={() => setSelectedQ1(idx)}
              style={{
                marginBottom: 10,
                flexDirection: 'row',
                alignItems: 'center',
                borderRadius: 4,
                borderWidth: 1,
                paddingHorizontal: 12,
                paddingVertical: 16,
                borderColor: selected ? '#C8E0D6' : '#E0D8C8',
                backgroundColor: selected ? '#F2F9EE' : '#fff',
              }}
            >
              <View
                style={{
                  marginRight: 8,
                  height: 18,
                  width: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 9,
                  borderWidth: 1,
                  borderColor: selected ? '#E0D8C8' : '#E4E4E4',
                }}
              >
                {selected ? (
                  <View
                    style={{ height: 10, width: 10, borderRadius: 5, backgroundColor: '#059669' }}
                  />
                ) : null}
              </View>
              <Text style={{ fontWeight: 'bold', fontSize: 14, color: '#6B7280' }}>{option}</Text>
            </TouchableOpacity>
          );
        })}

        <Text className="mb-[10px] text-sm font-semibold text-black">
          <Text className="text-sm text-gray">Q2 </Text>
          히라가나 · 카타카나를 읽을 수 있나요?
        </Text>

        {questionTwoOptions.map((option, idx) => {
          const selected = idx === selectedQ2;
          return (
            <TouchableOpacity
              key={`q2-${option}`}
              onPress={() => setSelectedQ2(idx)}
              style={{
                marginBottom: 10,
                flexDirection: 'row',
                alignItems: 'center',
                borderRadius: 4,
                borderWidth: 1,
                paddingHorizontal: 12,
                paddingVertical: 16,
                borderColor: selected ? '#C8E0D6' : '#E0D8C8',
                backgroundColor: selected ? '#F2F9EE' : '#fff',
              }}
            >
              <View
                style={{
                  marginRight: 8,
                  height: 18,
                  width: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 9,
                  borderWidth: 1,
                  borderColor: selected ? '#E0D8C8' : '#E4E4E4',
                }}
              >
                {selected ? (
                  <View
                    style={{ height: 10, width: 10, borderRadius: 5, backgroundColor: '#059669' }}
                  />
                ) : null}
              </View>
              <Text style={{ fontWeight: 'bold', fontSize: 14, color: '#6B7280' }}>{option}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={{ paddingHorizontal: 16, paddingBottom: 60, paddingTop: 12 }}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={{
            height: 52,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 12,
            backgroundColor: canStartTest ? '#2A2018' : '#B9B2A7',
          }}
          onPress={() => {
            router.push('/(app)/level/test');
          }}
        >
          <Text style={{ fontSize: 16, color: '#fff' }}>레벨 테스트 시작하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
