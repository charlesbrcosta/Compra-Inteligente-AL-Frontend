import { ReactNode, RefObject, useCallback, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenContainerProps {
  children: ReactNode;
  onRefresh?: () => Promise<void> | void;
  scrollViewRef?: RefObject<ScrollView | null>;
}

export function ScreenContainer({ children, onRefresh, scrollViewRef }: ScreenContainerProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (!onRefresh) {
      return;
    }

    setIsRefreshing(true);

    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh]);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView
        ref={scrollViewRef}
        contentContainerClassName="px-4 py-5 pb-8 sm:px-5"
        refreshControl={
          onRefresh ? <RefreshControl refreshing={isRefreshing} tintColor="#0f766e" onRefresh={handleRefresh} /> : undefined
        }
      >
        <View className="w-full self-center md:max-w-3xl lg:max-w-4xl">{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}
