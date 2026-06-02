import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, Switch, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GREEN = '#059669';
const GREEN_LIGHT = '#ECFDF5';
const GREEN_MID = '#A7F3D0';

const StepBar = ({ step }: { step: number }) => (
  <View className="flex-row px-4 pb-2 pt-3">
    {['목표 선택', '목표 설정', '확인 및 등록'].map((label, i) => (
      <View key={i} className="flex-1 items-center gap-y-1">
        <View
          style={{
            width: '100%',
            height: 3,
            backgroundColor: i < step ? GREEN : '#E0D8C8',
            borderTopLeftRadius: i === 0 ? 2 : 0,
            borderBottomLeftRadius: i === 0 ? 2 : 0,
            borderTopRightRadius: i === 2 ? 2 : 0,
            borderBottomRightRadius: i === 2 ? 2 : 0,
          }}
        />
        <Text style={{ fontSize: 9, color: i < step ? GREEN : '#A09080' }}>{label}</Text>
      </View>
    ))}
  </View>
);

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];
const getDayName = (date: Date) => DAY_NAMES[date.getDay()];
const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}.${m}.${d} (${getDayName(date)})`;
};

const CalendarModal = ({
  visible,
  onClose,
  onSelect,
  title,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (date: Date) => void;
  title: string;
}) => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<Date | null>(null);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable className="flex-1 items-center justify-center bg-black/40" onPress={onClose}>
        <Pressable
          className="w-[320px] rounded-lg border border-border bg-white p-5"
          onPress={() => {}}
        >
          <Text className="font-semiBold mb-4 text-center text-base text-btn-dark">{title}</Text>
          <View className="mb-3 flex-row items-center justify-between">
            <Pressable onPress={prevMonth} className="px-3 py-1">
              <Text className="font-regular text-base text-text-brown">‹</Text>
            </Pressable>
            <Text className="font-semiBold text-sm text-btn-dark">
              {year}년 {month + 1}월
            </Text>
            <Pressable onPress={nextMonth} className="px-3 py-1">
              <Text className="font-regular text-base text-text-brown">›</Text>
            </Pressable>
          </View>
          <View className="mb-1 flex-row">
            {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
              <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                <Text
                  style={{
                    fontSize: 11,
                    color: i === 0 ? '#CC4444' : i === 6 ? '#4466CC' : '#A09080',
                  }}
                >
                  {d}
                </Text>
              </View>
            ))}
          </View>
          <View className="flex-row flex-wrap">
            {cells.map((d, i) => {
              if (!d) return <View key={i} style={{ width: `${100 / 7}%`, height: 36 }} />;
              const date = new Date(year, month, d);
              const isSel = selected && selected.getTime() === date.getTime();
              const dow = i % 7;
              return (
                <Pressable
                  key={i}
                  style={{
                    width: `${100 / 7}%`,
                    height: 36,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => setSelected(date)}
                >
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: isSel ? GREEN : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        color: isSel
                          ? '#fff'
                          : dow === 0
                            ? '#CC4444'
                            : dow === 6
                              ? '#4466CC'
                              : '#2A2018',
                      }}
                    >
                      {d}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
          <View className="mt-4 flex-row gap-x-2.5">
            <Pressable
              className="flex-1 items-center rounded-sm border border-border py-3"
              onPress={onClose}
            >
              <Text className="font-regular text-sm text-btn-dark">취소</Text>
            </Pressable>
            <Pressable
              className="flex-1 items-center rounded-sm py-3"
              style={{ backgroundColor: selected ? GREEN : '#C8C0B0' }}
              onPress={() => {
                if (selected) {
                  onSelect(selected);
                  onClose();
                }
              }}
            >
              <Text className="font-semiBold text-sm text-white">확인</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const days = ['월', '화', '수', '목', '금', '토', '일'];
const timeOptions = ['15분', '30분', '60분', '90분', '직접 입력'];
const timeValues = [15, 30, 60, 90];

export default function CreateGoalSettingsPage() {
  const router = useRouter();
  const [minutes, setMinutes] = useState(30);
  const [selectedTimeIdx, setSelectedTimeIdx] = useState(1);
  const [customTimeModal, setCustomTimeModal] = useState(false);
  const [customTimeInput, setCustomTimeInput] = useState('');
  const [selectedDays, setSelectedDays] = useState([0, 1, 2, 3, 4, 5, 6]);
  const [alarmOn, setAlarmOn] = useState(true);
  const [alarmHour, setAlarmHour] = useState(20);
  const [alarmMinute, setAlarmMinute] = useState(0);
  const [alarmModal, setAlarmModal] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(2026, 11, 3));
  const [dateModal, setDateModal] = useState<'start' | 'end' | null>(null);

  const handleTimeOption = (i: number) => {
    setSelectedTimeIdx(i);
    if (i < 4) setMinutes(timeValues[i]);
    else setCustomTimeModal(true);
  };

  const handleMinus = () => {
    const newVal = minutes === 30 ? 15 : Math.max(15, minutes - 30);
    setMinutes(newVal);
    const idx = timeValues.indexOf(newVal);
    setSelectedTimeIdx(idx !== -1 ? idx : 4);
  };

  const handlePlus = () => {
    const newVal = minutes === 15 ? 30 : minutes + 30;
    setMinutes(newVal);
    const idx = timeValues.indexOf(newVal);
    setSelectedTimeIdx(idx !== -1 ? idx : 4);
  };

  const toggleDay = (i: number) => {
    setSelectedDays((prev) => (prev.includes(i) ? prev.filter((d) => d !== i) : [...prev, i]));
  };

  const alarmLabel = `오${alarmHour < 12 ? '전' : '후'} ${alarmHour === 0 ? 12 : alarmHour <= 12 ? alarmHour : alarmHour - 12}:${alarmMinute.toString().padStart(2, '0')}`;

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="챌린지 추가" />
      <StepBar step={2} />
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 gap-y-5"
        showsVerticalScrollIndicator={false}
      >
        <View
          className="flex-row items-center gap-x-3 rounded-lg p-4"
          style={{ backgroundColor: GREEN_LIGHT, borderWidth: 1.5, borderColor: GREEN_MID }}
        >
          <Text style={{ fontSize: 22 }}>🔥</Text>
          <View>
            <Text className="font-semiBold text-sm text-btn-dark">하루 학습 시간</Text>
            <Text className="font-regular text-xs text-text-brown">매일 일정 시간 학습하기</Text>
          </View>
        </View>

        <View>
          <Text className="font-semiBold mb-1 text-base text-btn-dark">목표 설정</Text>
          <Text className="mb-3.5 font-regular text-sm text-text-brown">
            달성하고 싶은 목표를 설정해 보세요.
          </Text>
          <View className="mb-2.5 flex-row items-center justify-between rounded-sm border border-border bg-white px-4 py-3">
            <Text className="font-regular text-sm text-btn-dark">하루 목표 시간</Text>
            <View className="flex-row items-center gap-x-3">
              <Pressable
                style={{
                  height: 28,
                  width: 28,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 4,
                  borderWidth: 0.5,
                  borderColor: '#E0D8C8',
                }}
                onPress={handleMinus}
              >
                <Text className="font-regular text-sm text-text-brown">−</Text>
              </Pressable>
              <Text className="font-semiBold text-sm text-btn-dark">{minutes}분</Text>
              <Pressable
                style={{
                  height: 28,
                  width: 28,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 4,
                  borderWidth: 0.5,
                  borderColor: '#E0D8C8',
                }}
                onPress={handlePlus}
              >
                <Text className="font-regular text-sm text-text-brown">+</Text>
              </Pressable>
            </View>
          </View>
          <View className="flex-row gap-x-1.5">
            {timeOptions.map((t, i) => (
              <Pressable
                key={i}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: 7,
                  borderRadius: 4,
                  backgroundColor: selectedTimeIdx === i ? GREEN : '#F5F3EE',
                  borderWidth: 0.5,
                  borderColor: selectedTimeIdx === i ? GREEN : '#E0D8C8',
                }}
                onPress={() => handleTimeOption(i)}
              >
                <Text
                  style={{
                    fontSize: i === 4 ? 9 : 11,
                    color: selectedTimeIdx === i ? '#fff' : '#A09080',
                  }}
                >
                  {t}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View>
          <Text className="font-semiBold mb-3 text-sm text-btn-dark">챌린지 기간</Text>
          {(
            [
              ['시작일', formatDate(startDate), 'start'],
              ['종료일', formatDate(endDate), 'end'],
            ] as const
          ).map(([label, val, type]) => (
            <Pressable
              key={type}
              className="mb-2 flex-row items-center justify-between rounded-sm border border-border bg-white px-4 py-3"
              onPress={() => setDateModal(type)}
            >
              <View className="flex-row items-center gap-x-2">
                <Text style={{ fontSize: 14 }}>📅</Text>
                <Text className="font-regular text-sm text-text-brown">{label}</Text>
              </View>
              <Text className="font-regular text-sm text-btn-dark">{val}</Text>
            </Pressable>
          ))}
        </View>

        <View>
          <Text className="font-semiBold mb-3 text-sm text-btn-dark">반복 설정</Text>
          <View className="flex-row gap-x-1.5">
            {days.map((d, i) => (
              <Pressable
                key={i}
                style={{
                  flex: 1,
                  height: 32,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 4,
                  backgroundColor: selectedDays.includes(i) ? GREEN : '#F5F3EE',
                  borderWidth: 0.5,
                  borderColor: selectedDays.includes(i) ? GREEN : '#E0D8C8',
                }}
                onPress={() => toggleDay(i)}
              >
                <Text
                  style={{ fontSize: 12, color: selectedDays.includes(i) ? '#fff' : '#A09080' }}
                >
                  {d}
                </Text>
              </Pressable>
            ))}
            <Pressable
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 4,
                paddingHorizontal: 8,
                backgroundColor: selectedDays.length === 7 ? GREEN : '#F5F3EE',
                borderWidth: 0.5,
                borderColor: selectedDays.length === 7 ? GREEN : '#E0D8C8',
              }}
              onPress={() =>
                setSelectedDays((prev) => (prev.length === 7 ? [] : [0, 1, 2, 3, 4, 5, 6]))
              }
            >
              <Text style={{ fontSize: 11, color: selectedDays.length === 7 ? '#fff' : '#A09080' }}>
                매일
              </Text>
            </Pressable>
          </View>
        </View>

        <View>
          <Text className="font-semiBold mb-3 text-sm text-btn-dark">알림 설정</Text>
          <View className="rounded-sm border border-border bg-white px-4 py-3">
            <View className="mb-2.5 flex-row items-center justify-between">
              <View className="flex-row items-center gap-x-2">
                <Text style={{ fontSize: 14 }}>🔔</Text>
                <Text className="font-regular text-sm text-btn-dark">학습 시간 알림 받기</Text>
              </View>
              <Switch
                value={alarmOn}
                onValueChange={setAlarmOn}
                trackColor={{ false: '#E0D8C8', true: GREEN }}
                thumbColor="#fff"
              />
            </View>
            <Pressable
              className="flex-row items-center justify-between"
              onPress={() => setAlarmModal(true)}
            >
              <Text className="font-regular text-xs text-text-brown">알림 시간</Text>
              <Text className="font-regular text-sm text-btn-dark">{alarmLabel}</Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          style={{
            backgroundColor: GREEN,
            borderRadius: 8,
            paddingVertical: 16,
            alignItems: 'center',
          }}
          onPress={() =>
            router.push({
              pathname: '/(app)/mypage/challenge/create-confirm',
              params: {
                startDate: formatDate(startDate),
                endDate: formatDate(endDate),
                minutes: String(minutes),
                days: selectedDays.join(','),
                alarmTime: alarmLabel,
              },
            })
          }
        >
          <Text className="font-semiBold text-sm text-white">확인하기</Text>
        </Pressable>
      </ScrollView>

      <CalendarModal
        visible={dateModal !== null}
        onClose={() => setDateModal(null)}
        title={dateModal === 'start' ? '시작일 선택' : '종료일 선택'}
        onSelect={(date) => {
          if (dateModal === 'start') setStartDate(date);
          else setEndDate(date);
        }}
      />

      <Modal visible={customTimeModal} transparent animationType="fade">
        <Pressable
          className="flex-1 items-center justify-center bg-black/40"
          onPress={() => setCustomTimeModal(false)}
        >
          <Pressable
            className="w-[280px] rounded-lg border border-border bg-white p-6"
            onPress={() => {}}
          >
            <Text className="font-semiBold mb-3 text-base text-btn-dark">목표 시간 입력</Text>
            <TextInput
              style={{
                height: 44,
                borderWidth: 1,
                borderColor: '#E0D8C8',
                borderRadius: 4,
                backgroundColor: '#F5F3EE',
                paddingHorizontal: 12,
                fontSize: 14,
                color: '#2A2018',
              }}
              placeholder="분 단위로 입력 (예: 45)"
              placeholderTextColor="#C0B8B0"
              keyboardType="numeric"
              value={customTimeInput}
              onChangeText={setCustomTimeInput}
            />
            <View className="mt-4 flex-row gap-x-2.5">
              <Pressable
                className="flex-1 items-center rounded-sm border border-border py-3"
                onPress={() => setCustomTimeModal(false)}
              >
                <Text className="font-regular text-sm text-btn-dark">취소</Text>
              </Pressable>
              <Pressable
                className="flex-1 items-center rounded-sm py-3"
                style={{ backgroundColor: GREEN }}
                onPress={() => {
                  const m = parseInt(customTimeInput);
                  if (m > 0) {
                    setMinutes(m);
                    const idx = timeValues.indexOf(m);
                    setSelectedTimeIdx(idx !== -1 ? idx : 4);
                  }
                  setCustomTimeModal(false);
                }}
              >
                <Text className="font-semiBold text-sm text-white">확인</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={alarmModal} transparent animationType="fade">
        <Pressable
          className="flex-1 items-center justify-center bg-black/40"
          onPress={() => setAlarmModal(false)}
        >
          <Pressable
            className="w-[280px] rounded-lg border border-border bg-white p-6"
            onPress={() => {}}
          >
            <Text className="font-semiBold mb-3 text-base text-btn-dark">알림 시간 설정</Text>
            <View className="flex-row gap-x-2">
              <View className="flex-1">
                <Text className="mb-1.5 font-regular text-xs text-text-brown">시 (0-23)</Text>
                <TextInput
                  style={{
                    height: 44,
                    borderWidth: 1,
                    borderColor: '#E0D8C8',
                    borderRadius: 4,
                    backgroundColor: '#F5F3EE',
                    paddingHorizontal: 12,
                    fontSize: 14,
                    color: '#2A2018',
                  }}
                  keyboardType="numeric"
                  value={String(alarmHour)}
                  onChangeText={(v) => {
                    const n = parseInt(v);
                    if (!isNaN(n) && n >= 0 && n <= 23) setAlarmHour(n);
                  }}
                />
              </View>
              <View className="flex-1">
                <Text className="mb-1.5 font-regular text-xs text-text-brown">분 (0-59)</Text>
                <TextInput
                  style={{
                    height: 44,
                    borderWidth: 1,
                    borderColor: '#E0D8C8',
                    borderRadius: 4,
                    backgroundColor: '#F5F3EE',
                    paddingHorizontal: 12,
                    fontSize: 14,
                    color: '#2A2018',
                  }}
                  keyboardType="numeric"
                  value={String(alarmMinute)}
                  onChangeText={(v) => {
                    const n = parseInt(v);
                    if (!isNaN(n) && n >= 0 && n <= 59) setAlarmMinute(n);
                  }}
                />
              </View>
            </View>
            <View className="mt-4 flex-row gap-x-2.5">
              <Pressable
                className="flex-1 items-center rounded-sm border border-border py-3"
                onPress={() => setAlarmModal(false)}
              >
                <Text className="font-regular text-sm text-btn-dark">취소</Text>
              </Pressable>
              <Pressable
                className="flex-1 items-center rounded-sm py-3"
                style={{ backgroundColor: GREEN }}
                onPress={() => setAlarmModal(false)}
              >
                <Text className="font-semiBold text-sm text-white">확인</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
