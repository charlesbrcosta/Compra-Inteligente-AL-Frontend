import { View } from 'react-native';

export function TrashSymbol() {
  return (
    <View className="h-6 w-6 items-center justify-center">
      <View className="absolute top-1 h-0.5 w-3 rounded-full bg-red-700" />
      <View className="absolute top-0.5 h-0.5 w-1.5 rounded-full bg-red-700" />
      <View className="mt-1 h-4 w-3.5 rounded-b-md border-2 border-red-700 border-t-0">
        <View className="absolute left-1 top-1 h-2 w-0.5 rounded-full bg-red-700" />
        <View className="absolute right-1 top-1 h-2 w-0.5 rounded-full bg-red-700" />
      </View>
    </View>
  );
}

export function PencilLeftSymbol() {
  return (
    <View className="h-6 w-6 items-center justify-center">
      <View className="h-2.5 w-4 -rotate-45 rounded-sm bg-success" />
      <View className="absolute left-1.5 top-3 h-0 w-0 border-y-[5px] border-r-[7px] border-y-transparent border-r-success" />
      <View className="absolute right-1.5 top-1.5 h-2.5 w-1 rounded-sm bg-green-200 -rotate-45" />
    </View>
  );
}
