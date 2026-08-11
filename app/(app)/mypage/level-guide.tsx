import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GREEN = '#059669';
const BORDER = '#E0D8C8';
const TEXT = '#2A2018';
const TEXT3 = '#A09080';

const sections = [
  {
    icon: '🌱',
    label: '입문',
    range: 'Lv.1 ~ Lv.10',
    xp: '0 ~ 2,700 XP',
    bg: '#D1FAE5',
    desc: '빠른 레벨업으로 초반 동기부여',
  },
  {
    icon: '🌳',
    label: '성장',
    range: 'Lv.11 ~ Lv.30',
    xp: '3,300 ~ 33,700 XP',
    bg: '#FEF3C7',
    desc: '꾸준한 학습 습관 형성',
  },
  {
    icon: '🌲',
    label: '숙련',
    range: 'Lv.31 ~ Lv.50',
    xp: '36,300 ~ 104,700 XP',
    bg: '#DBEAFE',
    desc: '실력자의 영역',
  },
  {
    icon: '👑',
    label: '전설',
    range: 'Lv.51 ~ Lv.100',
    xp: '110,000 ~ 630,000 XP',
    bg: '#EDE9FE',
    desc: '최상위 학습자만 도달 가능',
  },
];

const xpMethods = [
  { icon: '📅', label: '일일 출석', xp: '+10 XP' },
  { icon: '✅', label: '문제 1세트 완료', xp: '+30 XP' },
  { icon: '💯', label: '문제 1세트 100점', xp: '+50 XP' },
  { icon: '🎯', label: '일일 목표 달성', xp: '+50 XP' },
  { icon: '📖', label: '단어 학습 1세트', xp: '+20 XP' },
  { icon: '🔍', label: '오답노트 복습 완료', xp: '+15 XP' },
  { icon: '🏆', label: '챌린지 달성', xp: '+100 XP' },
];

export default function LevelGuidePage() {
  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="레벨 가이드" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 gap-y-3"
        showsVerticalScrollIndicator={false}
      >
        {/* 레벨 구간 카드 */}
        {sections.map((s, i) => (
          <View
            key={i}
            style={{
              backgroundColor: s.bg,
              borderRadius: 8,
              padding: 16,
              borderWidth: 0.5,
              borderColor: BORDER,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-x-2.5">
                <Text style={{ fontSize: 28 }}>{s.icon}</Text>
                <View>
                  <Text className="font-semiBold text-base text-btn-dark">{s.label}</Text>
                  <Text className="font-regular text-xs text-text-brown">{s.range}</Text>
                </View>
              </View>
              <Text className="font-regular text-xs text-text-brown">{s.xp}</Text>
            </View>
            <Text className="mt-2 font-regular text-xs text-text-brown">{s.desc}</Text>
          </View>
        ))}

        {/* 안내 텍스트 */}
        <Text className="text-center font-regular text-xs text-text-brown">
          레벨은 누적 XP 기준으로 자동 상승합니다.
        </Text>

        {/* XP 획득 방법 */}
        <Text className="font-semiBold text-sm text-btn-dark">XP 획득 방법</Text>
        {xpMethods.map((item, i) => (
          <View
            key={i}
            className="flex-row items-center justify-between rounded-sm border border-border bg-white px-4 py-3"
          >
            <View className="flex-row items-center gap-x-2.5">
              <Text style={{ fontSize: 16 }}>{item.icon}</Text>
              <Text className="font-regular text-sm text-btn-dark">{item.label}</Text>
            </View>
            <Text className="font-semiBold text-sm" style={{ color: GREEN }}>
              {item.xp}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
