import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Calendar, type DateData, LocaleConfig } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';

LocaleConfig.locales.en = {
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  monthNames: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  monthNamesShort: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ],
  today: 'Today',
};
LocaleConfig.defaultLocale = 'en';

const CARD_ITEMS = [
  {
    id: 'wrong-note-1',
    title: 'JLPT N5 문자/어휘 Unit 1',
    studiedDate: '2026.05.02',
    reviewDate: '2026.05.06',
  },
  {
    id: 'wrong-note-2',
    title: 'JLPT N5 문자/어휘 Unit 1',
    studiedDate: '2026.05.02',
    reviewDate: '2026.05.06',
  },
];

const calendarCardShadowStyle = {
  shadowColor: '#000000',
  shadowOpacity: 0.04,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
} as const;

const noteCardShadowStyle = {
  shadowColor: '#000000',
  shadowOpacity: 0.04,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
} as const;

const calendarTheme = {
  textMonthFontSize: 12,
  textDayHeaderFontSize: 9,
  textDayFontSize: 12,
  textDayFontWeight: '600',
  dayTextColor: '#000000',
  textDisabledColor: '#A09080',
  selectedDayTextColor: '#FFFFFF',
  todayTextColor: '#4B5563',
  'stylesheet.calendar.main': {
    week: {
      marginTop: 10,
      marginBottom: 10,
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
  },
  'stylesheet.calendar.header': {
    header: {
      display: 'none',
    },
    dayHeader: {
      marginTop: 0,
      marginBottom: 20,
      width: 32,
      textAlign: 'center',
      fontSize: 11,
      fontWeight: '700',
      color: '#A8A092',
    },
    dayTextAtIndex5: {
      color: '#7ABDFF',
    },
    dayTextAtIndex6: {
      color: '#FF383C',
    },
  },
} as any;

export default function WrongNoteListPage() {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState('2026-06-01');
  const [selectedDate, setSelectedDate] = useState('2026-06-02');

  const markedDates: any = {
    [selectedDate]: {
      customStyles: {
        container: {
          width: 25,
          height: 25,
          borderRadius: 12.5,
          backgroundColor: '#2A2018',
          alignItems: 'center',
          justifyContent: 'center',
        },
        text: {
          color: '#FFFFFF',
          fontWeight: '700',
        },
      },
    },
  };

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  const handlePrevMonth = () => {
    const [yearString, monthString] = currentMonth.split('-');
    const baseYear = Number(yearString);
    const baseMonth = Number(monthString);
    const prevMonthDate = new Date(baseYear, baseMonth - 2, 1);
    const nextCurrentMonth = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}-01`;
    setCurrentMonth(nextCurrentMonth);
  };

  const handleNextMonth = () => {
    const [yearString, monthString] = currentMonth.split('-');
    const baseYear = Number(yearString);
    const baseMonth = Number(monthString);
    const nextMonthDate = new Date(baseYear, baseMonth, 1);
    const nextCurrentMonth = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}-01`;
    setCurrentMonth(nextCurrentMonth);
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="오답노트" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-3 flex-row items-center justify-between px-1">
          <Pressable onPress={handlePrevMonth}>
            <Text className="text-sm font-semibold text-text-brown">←</Text>
          </Pressable>
          <Text className="text-sm font-semibold text-text-brown">
            {currentMonth.slice(0, 7).replace('-', '.')}
          </Text>
          <Pressable onPress={handleNextMonth}>
            <Text className="text-sm font-semibold text-text-brown"> →</Text>
          </Pressable>
        </View>

        <View
          className="rounded-sm border border-border bg-white px-2 pb-2 pt-3"
          style={calendarCardShadowStyle}
        >
          <Calendar
            initialDate="2026-06-01"
            current={currentMonth}
            firstDay={1}
            markingType="custom"
            hideArrows
            hideExtraDays={false}
            disableAllTouchEventsForDisabledDays
            renderHeader={() => null}
            enableSwipeMonths
            markedDates={markedDates}
            onDayPress={handleDayPress}
            theme={calendarTheme}
            style={{
              borderRadius: 2,
              paddingBottom: 2,
            }}
          />
        </View>

        <Text className="py-3 text-xs text-text-brown">오답노트 목록</Text>

        {CARD_ITEMS.map((item) => (
          <Pressable
            key={item.id}
            className="mb-4 rounded-sm border border-border bg-white px-4 py-4"
            style={noteCardShadowStyle}
            onPress={() => router.push('/(app)/learning/wrong-note/detail')}
          >
            <Text className="font-bold text-xl text-black">{item.title}</Text>
            <Text className="mt-1 text-sm font-semibold text-text-brown">
              학습일: {item.studiedDate}
            </Text>
            <Text className="mt-[1px] text-sm font-semibold text-text-brown">
              복습일: {item.reviewDate}
            </Text>

            <View className="mt-5 self-end">
              <Text className="text-sm font-semibold text-text-gray">문제보기 →</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
