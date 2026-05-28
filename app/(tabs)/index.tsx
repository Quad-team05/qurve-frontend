import { type Href, router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import Text from '@/components/ui/AppText';

export default function HomeScreen() {
  const menus: { label: string; href: Href }[] = [
    { label: '로그인', href: '/(app)/auth/login' },
    { label: '홈', href: '/(tabs)' },
    { label: '학습', href: '/(tabs)/study' },
    { label: '리포트', href: '/(tabs)/progress' },
    { label: '채팅', href: '/(tabs)/chat' },
    { label: '마이페이지', href: '/(tabs)/mypage' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>이동 메뉴</Text>
      {menus.map((menu) => (
        <Pressable key={menu.label} style={styles.button} onPress={() => router.push(menu.href)}>
          <Text style={styles.buttonText}>{menu.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#ffffff',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  button: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
