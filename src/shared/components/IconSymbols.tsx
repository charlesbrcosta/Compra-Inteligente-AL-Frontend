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
    <View className="h-5 w-5 items-center justify-center">
      <View className="h-1 w-4 -rotate-45 rounded-full bg-ink" />
      <View className="absolute bottom-1 left-1 h-0 w-0 -rotate-45 border-b-[3px] border-r-[3px] border-b-transparent border-r-ink" />
      <View className="absolute right-1 top-1 h-1.5 w-1.5 -rotate-45 rounded-sm bg-muted" />
    </View>
  );
}

export function CheckboxSymbol({ isChecked }: { isChecked: boolean }) {
  return (
    <View
      className={`h-5 w-5 items-center justify-center rounded-md border-2 ${
        isChecked ? 'border-success bg-success' : 'border-line bg-white'
      }`}
    >
      {isChecked ? (
        <View className="h-2.5 w-1.5 rotate-45 border-b-2 border-r-2 border-white" />
      ) : null}
    </View>
  );
}

export function BasketSymbol() {
  return (
    <View className="h-6 w-6 items-center justify-center">
      <View className="absolute top-1 h-2 w-3.5 rounded-t-full border-2 border-muted border-b-0" />
      <View className="mt-2 h-3.5 w-5 rounded-b-md border-2 border-muted bg-white">
        <View className="absolute left-1 top-1 h-1.5 w-0.5 rounded-full bg-muted" />
        <View className="absolute left-2.5 top-1 h-1.5 w-0.5 rounded-full bg-muted" />
        <View className="absolute right-1 top-1 h-1.5 w-0.5 rounded-full bg-muted" />
      </View>
    </View>
  );
}
