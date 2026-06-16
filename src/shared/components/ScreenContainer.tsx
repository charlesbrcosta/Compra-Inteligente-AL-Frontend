import { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenContainerProps {
  children: ReactNode;
}

export function ScreenContainer({ children }: ScreenContainerProps) {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView contentContainerClassName="px-4 py-5 pb-8 sm:px-5">
        <View className="w-full self-center md:max-w-3xl lg:max-w-4xl">{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}
