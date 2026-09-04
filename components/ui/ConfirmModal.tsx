import Text from '@/components/ui/AppText';
import { Modal, Pressable, View } from 'react-native';

type ConfirmModalProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = '확인',
  cancelLabel = '취소',
  destructive = false,
  loading = false,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  const confirmColor = destructive ? '#DC2626' : '#059669';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable className="flex-1 items-center justify-center bg-black/35" onPress={onCancel}>
        <Pressable
          className="w-4/5 rounded-lg border border-border bg-white p-5"
          onPress={() => {}}
        >
          <Text className="font-semiBold mb-2 text-base text-btn-dark">{title}</Text>
          <Text className="font-regular text-sm leading-5 text-text-brown">{message}</Text>
          <View className="mt-5 flex-row gap-x-2.5">
            <Pressable
              className="flex-1 items-center rounded-sm border border-border py-3"
              disabled={loading}
              onPress={onCancel}
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              <Text className="font-regular text-sm text-btn-dark">{cancelLabel}</Text>
            </Pressable>
            <Pressable
              className="flex-1 items-center rounded-sm py-3"
              disabled={loading}
              onPress={onConfirm}
              style={{ backgroundColor: loading ? '#C8C0B0' : confirmColor }}
            >
              <Text className="font-semiBold text-sm text-white">
                {loading ? '처리 중...' : confirmLabel}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
