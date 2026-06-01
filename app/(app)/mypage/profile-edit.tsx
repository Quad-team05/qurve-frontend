import Text from '@/components/ui/AppText';
import TopBar from '@/components/ui/TopBar';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

const ProfileIcon = () => (
  <Svg width={72} height={72} viewBox="0 0 56 56">
    <Circle cx={28} cy={28} r={27} fill="white" stroke="#E0D8C8" strokeWidth={1.5} />
    <Circle cx={28} cy={22} r={9} fill="#2A2018" />
    <Path d="M8 48 C8 36 48 36 48 48" fill="#2A2018" />
  </Svg>
);

export default function ProfileEditPage() {
  const [id, setId] = useState('ham4246');
  const [idError, setIdError] = useState(false);
  const [idChecked, setIdChecked] = useState(false);
  const [name, setName] = useState('정현지');
  const [nickname, setNickname] = useState('햄지');
  const [currentPw, setCurrentPw] = useState('');
  const [currentPwError, setCurrentPwError] = useState(false);
  const [newPw, setNewPw] = useState('');
  const [newPwConfirm, setNewPwConfirm] = useState('');
  const [newPwConfirmError, setNewPwConfirmError] = useState(false);

  const checkId = () => {
    if (id === 'ham4246') {
      setIdError(true);
      setIdChecked(false);
    } else {
      setIdError(false);
      setIdChecked(true);
    }
  };

  const changePw = () => {
    if (currentPw !== '1234') {
      setCurrentPwError(true);
      return;
    }
    setCurrentPwError(false);
    if (newPw !== newPwConfirm) {
      setNewPwConfirmError(true);
      return;
    }
    setNewPwConfirmError(false);
    Alert.alert('완료', '비밀번호가 변경되었습니다!');
  };

  const save = () => {
    if (idError) {
      Alert.alert('오류', '아이디 중복확인을 해주세요.');
      return;
    }
    Alert.alert('완료', '저장되었습니다!');
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
                    borderColor: idError ? '#CC4444' : idChecked ? '#059669' : '#E0D8C8',
                    borderRadius: 2,
                    backgroundColor: '#F5F3EE',
                    paddingHorizontal: 12,
                    fontSize: 14,
                    color: '#2A2018',
                  }}
                  value={id}
                  onChangeText={(v) => {
                    setId(v);
                    setIdError(false);
                    setIdChecked(false);
                  }}
                />
                <Pressable
                  style={{
                    height: 44,
                    paddingHorizontal: 12,
                    backgroundColor: '#2A2018',
                    borderRadius: 2,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={checkId}
                >
                  <Text className="font-regular text-xs text-white">중복확인</Text>
                </Pressable>
              </View>
              {idError && (
                <Text className="mt-1 font-regular text-xs" style={{ color: '#CC4444' }}>
                  이미 존재하는 아이디입니다.
                </Text>
              )}
              {idChecked && (
                <Text className="mt-1 font-regular text-xs" style={{ color: '#059669' }}>
                  사용 가능한 아이디입니다.
                </Text>
              )}
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
                <Text className="font-regular text-sm text-text-brown">hamham@gmail.com</Text>
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
                onChangeText={setNewPw}
                secureTextEntry
                placeholder="영문, 숫자, 특수문자 포함 8자 이상"
                placeholderTextColor="#C0B8B0"
              />
              <Text className="mt-1 font-regular text-xs text-text-brown">
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
              <Text className="font-semiBold text-sm text-white">비밀번호 변경</Text>
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
          <Text className="font-semiBold text-sm text-white">저장</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
