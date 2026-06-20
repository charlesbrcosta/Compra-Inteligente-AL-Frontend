import { ActivityIndicator, Text, View } from 'react-native';

export function Loading({ label = 'Carregando' }: { label?: string }) {
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-sand">
      <ActivityIndicator color="#D62839" size="large" />
      <Text className="text-sm font-semibold text-muted">{label}</Text>
    </View>
  );
}
