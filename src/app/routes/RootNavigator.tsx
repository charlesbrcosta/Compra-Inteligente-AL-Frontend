import { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Loading } from '@/shared/components/Loading';
import { AppTabParamList, AuthStackParamList, RootStackParamList } from '@/shared/types/navigation';
import { LoginScreen } from '@/features/auth/presentation/LoginScreen';
import { RegisterScreen } from '@/features/auth/presentation/RegisterScreen';
import { useAuthStore } from '@/features/auth/store/authStore';
import { HomeScreen } from '@/features/recommendations/presentation/HomeScreen';
import { ProductsScreen } from '@/features/products/presentation/ProductsScreen';
import { ProfileScreen } from '@/features/user/presentation/ProfileScreen';
import { RecommendationsScreen } from '@/features/recommendations/presentation/RecommendationsScreen';
import { RecommendationHistoryScreen } from '@/features/recommendations/presentation/RecommendationHistoryScreen';
import { RouteImpactsScreen } from '@/features/recommendations/presentation/RouteImpactsScreen';
import { AppTabBar } from '@/app/routes/AppTabBar';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppTabs = createBottomTabNavigator<AppTabParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen component={LoginScreen} name="Login" />
      <AuthStack.Screen component={RegisterScreen} name="Register" />
    </AuthStack.Navigator>
  );
}

function AppNavigator() {
  return (
    <AppTabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
      tabBar={(props) => <AppTabBar {...props} />}
    >
      <AppTabs.Screen component={HomeScreen} name="Home" options={{ title: 'Inicio' }} />
      <AppTabs.Screen component={ProductsScreen} name="Products" options={{ title: 'Produtos' }} />
      <AppTabs.Screen component={RecommendationsScreen} name="Recommendations" options={{ title: 'Recomendacao' }} />
      <AppTabs.Screen component={RouteImpactsScreen} name="RouteImpacts" options={{ title: 'Impactos' }} />
      <AppTabs.Screen component={RecommendationHistoryScreen} name="History" options={{ title: 'Historico' }} />
      <AppTabs.Screen component={ProfileScreen} name="Profile" options={{ title: 'Perfil' }} />
    </AppTabs.Navigator>
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
