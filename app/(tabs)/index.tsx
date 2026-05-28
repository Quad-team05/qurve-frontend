import { type Href, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const menus: { label: string; href: Href }[] = [
    { label: '회원가입', href: '/(app)/auth/signup' },
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
