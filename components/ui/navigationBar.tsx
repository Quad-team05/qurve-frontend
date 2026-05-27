import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { ComponentType } from 'react';
import { Pressable, View } from 'react-native';

import ChatIcon from '@/assets/icons/chat.svg';
import GraphIcon from '@/assets/icons/graph.svg';
import HomeIcon from '@/assets/icons/home.svg';
import ProfileIcon from '@/assets/icons/profile.svg';
import StudyIcon from '@/assets/icons/study.svg';

type TabItem = {
  routeName: string;
  Icon: ComponentType<{ width?: number; height?: number; color?: string }>;
};

const TAB_ITEMS: TabItem[] = [
  { routeName: 'chat', Icon: ChatIcon },
  { routeName: 'progress', Icon: GraphIcon },
  { routeName: 'index', Icon: HomeIcon },
  { routeName: 'study', Icon: StudyIcon },
  { routeName: 'mypage', Icon: ProfileIcon },
];

export default function NavigationBar({ state, navigation }: BottomTabBarProps) {
  return (
    <View className="border-t border-[#E0D8C8] bg-[#EDE8DE] px-10 py-6">
      <View className="flex-row items-end justify-between">
        {TAB_ITEMS.map((item) => {
          const routeIndex = state.routes.findIndex((route) => route.name === item.routeName);
          const isFocused = routeIndex === state.index;
          const iconColor = isFocused ? '#6b7280' : '#9b978f';
          const Icon = item.Icon;

          return (
            <Pressable
              key={item.routeName}
              className="flex-1 items-center justify-end"
              onPress={() => navigation.navigate(item.routeName)}
            >
              <Icon width={24} height={24} color={iconColor} />
              <View className="mt-1 h-[7px] items-center justify-start">
                <View
                  className={`h-[3px] w-6 rounded-full ${isFocused ? 'bg-[#6B7280]' : 'bg-transparent'}`}
                />
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
