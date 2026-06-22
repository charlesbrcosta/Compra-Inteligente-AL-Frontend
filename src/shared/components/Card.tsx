import { ReactNode } from 'react';
import { View } from 'react-native';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return <View className={`rounded-2xl border border-line bg-white p-5 ${className}`}>{children}</View>;
}
