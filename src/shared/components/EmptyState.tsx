import { Text, View } from 'react-native';

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <View className="items-center justify-center rounded-2xl border border-dashed border-line bg-white p-7">
      <View className="mb-4 h-12 w-12 items-center justify-center rounded-2xl bg-sand">
        <Text className="text-xl font-extrabold text-muted">+</Text>
      </View>
      <Text className="text-center text-lg font-extrabold text-ink">{title}</Text>
      <Text className="mt-2 text-center text-sm leading-5 text-muted">{description}</Text>
    </View>
  );
}
