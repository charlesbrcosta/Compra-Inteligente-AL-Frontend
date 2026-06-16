import { ReactNode, RefObject } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenContainerProps {
  children: ReactNode;
  scrollViewRef?: RefObject<ScrollView | null>;
}

export function ScreenContainer({ children, scrollViewRef }: ScreenContainerProps) {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView ref={scrollViewRef} contentContainerClassName="px-4 py-5 pb-8 sm:px-5">
        <View className="w-full self-center md:max-w-3xl lg:max-w-4xl">{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}
