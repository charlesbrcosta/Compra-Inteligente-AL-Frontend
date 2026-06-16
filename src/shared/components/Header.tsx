import { Text, View } from 'react-native';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <View className="gap-1 pb-4">
      <Text className="text-2xl font-bold leading-8 text-ink">{title}</Text>
      {subtitle ? <Text className="text-sm leading-5 text-muted">{subtitle}</Text> : null}
    </View>
  );
}
