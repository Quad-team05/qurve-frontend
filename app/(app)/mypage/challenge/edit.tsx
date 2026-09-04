import Text from '@/components/ui/AppText';
import ConfirmModal from '@/components/ui/ConfirmModal';
import TopBar from '@/components/ui/TopBar';
import {
  CHALLENGE_GOAL_TYPE_LABELS,
  CHALLENGE_GOAL_TYPE_TARGET_LABELS,
  CHALLENGE_GOAL_TYPE_TARGET_UNITS,
  deleteChallenge,
  updateChallenge,
  type ChallengeGoalTypeCode,
} from '@/lib/api/challenge';
import { ApiError } from '@/lib/api/client';
import { clearAuthSession } from '@/lib/auth/session';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  ToastAndroid,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GREEN = '#059669';
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function showToast(message: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
    return;
  }

  Alert.alert(message);
}

function parseDate(value: string) {
  if (!DATE_PATTERN.test(value)) return null;

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return date;
}

function normalizeParam(value?: string | string[]) {
  if (Array.isArray(value)) return value[0];
  return value ?? '';
}

export default function ChallengeEditPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    challengeId?: string | string[];
    title?: string | string[];
    goalType?: ChallengeGoalTypeCode | ChallengeGoalTypeCode[];
    targetValue?: string | string[];
    startDate?: string | string[];
    endDate?: string | string[];
  }>();
  const challengeId = Number(normalizeParam(params.challengeId));
  const goalType = normalizeParam(params.goalType) as ChallengeGoalTypeCode;
  const targetLabel = CHALLENGE_GOAL_TYPE_TARGET_LABELS[goalType] ?? '목표값';
  const targetUnit = CHALLENGE_GOAL_TYPE_TARGET_UNITS[goalType] ?? '';
  const [title, setTitle] = useState(normalizeParam(params.title));
  const [targetValue, setTargetValue] = useState(normalizeParam(params.targetValue));
  const [startDate, setStartDate] = useState(normalizeParam(params.startDate));
  const [endDate, setEndDate] = useState(normalizeParam(params.endDate));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const validate = () => {
    const trimmedTitle = title.trim();
    const parsedTargetValue = Number(targetValue);
    const parsedStartDate = parseDate(startDate.trim());
    const parsedEndDate = parseDate(endDate.trim());

    if (!Number.isFinite(challengeId) || challengeId <= 0) {
      showToast('챌린지 정보를 확인할 수 없습니다.');
      return null;
    }

    if (!trimmedTitle) {
      showToast('챌린지 제목을 입력해주세요.');
      return null;
    }

    if (trimmedTitle.length > 50) {
      showToast('챌린지 제목은 50자 이하로 입력해주세요.');
      return null;
    }

    if (!Number.isInteger(parsedTargetValue) || parsedTargetValue < 1) {
      showToast('목표값은 1 이상의 정수로 입력해주세요.');
      return null;
    }

    if (!parsedStartDate || !parsedEndDate) {
      showToast('날짜는 YYYY-MM-DD 형식으로 입력해주세요.');
      return null;
    }

    if (parsedEndDate.getTime() < parsedStartDate.getTime()) {
      showToast('종료일은 시작일보다 빠를 수 없습니다.');
      return null;
    }

    return {
      title: trimmedTitle,
      targetValue: parsedTargetValue,
      startDate: startDate.trim(),
      endDate: endDate.trim(),
    };
  };

  const handleAuthError = async () => {
    showToast('로그인이 필요합니다.');
    await clearAuthSession();
    router.replace('/(app)/auth/login');
  };

  const handleSubmit = async () => {
    const request = validate();
    if (!request || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await updateChallenge(challengeId, request);
      showToast('챌린지가 수정되었습니다.');
      router.replace('/(app)/mypage/challenge');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await handleAuthError();
        return;
      }

      showToast(error instanceof ApiError ? error.message : '챌린지 수정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!Number.isFinite(challengeId) || challengeId <= 0 || isDeleting) return;
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!Number.isFinite(challengeId) || challengeId <= 0 || isDeleting) return;

    try {
      setIsDeleting(true);
      await deleteChallenge(challengeId);
      showToast('챌린지가 삭제되었습니다.');
      setDeleteModalVisible(false);
      router.replace('/(app)/mypage/challenge');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await handleAuthError();
        return;
      }

      showToast(error instanceof ApiError ? error.message : '챌린지 삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="챌린지 수정" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-y-4 p-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="rounded-sm border border-border bg-white p-4">
          <Text className="mb-1 font-regular text-xs text-text-brown">목표 유형</Text>
          <Text className="font-semiBold text-base text-btn-dark">
            {CHALLENGE_GOAL_TYPE_LABELS[goalType] ?? goalType}
          </Text>
          <Text className="mt-1 font-regular text-xs text-text-brown">
            목표 유형은 수정할 수 없습니다.
          </Text>
        </View>

        <View>
          <Text className="font-semiBold mb-2 text-sm text-btn-dark">챌린지 제목</Text>
          <TextInput
            className="rounded-sm border border-border bg-white px-4 py-3 font-regular text-sm text-btn-dark"
            maxLength={50}
            value={title}
            onChangeText={setTitle}
            placeholder="챌린지 제목"
            placeholderTextColor="#C0B8B0"
          />
          <Text className="mt-1 text-right font-regular text-xs text-text-brown">
            {title.length}/50
          </Text>
        </View>

        <View>
          <Text className="font-semiBold mb-2 text-sm text-btn-dark">{targetLabel}</Text>
          <TextInput
            className="rounded-sm border border-border bg-white px-4 py-3 font-regular text-sm text-btn-dark"
            value={targetValue}
            onChangeText={(value) => setTargetValue(value.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
            placeholder={targetUnit ? `1 이상의 정수 (${targetUnit})` : '1 이상의 정수'}
            placeholderTextColor="#C0B8B0"
          />
        </View>

        <View className="flex-row gap-x-3">
          <View className="flex-1">
            <Text className="font-semiBold mb-2 text-sm text-btn-dark">시작일</Text>
            <TextInput
              className="rounded-sm border border-border bg-white px-4 py-3 font-regular text-sm text-btn-dark"
              value={startDate}
              onChangeText={setStartDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#C0B8B0"
            />
          </View>
          <View className="flex-1">
            <Text className="font-semiBold mb-2 text-sm text-btn-dark">종료일</Text>
            <TextInput
              className="rounded-sm border border-border bg-white px-4 py-3 font-regular text-sm text-btn-dark"
              value={endDate}
              onChangeText={setEndDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#C0B8B0"
            />
          </View>
        </View>

        <Pressable
          className="items-center rounded-sm py-4"
          disabled={isSubmitting || isDeleting}
          onPress={handleSubmit}
          style={{ backgroundColor: isSubmitting ? '#C8C0B0' : GREEN }}
        >
          <Text className="font-semiBold text-sm text-white">
            {isSubmitting ? '수정 중...' : '수정 완료'}
          </Text>
        </Pressable>

        <Pressable
          className="items-center rounded-sm border border-[#F4C7C7] bg-white py-4"
          disabled={isSubmitting || isDeleting}
          onPress={handleDelete}
        >
          <Text className="font-semiBold text-sm text-[#DC2626]">
            {isDeleting ? '삭제 중...' : '챌린지 삭제'}
          </Text>
        </Pressable>
      </ScrollView>
      <ConfirmModal
        visible={deleteModalVisible}
        title="챌린지 삭제"
        message="이 챌린지와 진행도 정보를 삭제할까요?"
        confirmLabel="삭제"
        destructive
        loading={isDeleting}
        onCancel={() => {
          if (isDeleting) return;
          setDeleteModalVisible(false);
        }}
        onConfirm={() => void confirmDelete()}
      />
    </SafeAreaView>
  );
}
