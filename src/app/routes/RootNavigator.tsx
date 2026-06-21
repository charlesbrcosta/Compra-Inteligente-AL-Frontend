import { ComponentType, useEffect, useMemo, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppState, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppNavigationProvider, AppRouteName } from '@/app/routes/appNavigation';
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

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

const appRoutes: Array<{ component: ComponentType; name: AppRouteName; title: string }> = [
  { component: HomeScreen, name: 'Home', title: 'Inicio' },
  { component: ProductsScreen, name: 'Products', title: 'Produtos' },
  { component: RecommendationsScreen, name: 'Recommendations', title: 'Recomendacao' },
  { component: RecommendationHistoryScreen, name: 'History', title: 'Historico' },
  { component: ProfileScreen, name: 'Profile', title: 'Perfil' },
];

const bottomRoutes: Array<{ name: AppRouteName; title: string; icon: 'home' | 'list' | 'chart' | 'profile' }> = [
  { name: 'Home', title: 'Inicio', icon: 'home' },
  { name: 'Products', title: 'Lista', icon: 'list' },
  { name: 'Recommendations', title: 'Comparar', icon: 'chart' },
  { name: 'Profile', title: 'Perfil', icon: 'profile' },
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
  const route = appRoutes.find((item) => item.name === activeRoute) ?? appRoutes[0];
  const Screen = route.component;
  const navigationValue = useMemo(
    () => ({
      activeRoute,
      navigate: setActiveRoute,
    }),
    [activeRoute],
  );

  return (
    <AppNavigationProvider value={navigationValue}>
    <SafeAreaView className="flex-1 bg-sand">
      <View className="min-h-20 flex-row items-center border-b border-line bg-sand px-5">
        <View className="min-w-0 flex-1 flex-row items-center gap-3">
          <BrandMark compact />
          <View className="min-w-0 flex-1">
            <Text className="text-sm font-black uppercase tracking-wider text-primary">Compra Inteligente AL</Text>
            <Text className="text-2xl font-extrabold text-ink">{route.title}</Text>
          </View>
        </View>
      </View>

      <View className="flex-1">
        <Screen />
      </View>

      <View className="min-h-20 flex-row items-center justify-around border-t border-line bg-white px-3 pb-2 pt-2">
        {bottomRoutes.map((item) => {
          const isActive = item.name === activeRoute;

          return (
            <Pressable
              key={item.name}
              accessibilityRole="button"
              className="min-w-16 flex-1 items-center gap-1 py-1 active:opacity-80"
              onPress={() => setActiveRoute(item.name)}
            >
              <NavIcon icon={item.icon} isActive={isActive} />
              <Text className={`text-[11px] font-bold ${isActive ? 'text-primary' : 'text-muted'}`}>{item.title}</Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
    </AppNavigationProvider>
  );
}

function NavIcon({ icon, isActive }: { icon: 'home' | 'list' | 'chart' | 'profile'; isActive: boolean }) {
  const colorClass = isActive ? 'bg-primary' : 'bg-muted';
  const borderClass = isActive ? 'border-primary' : 'border-muted';

  if (icon === 'home') {
    return (
      <View className="h-7 w-7 items-center justify-center">
        <View className={`h-4 w-5 rounded-sm border-2 ${borderClass}`} />
        <View className={`absolute top-1 h-3 w-3 rotate-45 border-l-2 border-t-2 ${borderClass}`} />
      </View>
    );
  }

  if (icon === 'list') {
    return (
      <View className="h-7 w-7 justify-center gap-1">
        <View className={`h-0.5 rounded-full ${colorClass}`} />
        <View className={`h-0.5 rounded-full ${colorClass}`} />
        <View className={`h-0.5 rounded-full ${colorClass}`} />
      </View>
    );
  }

  if (icon === 'chart') {
    return (
      <View className="h-7 w-7 flex-row items-end justify-center gap-1">
        <View className={`h-2 w-1.5 rounded-full ${colorClass}`} />
        <View className={`h-4 w-1.5 rounded-full ${colorClass}`} />
        <View className={`h-6 w-1.5 rounded-full ${colorClass}`} />
      </View>
    );
  }

  return (
    <View className="h-7 w-7 items-center">
      <View className={`h-3 w-3 rounded-full border-2 ${borderClass}`} />
      <View className={`mt-1 h-3 w-5 rounded-t-full border-2 border-b-0 ${borderClass}`} />
    </View>
  );
}

export function RootNavigator() {
  const { checkSession, hydrate, isLoading, session } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        checkSession();
      }
    });

    return () => subscription.remove();
  }, [checkSession]);

  if (isLoading) {
    return <Loading label="Preparando seus dados" />;
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {session ? <RootStack.Screen component={AppNavigator} name="App" /> : <RootStack.Screen component={AuthNavigator} name="Auth" />}
    </RootStack.Navigator>
  );
}
