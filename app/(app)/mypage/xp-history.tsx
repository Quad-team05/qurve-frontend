import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GREEN = '#059669';
const GREEN_LIGHT = '#ECFDF5';
const GREEN_MID = '#A7F3D0';
const BORDER = '#E0D8C8';
const TEXT = '#2A2018';
const TEXT3 = '#A09080';
const BG = '#F5F3EE';

const records = [
  { icon: '📅', label: '일일 출석', time: '오늘 08:11', xp: '+10 XP' },
  { icon: '✅', label: '문제 1세트 완료', time: '오늘 09:23', xp: '+30 XP' },
  { icon: '💯', label: '문제 1세트 100점', time: '오늘 11:25', xp: '+50 XP' },
  { icon: '🎯', label: '일일 목표 달성', time: '오늘 14:30', xp: '+50 XP' },
  { icon: '🔍', label: '오답노트 복습 완료', time: '오늘 16:48', xp: '+15 XP' },
  { icon: '🏆', label: '챌린지 달성', time: '오늘 21:00', xp: '+100 XP' },
  { icon: '📅', label: '일일 출석', time: '어제 08:05', xp: '+10 XP' },
  { icon: '✅', label: '문제 1세트 완료', time: '어제 10:14', xp: '+30 XP' },
  { icon: '📖', label: '단어 학습 1세트', time: '어제 14:22', xp: '+20 XP' },
];

export default function XPHistoryPage() {
  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="XP 획득 기록" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 gap-y-3"
        showsVerticalScrollIndicator={false}
      >
        {/* 오늘 획득 XP */}
        <View
          style={{
            backgroundColor: GREEN_LIGHT,
            borderWidth: 1,
            borderColor: GREEN_MID,
            borderRadius: 8,
            padding: 14,
          }}
        >
          <Text
            className="font-regular text-xs"
            style={{ color: GREEN, fontStyle: 'italic', marginBottom: 4 }}
          >
            오늘 획득 XP
          </Text>
          <Text className="font-semiBold text-btn-dark" style={{ fontSize: 28 }}>
            255 XP
          </Text>
        </View>

        {/* 기록 리스트 */}
        {records.map((r, i) => (
          <View
            key={i}
            style={{
              backgroundColor: '#fff',
              borderWidth: 0.5,
              borderColor: BORDER,
              borderRadius: 6,
              padding: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: BG,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 18 }}>{r.icon}</Text>
              </View>
              <View>
                <Text className="font-regular text-sm text-btn-dark">{r.label}</Text>
                <Text
                  className="font-regular text-text-brown"
                  style={{ fontSize: 10, marginTop: 2 }}
                >
                  {r.time}
                </Text>
              </View>
            </View>
            <Text className="font-semiBold text-sm" style={{ color: GREEN }}>
              {r.xp}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
