import { ActivityIndicator, Text, View } from 'react-native';

export function Loading({ label = 'Carregando' }: { label?: string }) {
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-slate-50">
      <ActivityIndicator color="#0f766e" size="large" />
      <Text className="text-sm text-muted">{label}</Text>
    </View>
  );
}
