import { Text, View } from 'react-native';

import TopBar from '@/components/ui/TopBar';

export default function StudyScreen() {
  return (
    <View className="bg-app-bg flex-1">
      <TopBar title="학습하기" />
      <View className="px-4 py-4">
        <Text className="text-base text-[#8C877D]">
          학습하기 카드를 눌러 학습 목표와 단계를 변경할 수 있어요.
        </Text>
      </View>
    </View>
  );
}
