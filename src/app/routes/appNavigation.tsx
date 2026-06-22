import { createContext, ReactNode, useContext } from 'react';

export type AppRouteName = 'Home' | 'Products' | 'Recommendations' | 'History' | 'Profile';

interface AppNavigationContextValue {
  activeRoute: AppRouteName;
  navigate: (route: AppRouteName) => void;
}

const AppNavigationContext = createContext<AppNavigationContextValue | null>(null);

export function AppNavigationProvider({ children, value }: { children: ReactNode; value: AppNavigationContextValue }) {
  return <AppNavigationContext.Provider value={value}>{children}</AppNavigationContext.Provider>;
}

export function useAppNavigation() {
  const context = useContext(AppNavigationContext);

  if (!context) {
    throw new Error('useAppNavigation must be used within AppNavigationProvider');
  }

  return context;
}
