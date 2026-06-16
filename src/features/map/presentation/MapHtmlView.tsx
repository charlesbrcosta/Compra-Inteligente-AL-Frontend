import { Text, View } from 'react-native';

export function MapHtmlView({ html: _html }: { html: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-slate-100 p-4">
      <Text className="text-center text-sm font-semibold text-slate-600">
        Mapa disponivel nas plataformas web, Android e iOS.
      </Text>
    </View>
  );
}
