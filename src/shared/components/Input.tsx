import { Text, TextInput, TextInputProps, View } from 'react-native';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <View className="gap-1">
      <Text className="text-sm font-semibold text-slate-700">{label}</Text>
      <TextInput
        className={`min-h-12 rounded-lg border bg-white px-3 text-base text-ink ${
          error ? 'border-red-400' : 'border-slate-200'
        } ${className}`}
        placeholderTextColor="#94a3b8"
        {...props}
      />
      {error ? <Text className="text-xs text-red-600">{error}</Text> : null}
    </View>
  );
}
