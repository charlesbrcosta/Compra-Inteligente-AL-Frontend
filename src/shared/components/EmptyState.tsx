import { Text, View } from 'react-native';

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <View className="items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6">
      <Text className="text-center text-lg font-semibold text-ink">{title}</Text>
      <Text className="mt-2 text-center text-sm leading-5 text-muted">{description}</Text>
    </View>
  );
}
