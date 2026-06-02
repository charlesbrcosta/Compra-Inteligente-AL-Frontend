import { ReactNode } from 'react';
import { View } from 'react-native';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return <View className={`rounded-lg border border-slate-200 bg-white p-4 ${className}`}>{children}</View>;
}
