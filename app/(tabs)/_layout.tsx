import { Tabs } from 'expo-router';
import React from 'react';
import NavigationBar from '@/components/ui/navigationBar';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <NavigationBar {...props} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="study" />
      <Tabs.Screen name="progress" />
      <Tabs.Screen name="chat" />
      <Tabs.Screen name="mypage" />
    </Tabs>
  );
}
