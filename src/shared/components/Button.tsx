import { ActivityIndicator, Pressable, Text } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  isLoading?: boolean;
}

const variants = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  ghost: 'bg-slate-100',
  danger: 'bg-red-600',
};

const textVariants = {
  primary: 'text-white',
  secondary: 'text-white',
  ghost: 'text-ink',
  danger: 'text-white',
};

export function Button({ title, onPress, variant = 'primary', isLoading = false }: ButtonProps) {
  return (
    <Pressable
      className={`min-h-12 items-center justify-center rounded-lg px-4 ${variants[variant]} ${
        isLoading ? 'opacity-70' : 'active:opacity-80'
      }`}
      disabled={isLoading}
      onPress={onPress}
    >
      {isLoading ? <ActivityIndicator color="#fff" /> : <Text className={`font-semibold ${textVariants[variant]}`}>{title}</Text>}
    </Pressable>
  );
}
