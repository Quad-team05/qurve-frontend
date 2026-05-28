import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


type TopBarProps = {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightSlot?: ReactNode;
};

export default function TopBar({
  title,
  showBackButton = true,
  onBackPress,
  rightSlot,
}: TopBarProps) {
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }

    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <View className="border-b border-border bg-bg px-4 pb-3 pt-2">
      <View className="relative h-12 items-center justify-center">
        {showBackButton ? (
          <Pressable
            onPress={handleBackPress}
            className="absolute left-0 h-10 w-10 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={16} color="#6B7280" />
          </Pressable>
        ) : null}

        <Text className="font-bold text-[16px] text-black">{title}</Text>

        <View className="absolute right-0 h-10 w-10 items-center justify-center"></View>
      </View>
    </View>
  );
}
