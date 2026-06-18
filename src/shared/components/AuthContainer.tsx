import { ReactNode, useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, View } from 'react-native';

interface AuthContainerProps {
  children: ReactNode;
  onRefresh?: () => Promise<void> | void;
}

export function AuthContainer({ children, onRefresh }: AuthContainerProps) {
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
    <KeyboardAvoidingView className="flex-1 bg-slate-50" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-4 py-8 sm:px-5"
        refreshControl={
          onRefresh ? <RefreshControl refreshing={isRefreshing} tintColor="#0f766e" onRefresh={handleRefresh} /> : undefined
        }
      >
        <View className="w-full self-center md:max-w-md">{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
