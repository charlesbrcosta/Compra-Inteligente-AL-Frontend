import { ComponentType, useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Modal, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="min-h-16 flex-row items-center justify-between border-b border-slate-200 bg-white px-4">
        <View className="min-w-0 flex-1">
          <Text className="text-xs font-semibold uppercase text-muted">Compra Inteligente AL</Text>
          <Text className="text-lg font-bold text-ink">{route.title}</Text>
        </View>
        <Pressable
          accessibilityLabel="Abrir menu"
          className="h-12 w-12 items-center justify-center rounded-lg bg-primary active:opacity-80"
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
          <View className="ml-auto h-full w-80 max-w-[86%] bg-white p-5">
            <View className="mb-5 flex-row items-center justify-between">
              <Text className="text-xl font-bold text-ink">Menu</Text>
              <Pressable className="h-10 w-10 items-center justify-center rounded-lg bg-slate-100" onPress={() => setIsMenuOpen(false)}>
                <Text className="text-lg font-bold text-ink">X</Text>
              </Pressable>
            </View>

            <View className="gap-2">
              {appRoutes.map((item) => {
                const isActive = item.name === activeRoute;

                return (
                  <Pressable
                    key={item.name}
                    className={`min-h-14 justify-center rounded-lg border px-4 ${
                      isActive ? 'border-primary bg-teal-50' : 'border-slate-200 bg-white'
                    }`}
                    onPress={() => {
                      setActiveRoute(item.name);
                      setIsMenuOpen(false);
                    }}
                  >
                    <Text className={`text-base font-bold ${isActive ? 'text-primary' : 'text-slate-700'}`}>
                      {item.title}
                    </Text>
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
