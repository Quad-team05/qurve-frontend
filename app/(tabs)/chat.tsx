import Text from '@/components/ui/AppText';
import { clearAiChat, sendAiChatMessage } from '@/lib/api/ai';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

const GREEN = '#059669';
const GREEN_LIGHT = '#ECFDF5';
const GREEN_MID = '#A7F3D0';
const TEXT = '#2A2018';
const TEXT3 = '#A09080';
const BORDER = '#E0D8C8';

type Message = { role: 'ai' | 'user'; text: string };

const RobotIcon = ({ size = 24, color = '#2A2018' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M4 6h16v2H4zm0 14h16v2H4zM2 8h2v12H2zm18 0h2v12h-2z" fill={color} />
    <Path
      d="M11 4h2v4h-2zm-3 6h2v2H8zm6 0h2v2h-2zm-1-8h4v2h-4zM0 12h2v2H0zm22 0h2v2h-2zM7 14h10v2H7zm2 2h6v2H9z"
      fill={color}
    />
  </Svg>
);

const suggestions = [
  { icon: '📝', label: '오늘 틀린 문제 다시 설명해줘' },
  { icon: '💡', label: '단어 빠르게 외우는 방법이 있어?' },
  { icon: '📅', label: 'JLPT N5 시험 언제야?' },
  { icon: '🎯', label: '내 학습 패턴 분석해줘' },
];

const chipSuggestions = ['오늘 학습 피드백', '틀린 문제 설명', '단어 외우는 팁', 'JLPT 시험 정보'];

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const hasMessages = messages.length > 0;

  const sendMessage = async (text: string) => {
    if (!text.trim() || isSending) return;

    const userMsg: Message = { role: 'user', text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      setIsSending(true);
      const result = await sendAiChatMessage(text.trim());
      const aiMsg: Message = { role: 'ai', text: result.message };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: Message = {
        role: 'ai',
        text: '죄송해요, 지금은 답변할 수 없어요. 잠시 후 다시 시도해주세요.',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const resetChat = async () => {
    setMessages([]);
    try {
      await clearAiChat();
    } catch {
      // 초기화 실패해도 화면상으로는 이미 비워졌으니 조용히 무시
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      {/* 헤더 */}
      <View className="border-b border-border bg-bg px-4 pb-3 pt-2">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-x-2.5">
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: GREEN_LIGHT,
                borderWidth: 1,
                borderColor: GREEN_MID,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RobotIcon size={22} color={TEXT} />
            </View>
            <View>
              <Text className="font-semiBold text-sm text-btn-dark">QURVE AI</Text>
              <View className="flex-row items-center gap-x-1">
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: GREEN }} />
                <Text className="font-regular" style={{ fontSize: 10, color: GREEN }}>
                  온라인
                </Text>
              </View>
            </View>
          </View>
          {hasMessages && (
            <Pressable onPress={resetChat}>
              <Text className="font-regular text-xs text-text-brown">대화 초기화</Text>
            </Pressable>
          )}
        </View>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {!hasMessages ? (
          <ScrollView
            className="flex-1"
            contentContainerClassName="p-4"
            showsVerticalScrollIndicator={false}
          >
            <View className="mb-6 items-center rounded-sm border border-border bg-white px-6 py-10">
              <RobotIcon size={72} color={TEXT} />
              <Text className="font-semiBold mb-2 mt-4 text-base text-btn-dark">
                QURVE AI 학습 코치
              </Text>
              <Text className="text-center font-regular text-xs text-text-brown">
                학습 관련 질문을 자유롭게 물어봐요!{'\n'}단어, 문법, 시험 정보 뭐든지 OK
              </Text>
            </View>

            <Text className="mb-3 text-center font-regular text-xs text-text-brown">
              이런 걸 물어볼 수 있어요
            </Text>

            {suggestions.map((s, i) => (
              <Pressable
                key={i}
                className="mb-2.5 flex-row items-center justify-between rounded-sm border border-border bg-white px-4 py-4"
                onPress={() => sendMessage(s.label)}
              >
                <View className="flex-row items-center gap-x-3">
                  <Text style={{ fontSize: 16 }}>{s.icon}</Text>
                  <Text className="font-regular text-sm text-btn-dark">{s.label}</Text>
                </View>
                <Text className="font-regular text-sm text-text-brown">→</Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : (
          <ScrollView
            ref={scrollRef}
            className="flex-1"
            contentContainerClassName="p-4 gap-y-4"
            showsVerticalScrollIndicator={false}
          >
            {/* 첫 AI 메시지 + 추천 칩 */}
            <View className="flex-row items-start gap-x-2.5">
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: GREEN_LIGHT,
                  borderWidth: 1,
                  borderColor: GREEN_MID,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <RobotIcon size={20} color={TEXT} />
              </View>
              <View style={{ maxWidth: '75%' }}>
                <View style={{ position: 'relative', marginTop: 8 }}>
                  <View
                    style={{
                      position: 'absolute',
                      top: -8,
                      left: '35%',
                      width: 40,
                      height: 13,
                      backgroundColor: '#B8D4F0',
                      opacity: 0.78,
                      borderRadius: 2,
                      zIndex: 1,
                    }}
                  />
                  <View
                    style={{
                      backgroundColor: '#fff',
                      borderWidth: 0.5,
                      borderColor: BORDER,
                      borderTopRightRadius: 8,
                      borderBottomRightRadius: 8,
                      borderBottomLeftRadius: 8,
                      padding: 12,
                    }}
                  >
                    <Text className="font-regular text-sm text-btn-dark" style={{ lineHeight: 20 }}>
                      안녕하세요! 🔥{'\n'}오늘 학습 어떠셨나요? 궁금한 점이 있으면 편하게 물어봐요!
                    </Text>
                  </View>
                </View>
                <Text className="mb-1.5 mt-2 font-regular" style={{ fontSize: 10, color: TEXT3 }}>
                  이런 걸 물어볼 수 있어요
                </Text>
                <View className="flex-row flex-wrap gap-1.5">
                  {chipSuggestions.map((chip, i) => (
                    <Pressable
                      key={i}
                      style={{
                        borderRadius: 16,
                        borderWidth: 0.5,
                        borderColor: BORDER,
                        backgroundColor: '#fff',
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                      }}
                      onPress={() => sendMessage(chip)}
                    >
                      <Text className="font-regular text-xs text-text-brown">{chip}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>

            {/* 메시지들 */}
            {messages.map((msg, i) =>
              msg.role === 'user' ? (
                <View key={i} className="items-end">
                  <View style={{ maxWidth: '75%', position: 'relative', marginTop: 8 }}>
                    <View
                      style={{
                        position: 'absolute',
                        top: -8,
                        right: '30%',
                        width: 40,
                        height: 13,
                        backgroundColor: '#FFE566',
                        opacity: 0.78,
                        borderRadius: 2,
                        zIndex: 1,
                      }}
                    />
                    <View
                      style={{
                        backgroundColor: '#2A2018',
                        borderRadius: 8,
                        borderTopRightRadius: 2,
                        padding: 12,
                      }}
                    >
                      <Text className="font-regular text-sm text-white" style={{ lineHeight: 20 }}>
                        {msg.text}
                      </Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View key={i} className="flex-row items-start gap-x-2.5">
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: GREEN_LIGHT,
                      borderWidth: 1,
                      borderColor: GREEN_MID,
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <RobotIcon size={20} color={TEXT} />
                  </View>
                  <View style={{ maxWidth: '75%', position: 'relative', marginTop: 8 }}>
                    <View
                      style={{
                        position: 'absolute',
                        top: -8,
                        left: '35%',
                        width: 40,
                        height: 13,
                        backgroundColor: '#F9C8D8',
                        opacity: 0.78,
                        borderRadius: 2,
                        zIndex: 1,
                      }}
                    />
                    <View
                      style={{
                        backgroundColor: '#fff',
                        borderWidth: 0.5,
                        borderColor: BORDER,
                        borderTopRightRadius: 8,
                        borderBottomRightRadius: 8,
                        borderBottomLeftRadius: 8,
                        padding: 12,
                      }}
                    >
                      <Text
                        className="font-regular text-sm text-btn-dark"
                        style={{ lineHeight: 20 }}
                      >
                        {msg.text}
                      </Text>
                    </View>
                  </View>
                </View>
              ),
            )}

            {isSending && (
              <View className="flex-row items-start gap-x-2.5">
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: GREEN_LIGHT,
                    borderWidth: 1,
                    borderColor: GREEN_MID,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <RobotIcon size={20} color={TEXT} />
                </View>
                <View
                  style={{
                    backgroundColor: '#fff',
                    borderWidth: 0.5,
                    borderColor: BORDER,
                    borderTopRightRadius: 8,
                    borderBottomRightRadius: 8,
                    borderBottomLeftRadius: 8,
                    padding: 12,
                    marginTop: 8,
                  }}
                >
                  <Text className="font-regular text-sm text-text-brown">
                    답변을 준비 중이에요...
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        )}

        {/* 입력창 */}
        <View className="flex-row items-center gap-x-2.5 border-t border-border bg-bg px-4 py-3">
          <TextInput
            style={{
              flex: 1,
              height: 40,
              backgroundColor: hasMessages ? '#fff' : '#EDEBE8',
              borderWidth: 0.5,
              borderColor: BORDER,
              borderRadius: 20,
              paddingHorizontal: 16,
              fontSize: 13,
              color: TEXT,
            }}
            placeholder="궁금한 점을 물어봐요..."
            placeholderTextColor={TEXT3}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => sendMessage(input)}
            editable={!isSending}
          />
          <Pressable
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: input.trim() && !isSending ? '#2A2018' : '#C8C0B0',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => sendMessage(input)}
            disabled={isSending}
          >
            <Text style={{ color: '#fff', fontSize: 16 }}>↑</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
