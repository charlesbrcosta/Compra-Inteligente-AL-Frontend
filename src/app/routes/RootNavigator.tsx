import { ComponentType, useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Modal, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/shared/components/BrandMark';
import { Loading } from '@/shared/components/Loading';
import { AuthStackParamList, RootStackParamList } from '@/shared/types/navigation';
import { LoginScreen } from '@/features/auth/presentation/LoginScreen';
import { RegisterScreen } from '@/features/auth/presentation/RegisterScreen';
import { useAuthStore } from '@/features/auth/store/authStore';
import { HomeScreen } from '@/features/recommendations/presentation/HomeScreen';
import { ProductsScreen } from '@/features/products/presentation/ProductsScreen';
import { ProfileScreen } from '@/features/user/presentation/ProfileScreen';
import { RecommendationsScreen } from '@/features/recommendations/presentation/RecommendationsScreen';
import { RecommendationHistoryScreen } from '@/features/recommendations/presentation/RecommendationHistoryScreen';
import { RouteImpactsScreen } from '@/features/recommendations/presentation/RouteImpactsScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

type AppRouteName = 'Home' | 'Products' | 'Recommendations' | 'RouteImpacts' | 'History' | 'Profile';

const appRoutes: Array<{ component: ComponentType; name: AppRouteName; title: string }> = [
  { component: HomeScreen, name: 'Home', title: 'Inicio' },
  { component: ProductsScreen, name: 'Products', title: 'Produtos' },
  { component: RecommendationsScreen, name: 'Recommendations', title: 'Recomendacao' },
  { component: RouteImpactsScreen, name: 'RouteImpacts', title: 'Impactos' },
  { component: RecommendationHistoryScreen, name: 'History', title: 'Historico' },
  { component: ProfileScreen, name: 'Profile', title: 'Perfil' },
];

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen component={LoginScreen} name="Login" />
      <AuthStack.Screen component={RegisterScreen} name="Register" />
    </AuthStack.Navigator>
  );
}

function AppNavigator() {
  const [activeRoute, setActiveRoute] = useState<AppRouteName>('Home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const route = appRoutes.find((item) => item.name === activeRoute) ?? appRoutes[0];
  const Screen = route.component;

  return (
    <SafeAreaView className="flex-1 bg-sand">
      <View className="min-h-20 flex-row items-center justify-between border-b border-line bg-sand px-5">
        <View className="min-w-0 flex-1 flex-row items-center gap-3">
          <BrandMark compact />
          <View className="min-w-0 flex-1">
            <Text className="text-[11px] font-extrabold uppercase tracking-wider text-primary">Compra Inteligente AL</Text>
            <Text className="text-2xl font-extrabold text-ink">{route.title}</Text>
          </View>
        </View>
        <Pressable
          accessibilityLabel="Abrir menu"
          className="h-12 w-12 items-center justify-center rounded-2xl bg-primary active:opacity-80"
          onPress={() => setIsMenuOpen(true)}
        >
          <View className="h-0.5 w-6 rounded-full bg-white" />
          <View className="mt-1.5 h-0.5 w-6 rounded-full bg-white" />
          <View className="mt-1.5 h-0.5 w-6 rounded-full bg-white" />
        </Pressable>
      </View>

      <View className="flex-1">
        <Screen />
      </View>

      <Modal animationType="fade" transparent visible={isMenuOpen} onRequestClose={() => setIsMenuOpen(false)}>
        <View className="flex-1 bg-black/40">
          <Pressable className="absolute inset-0" onPress={() => setIsMenuOpen(false)} />
          <View className="ml-auto h-full w-80 max-w-[86%] bg-sand p-5">
            <View className="mb-6 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <BrandMark compact />
                <View>
                  <Text className="text-xs font-extrabold uppercase tracking-wider text-primary">Menu</Text>
                  <Text className="text-xl font-extrabold text-ink">Navegacao</Text>
                </View>
              </View>
              <Pressable className="h-11 w-11 items-center justify-center rounded-xl border border-line bg-white" onPress={() => setIsMenuOpen(false)}>
                <Text className="text-lg font-bold text-ink">X</Text>
              </Pressable>
            </View>

            <View className="gap-2">
              {appRoutes.map((item) => {
                const isActive = item.name === activeRoute;

                return (
                  <Pressable
                    key={item.name}
                    className={`min-h-16 justify-center rounded-2xl border px-4 ${
                      isActive ? 'border-primary bg-white' : 'border-line bg-white'
                    }`}
                    onPress={() => {
                      setActiveRoute(item.name);
                      setIsMenuOpen(false);
                    }}
                  >
                    <Text className={`text-base font-extrabold ${isActive ? 'text-primary' : 'text-ink'}`}>
                      {item.title}
                    </Text>
                    <Text className="mt-0.5 text-xs font-semibold text-muted">Abrir {item.title.toLowerCase()}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

export function RootNavigator() {
  const { hydrate, isLoading, session } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (isLoading) {
    return <Loading label="Preparando seus dados" />;
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {session ? <RootStack.Screen component={AppNavigator} name="App" /> : <RootStack.Screen component={AuthNavigator} name="Auth" />}
    </RootStack.Navigator>
  );
}
