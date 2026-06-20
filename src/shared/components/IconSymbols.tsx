import { View } from 'react-native';

export function TrashSymbol() {
  return (
    <View className="h-5 w-5 items-center justify-center">
      <View className="absolute top-1.5 h-0.5 w-4 rounded-full bg-red-700" />
      <View className="absolute top-0.5 h-0.5 w-2 rounded-full bg-red-700" />
      <View className="mt-1.5 h-3.5 w-3 rounded-b-sm border-2 border-red-700 border-t-0">
        <View className="absolute left-0.5 top-1 h-2 w-0.5 rounded-full bg-red-700" />
        <View className="absolute right-0.5 top-1 h-2 w-0.5 rounded-full bg-red-700" />
      </View>
    </View>
  );
}

export function PencilLeftSymbol() {
  return (
    <View className="h-5 w-5">
      <View className="absolute bottom-0.5 right-0 h-0.5 w-2 rounded-full bg-ink" />
      <View className="absolute left-1.5 top-2.5 h-0.5 w-4 -rotate-45 rounded-full bg-ink" />
      <View className="absolute left-0.5 top-3.5 h-1.5 w-1.5 -rotate-45 border-b-2 border-l-2 border-ink" />
      <View className="absolute right-1.5 top-1 h-1.5 w-1 -rotate-45 rounded-sm bg-muted" />
    </View>
  );
}
