import { ActivityIndicator, Pressable, Text } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'accent' | 'ghost' | 'danger';
  isLoading?: boolean;
}

const variants = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  success: 'bg-success',
  accent: 'bg-accent',
  ghost: 'border border-line bg-white',
  danger: 'bg-red-700',
};

const textVariants = {
  primary: 'text-white',
  secondary: 'text-white',
  success: 'text-white',
  accent: 'text-ink',
  ghost: 'text-ink',
  danger: 'text-white',
};

export function Button({ title, onPress, variant = 'primary', isLoading = false }: ButtonProps) {
  return (
    <Pressable
      className={`min-h-14 items-center justify-center rounded-xl px-5 ${variants[variant]} ${
        isLoading ? 'opacity-70' : 'active:opacity-80'
      }`}
      disabled={isLoading}
      onPress={onPress}
    >
      {isLoading ? <ActivityIndicator color={variant === 'ghost' ? '#D62839' : '#fff'} /> : <Text className={`text-base font-extrabold ${textVariants[variant]}`}>{title}</Text>}
    </Pressable>
  );
}
