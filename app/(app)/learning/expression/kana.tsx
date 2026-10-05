import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type KanaMode = 'HIRAGANA' | 'KATAKANA';
type KanaCell = { character: string; reading: string } | null;
type KanaRow = { label: string; cells: KanaCell[] };

const hiraganaRows: KanaRow[] = [
  {
    label: 'あ행',
    cells: [
      { character: 'あ', reading: '아' },
      { character: 'い', reading: '이' },
      { character: 'う', reading: '우' },
      { character: 'え', reading: '에' },
      { character: 'お', reading: '오' },
    ],
  },
  {
    label: 'か행',
    cells: [
      { character: 'か', reading: '카' },
      { character: 'き', reading: '키' },
      { character: 'く', reading: '쿠' },
      { character: 'け', reading: '케' },
      { character: 'こ', reading: '코' },
    ],
  },
  {
    label: 'さ행',
    cells: [
      { character: 'さ', reading: '사' },
      { character: 'し', reading: '시' },
      { character: 'す', reading: '스' },
      { character: 'せ', reading: '세' },
      { character: 'そ', reading: '소' },
    ],
  },
  {
    label: 'た행',
    cells: [
      { character: 'た', reading: '타' },
      { character: 'ち', reading: '치' },
      { character: 'つ', reading: '츠' },
      { character: 'て', reading: '테' },
      { character: 'と', reading: '토' },
    ],
  },
  {
    label: 'な행',
    cells: [
      { character: 'な', reading: '나' },
      { character: 'に', reading: '니' },
      { character: 'ぬ', reading: '누' },
      { character: 'ね', reading: '네' },
      { character: 'の', reading: '노' },
    ],
  },
  {
    label: 'は행',
    cells: [
      { character: 'は', reading: '하' },
      { character: 'ひ', reading: '히' },
      { character: 'ふ', reading: '후' },
      { character: 'へ', reading: '헤' },
      { character: 'ほ', reading: '호' },
    ],
  },
  {
    label: 'ま행',
    cells: [
      { character: 'ま', reading: '마' },
      { character: 'み', reading: '미' },
      { character: 'む', reading: '무' },
      { character: 'め', reading: '메' },
      { character: 'も', reading: '모' },
    ],
  },
  {
    label: 'や행',
    cells: [
      { character: 'や', reading: '야' },
      null,
      { character: 'ゆ', reading: '유' },
      null,
      { character: 'よ', reading: '요' },
    ],
  },
  {
    label: 'ら행',
    cells: [
      { character: 'ら', reading: '라' },
      { character: 'り', reading: '리' },
      { character: 'る', reading: '루' },
      { character: 'れ', reading: '레' },
      { character: 'ろ', reading: '로' },
    ],
  },
  {
    label: 'わ행',
    cells: [
      { character: 'わ', reading: '와' },
      null,
      null,
      null,
      { character: 'を', reading: '오' },
    ],
  },
  { label: 'ん', cells: [{ character: 'ん', reading: '응/ㄴ' }, null, null, null, null] },
];

const katakanaRows: KanaRow[] = [
  {
    label: 'ア행',
    cells: [
      { character: 'ア', reading: '아' },
      { character: 'イ', reading: '이' },
      { character: 'ウ', reading: '우' },
      { character: 'エ', reading: '에' },
      { character: 'オ', reading: '오' },
    ],
  },
  {
    label: 'カ행',
    cells: [
      { character: 'カ', reading: '카' },
      { character: 'キ', reading: '키' },
      { character: 'ク', reading: '쿠' },
      { character: 'ケ', reading: '케' },
      { character: 'コ', reading: '코' },
    ],
  },
  {
    label: 'サ행',
    cells: [
      { character: 'サ', reading: '사' },
      { character: 'シ', reading: '시' },
      { character: 'ス', reading: '스' },
      { character: 'セ', reading: '세' },
      { character: 'ソ', reading: '소' },
    ],
  },
  {
    label: 'タ행',
    cells: [
      { character: 'タ', reading: '타' },
      { character: 'チ', reading: '치' },
      { character: 'ツ', reading: '츠' },
      { character: 'テ', reading: '테' },
      { character: 'ト', reading: '토' },
    ],
  },
  {
    label: 'ナ행',
    cells: [
      { character: 'ナ', reading: '나' },
      { character: 'ニ', reading: '니' },
      { character: 'ヌ', reading: '누' },
      { character: 'ネ', reading: '네' },
      { character: 'ノ', reading: '노' },
    ],
  },
  {
    label: 'ハ행',
    cells: [
      { character: 'ハ', reading: '하' },
      { character: 'ヒ', reading: '히' },
      { character: 'フ', reading: '후' },
      { character: 'ヘ', reading: '헤' },
      { character: 'ホ', reading: '호' },
    ],
  },
  {
    label: 'マ행',
    cells: [
      { character: 'マ', reading: '마' },
      { character: 'ミ', reading: '미' },
      { character: 'ム', reading: '무' },
      { character: 'メ', reading: '메' },
      { character: 'モ', reading: '모' },
    ],
  },
  {
    label: 'ヤ행',
    cells: [
      { character: 'ヤ', reading: '야' },
      null,
      { character: 'ユ', reading: '유' },
      null,
      { character: 'ヨ', reading: '요' },
    ],
  },
  {
    label: 'ラ행',
    cells: [
      { character: 'ラ', reading: '라' },
      { character: 'リ', reading: '리' },
      { character: 'ル', reading: '루' },
      { character: 'レ', reading: '레' },
      { character: 'ロ', reading: '로' },
    ],
  },
  {
    label: 'ワ행',
    cells: [
      { character: 'ワ', reading: '와' },
      null,
      null,
      null,
      { character: 'ヲ', reading: '오' },
    ],
  },
  { label: 'ン', cells: [{ character: 'ン', reading: '응/ㄴ' }, null, null, null, null] },
];

const vowelHeaders = ['a', 'i', 'u', 'e', 'o'];

export default function KanaChartPage() {
  const [mode, setMode] = useState<KanaMode>('HIRAGANA');
  const rows = mode === 'HIRAGANA' ? hiraganaRows : katakanaRows;

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="일본어 문자표" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 pb-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-4 flex-row gap-x-2">
          <Pressable
            className={`min-h-[44px] flex-1 items-center justify-center rounded-sm border ${
              mode === 'HIRAGANA' ? 'border-btn-dark bg-btn-dark' : 'border-border bg-white'
            }`}
            onPress={() => setMode('HIRAGANA')}
          >
            <Text
              className={`font-semiBold text-sm ${mode === 'HIRAGANA' ? 'text-white' : 'text-text-brown'}`}
            >
              히라가나
            </Text>
          </Pressable>
          <Pressable
            className={`min-h-[44px] flex-1 items-center justify-center rounded-sm border ${
              mode === 'KATAKANA' ? 'border-btn-dark bg-btn-dark' : 'border-border bg-white'
            }`}
            onPress={() => setMode('KATAKANA')}
          >
            <Text
              className={`font-semiBold text-sm ${mode === 'KATAKANA' ? 'text-white' : 'text-text-brown'}`}
            >
              가타카나
            </Text>
          </Pressable>
        </View>

        <View className="overflow-hidden rounded-sm border border-border bg-white">
          <View className="flex-row border-b border-border bg-[#F4F1EA]">
            <View className="w-12 items-center justify-center border-r border-border py-2">
              <Text className="font-semiBold text-xs text-text-brown">행</Text>
            </View>
            {vowelHeaders.map((header) => (
              <View key={header} className="flex-1 items-center justify-center py-2">
                <Text className="font-semiBold text-xs text-text-brown">{header}</Text>
              </View>
            ))}
          </View>

          {rows.map((row, rowIndex) => (
            <View
              key={row.label}
              className={`flex-row ${rowIndex < rows.length - 1 ? 'border-b border-border' : ''}`}
            >
              <View className="w-12 items-center justify-center border-r border-border bg-[#FAF8F3] px-1 py-3">
                <Text className="font-semiBold text-center text-xs text-text-brown">
                  {row.label}
                </Text>
              </View>
              {row.cells.map((cell, cellIndex) => (
                <View
                  key={`${row.label}-${cellIndex}`}
                  className={`min-h-[64px] flex-1 items-center justify-center px-0.5 py-2 ${
                    cellIndex < row.cells.length - 1 ? 'border-r border-border' : ''
                  }`}
                >
                  {cell ? (
                    <>
                      <Text className="font-regular text-xl text-btn-dark">{cell.character}</Text>
                      <Text
                        className="mt-0.5 text-center font-regular text-[10px] text-[#A09080]"
                        adjustsFontSizeToFit
                        minimumFontScale={0.75}
                        numberOfLines={1}
                      >
                        {cell.reading}
                      </Text>
                    </>
                  ) : null}
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
