import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import { PRIVACY_POLICY_EFFECTIVE_DATE, privacyPolicySections } from '@/lib/legal/privacy-policy';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PrivacyPolicyPage() {
  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="개인정보처리방침" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pt-4 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <Text className="mb-2 font-bold text-base text-btn-dark">Qurve 개인정보처리방침</Text>
        <Text className="mb-4 text-xs leading-5 text-text-brown">
          QUAD는 이용자의 개인정보를 중요하게 생각하며 관련 법령과 Google Play 정책에 따라 안전하게
          처리합니다. 시행일: {PRIVACY_POLICY_EFFECTIVE_DATE}
        </Text>

        {privacyPolicySections.map((section) => (
          <View key={section.title} className="mb-3 rounded-sm border border-border bg-white p-4">
            <Text className="mb-2 font-bold text-sm text-btn-dark">{section.title}</Text>
            <View className="gap-2">
              {section.content.map((paragraph) => (
                <Text key={paragraph} className="text-xs leading-5 text-[#6B655D]">
                  {paragraph}
                </Text>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
