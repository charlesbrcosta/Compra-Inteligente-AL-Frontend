import { Text, TextInput, TextInputProps, View } from 'react-native';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <View className="gap-1.5">
      <Text className="text-xs font-bold uppercase tracking-wide text-muted">{label}</Text>
      <TextInput
        className={`min-h-14 rounded-xl border bg-white px-4 text-base text-ink ${
          error ? 'border-red-400' : 'border-line'
        } ${className}`}
        placeholderTextColor="#B9AFA2"
        {...props}
      />
      {error ? <Text className="text-xs text-red-600">{error}</Text> : null}
    </View>
  );
}
