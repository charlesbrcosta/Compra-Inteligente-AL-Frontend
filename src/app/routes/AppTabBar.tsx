import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const labels: Record<string, string> = {
  Home: 'Inicio',
  Products: 'Produtos',
  Recommendations: 'Recomendacao',
  RouteImpacts: 'Impactos',
  History: 'Historico',
  Profile: 'Perfil',
};

export function AppTabBar({ descriptors, navigation, state }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="border-t border-slate-200 bg-white px-3 pt-2" style={{ paddingBottom: Math.max(insets.bottom, 10) }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2"
      >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const options = descriptors[route.key]?.options;
          const label = labels[route.name] ?? options?.title ?? route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              className={`min-h-12 min-w-32 items-center justify-center rounded-lg border px-4 ${
                isFocused ? 'border-primary bg-primary' : 'border-slate-200 bg-slate-50'
              }`}
              onPress={onPress}
            >
              <Text className={`text-sm font-bold ${isFocused ? 'text-white' : 'text-slate-700'}`}>{label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
