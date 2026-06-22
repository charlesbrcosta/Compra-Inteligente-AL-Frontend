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
        className={`h-14 max-h-14 overflow-hidden rounded-xl border bg-white px-4 py-0 text-base leading-5 text-ink ${
          error ? 'border-red-400' : 'border-line'
        } ${className}`}
        multiline={false}
        numberOfLines={1}
        placeholderTextColor="#B9AFA2"
        textAlignVertical="center"
        {...props}
      />
      {error ? <Text className="text-xs text-red-600">{error}</Text> : null}
    </View>
  );
}
