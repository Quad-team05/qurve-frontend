import TopBar from '@/components/ui/TopBar';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const sections = [
  {
    title: '이용약관',
    content: [
      '1. 본 서비스는 학습 보조 및 기록 관리를 위한 모바일 서비스입니다.',
      '2. 회원은 정확한 정보를 입력해야 하며, 계정 정보 관리 책임은 회원 본인에게 있습니다.',
      '3. 서비스 운영을 방해하거나 타인의 권리를 침해하는 행위는 제한될 수 있습니다.',
      '4. 회사는 안정적인 서비스 제공을 위해 점검, 업데이트, 정책 변경을 진행할 수 있습니다.',
      '5. 관련 법령 또는 정책 위반 시 서비스 이용이 제한될 수 있습니다.',
    ],
  },
  {
    title: '개인정보 수집 및 이용 동의',
    content: [
      '1. 수집 항목: 아이디, 비밀번호, 이름, 닉네임, 이메일',
      '2. 수집 목적: 회원 식별, 서비스 제공, 문의 대응, 공지 전달',
      '3. 보유 기간: 회원 탈퇴 시까지(관계 법령에 따라 별도 보관 가능)',
      '4. 이용자는 개인정보 수집·이용 동의를 거부할 권리가 있습니다.',
      '5. 단, 필수 항목 동의 거부 시 회원가입 및 서비스 이용이 제한될 수 있습니다.',
    ],
  },
  {
    title: '마케팅 정보 수신 동의(선택)',
    content: [
      '1. 이벤트, 프로모션, 신규 기능 안내를 위한 정보가 발송될 수 있습니다.',
      '2. 수신 채널: 이메일 등 서비스에서 제공하는 알림 수단',
      '3. 동의하지 않아도 서비스 기본 이용에는 제한이 없습니다.',
      '4. 수신 동의 후에도 설정 또는 고객 문의를 통해 언제든 철회할 수 있습니다.',
    ],
  },
];

export default function TermsPage() {
  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="약관 확인" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pt-4 pb-8"
        showsVerticalScrollIndicator={false}
      >
        <Text className="mb-3 text-xs text-[#8C877D]">
          회원가입 전 아래 약관 내용을 확인해 주세요.
        </Text>

        {sections.map((section) => (
          <View key={section.title} className="mb-4 border border-border bg-white p-4">
            <Text className="mb-3 text-base font-bold text-btn-dark">{section.title}</Text>

            <View className="gap-2">
              {section.content.map((line) => (
                <Text key={line} className="text-sm leading-6 text-[#6B655D]">
                  {line}
                </Text>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
