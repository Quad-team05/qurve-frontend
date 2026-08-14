import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import { changeMyPassword, getMyProfile, updateMyProfile, type UserProfile } from '@/lib/api/user';
import { ApiError } from '@/lib/api/client';
import { clearAuthSession } from '@/lib/auth/session';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
import Svg, { Circle, Path } from 'react-native-svg';

const ProfileIcon = () => (
  <Svg width={72} height={72} viewBox="0 0 56 56">
    <Circle cx={28} cy={28} r={27} fill="white" stroke="#E0D8C8" strokeWidth={1.5} />
    <Circle cx={28} cy={22} r={9} fill="#2A2018" />
    <Path d="M8 48 C8 36 48 36 48 48" fill="#2A2018" />
  </Svg>
);

function showToast(message: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
    return;
  }

  Alert.alert(message);
}

export default function ProfileEditPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [currentPw, setCurrentPw] = useState('');
  const [currentPwError, setCurrentPwError] = useState(false);
  const [newPw, setNewPw] = useState('');
  const [newPwError, setNewPwError] = useState(false);
  const [newPwConfirm, setNewPwConfirm] = useState('');
  const [newPwConfirmError, setNewPwConfirmError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPw, setIsChangingPw] = useState(false);

  const isValidPassword = (value: string) =>
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/.test(value);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const result = await getMyProfile();
        setProfile(result);
        setId(result.loginId ?? '');
        setName(result.name ?? '');
        setNickname(result.nickname ?? '');
        setEmail(result.email ?? '');
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          await clearAuthSession();
          router.replace('/(app)/auth/login');
          return;
        }

        showToast('회원 정보를 불러오지 못했습니다.');
      }
    };

    void loadProfile();
  }, [router]);

  const changePw = async () => {
    if (isChangingPw) return;

    if (!currentPw.trim()) {
      setCurrentPwError(true);
      return;
    }

    setCurrentPwError(false);

    if (!isValidPassword(newPw)) {
      setNewPwError(true);
      return;
    }

    setNewPwError(false);

    if (newPw !== newPwConfirm) {
      setNewPwConfirmError(true);
      return;
    }

    setNewPwConfirmError(false);

    try {
      setIsChangingPw(true);
      await changeMyPassword({
        currentPassword: currentPw,
        newPassword: newPw,
      });
      setCurrentPw('');
      setNewPw('');
      setNewPwConfirm('');
      Alert.alert('완료', '비밀번호가 변경되었습니다!');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await clearAuthSession();
        router.replace('/(app)/auth/login');
        return;
      }

      if (error instanceof ApiError && error.code === 'INVALID_PASSWORD') {
        setCurrentPwError(true);
        return;
      }

      showToast(
        error instanceof ApiError
          ? error.message || '비밀번호 변경에 실패했습니다.'
          : '비밀번호 변경에 실패했습니다.',
      );
    } finally {
      setIsChangingPw(false);
    }
  };

  const save = async () => {
    if (isSaving) return;

    if (!name.trim() || !nickname.trim()) {
      showToast('이름과 닉네임을 입력해주세요.');
      return;
    }

    try {
      setIsSaving(true);
      const updatedProfile = await updateMyProfile({
        name: name.trim(),
        nickname: nickname.trim(),
        learningGoal: profile?.learningGoal ?? null,
        currentLevel: profile?.currentLevel ?? null,
      });

      setProfile(updatedProfile);
      setName(updatedProfile.name ?? '');
      setNickname(updatedProfile.nickname ?? '');
      showToast('회원정보가 수정되었습니다.');
      router.replace('/(tabs)/mypage');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await clearAuthSession();
        router.replace('/(app)/auth/login');
        return;
      }

      showToast(
        error instanceof ApiError
          ? error.message || '회원정보 수정에 실패했습니다.'
          : '회원정보 수정에 실패했습니다.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <TopBar title="회원정보 수정" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 gap-y-4"
        showsVerticalScrollIndicator={false}
      >
        {/* 프로필 사진 */}
        <View className="mt-2 items-center gap-y-2">
          <ProfileIcon />
          <Text className="font-regular text-xs text-text-brown">프로필 사진 변경</Text>
        </View>

        {/* 기본 정보 카드 */}
        <View className="relative items-center pt-2">
          <View className="absolute top-0 z-10 h-[13px] w-[50px] rounded-sm bg-[#FFE566] opacity-80" />
          <View className="w-full gap-y-3.5 rounded-sm border border-border bg-white p-4 pt-5">
            {/* 아이디 */}
            <View>
              <Text className="mb-1.5 font-regular text-xs text-text-brown">아이디</Text>
              <View className="flex-row gap-x-2">
                <TextInput
                  style={{
                    flex: 1,
                    height: 44,
                    borderWidth: 1,
                    borderColor: '#E0D8C8',
                    borderRadius: 2,
                    backgroundColor: '#EDEBE8',
                    paddingHorizontal: 12,
                    fontSize: 14,
                    color: '#2A2018',
                  }}
                  value={id}
                  editable={false}
                />
                <Pressable
                  style={{
                    height: 44,
                    paddingHorizontal: 12,
                    backgroundColor: '#CFC7BC',
                    borderRadius: 2,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => showToast('아이디는 변경할 수 없습니다.')}
                >
                  <Text className="font-regular text-xs text-white">변경불가</Text>
                </Pressable>
              </View>
              <Text className="mt-1 font-regular text-xs text-text-brown">
                아이디는 변경이 불가합니다.
              </Text>
            </View>

            {/* 이름 */}
            <View>
              <Text className="mb-1.5 font-regular text-xs text-text-brown">이름</Text>
              <TextInput
                style={{
                  height: 44,
                  borderWidth: 1,
                  borderColor: '#E0D8C8',
                  borderRadius: 2,
                  backgroundColor: '#F5F3EE',
                  paddingHorizontal: 12,
                  fontSize: 14,
                  color: '#2A2018',
                }}
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* 닉네임 */}
            <View>
              <Text className="mb-1.5 font-regular text-xs text-text-brown">닉네임</Text>
              <TextInput
                style={{
                  height: 44,
                  borderWidth: 1,
                  borderColor: '#E0D8C8',
                  borderRadius: 2,
                  backgroundColor: '#F5F3EE',
                  paddingHorizontal: 12,
                  fontSize: 14,
                  color: '#2A2018',
                }}
                value={nickname}
                onChangeText={setNickname}
              />
            </View>

            {/* 이메일 */}
            <View>
              <Text className="mb-1.5 font-regular text-xs text-text-brown">이메일</Text>
              <View
                style={{
                  height: 44,
                  borderWidth: 1,
                  borderColor: '#E0D8C8',
                  borderRadius: 2,
                  backgroundColor: '#EDEBE8',
                  paddingHorizontal: 12,
                  justifyContent: 'center',
                }}
              >
                <Text className="font-regular text-sm text-text-brown">
                  {email || profile?.email || '-'}
                </Text>
              </View>
              <Text className="mt-1 font-regular text-xs text-text-brown">
                이메일은 변경이 불가합니다.
              </Text>
            </View>
          </View>
        </View>

        {/* 비밀번호 변경 카드 */}
        <View className="relative items-center pt-2">
          <View className="absolute top-0 z-10 h-[13px] w-[50px] rounded-sm bg-[#B8D4F0] opacity-80" />
          <View className="w-full gap-y-3.5 rounded-sm border border-border bg-white p-4 pt-5">
            {/* 현재 비밀번호 */}
            <View>
              <Text className="mb-1.5 font-regular text-xs text-text-brown">현재 비밀번호</Text>
              <TextInput
                style={{
                  height: 44,
                  borderWidth: 1,
                  borderColor: currentPwError ? '#CC4444' : '#E0D8C8',
                  borderRadius: 2,
                  backgroundColor: '#F5F3EE',
                  paddingHorizontal: 12,
                  fontSize: 14,
                  color: '#2A2018',
                }}
                value={currentPw}
                onChangeText={(v) => {
                  setCurrentPw(v);
                  setCurrentPwError(false);
                }}
                secureTextEntry
                placeholder="현재 비밀번호 입력"
                placeholderTextColor="#C0B8B0"
              />
              {currentPwError && (
                <Text className="mt-1 font-regular text-xs" style={{ color: '#CC4444' }}>
                  현재 비밀번호와 일치하지 않습니다.
                </Text>
              )}
            </View>

            {/* 새 비밀번호 */}
            <View>
              <Text className="mb-1.5 font-regular text-xs text-text-brown">새 비밀번호</Text>
              <TextInput
                style={{
                  height: 44,
                  borderWidth: 1,
                  borderColor: '#E0D8C8',
                  borderRadius: 2,
                  backgroundColor: '#F5F3EE',
                  paddingHorizontal: 12,
                  fontSize: 14,
                  color: '#2A2018',
                }}
                value={newPw}
                onChangeText={(value) => {
                  setNewPw(value);
                  setNewPwError(false);
                }}
                secureTextEntry
                placeholder="영문, 숫자, 특수문자 포함 8자 이상"
                placeholderTextColor="#C0B8B0"
              />
              <Text
                className="mt-1 font-regular text-xs"
                style={{ color: newPwError ? '#CC4444' : '#A09080' }}
              >
                영문, 숫자, 특수문자를 포함해 8자 이상 입력해주세요.
              </Text>
            </View>

            {/* 새 비밀번호 확인 */}
            <View>
              <Text className="mb-1.5 font-regular text-xs text-text-brown">새 비밀번호 확인</Text>
              <TextInput
                style={{
                  height: 44,
                  borderWidth: 1,
                  borderColor: newPwConfirmError ? '#CC4444' : '#E0D8C8',
                  borderRadius: 2,
                  backgroundColor: '#F5F3EE',
                  paddingHorizontal: 12,
                  fontSize: 14,
                  color: '#2A2018',
                }}
                value={newPwConfirm}
                onChangeText={(v) => {
                  setNewPwConfirm(v);
                  setNewPwConfirmError(false);
                }}
                secureTextEntry
                placeholder="비밀번호 재입력"
                placeholderTextColor="#C0B8B0"
              />
              {newPwConfirmError && (
                <Text className="mt-1 font-regular text-xs" style={{ color: '#CC4444' }}>
                  비밀번호가 일치하지 않습니다.
                </Text>
              )}
            </View>

            {/* 비밀번호 변경 버튼 */}
            <Pressable
              style={{
                height: 44,
                backgroundColor: '#2A2018',
                borderRadius: 2,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={changePw}
            >
              <Text className="font-semiBold text-sm text-white">
                {isChangingPw ? '변경 중...' : '비밀번호 변경'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* 저장 버튼 */}
        <Pressable
          style={{
            height: 46,
            backgroundColor: '#2A2018',
            borderRadius: 2,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={save}
        >
          <Text className="font-semiBold text-sm text-white">
            {isSaving ? '저장 중...' : '저장'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
