import { zodResolver } from '@hookform/resolvers/zod';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';
import { Text, View } from 'react-native';

import { AuthContainer } from '@/shared/components/AuthContainer';
import { BrandLockup } from '@/shared/components/BrandMark';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Input } from '@/shared/components/Input';
import { AuthStackParamList } from '@/shared/types/navigation';
import { useAuthStore } from '@/features/auth/store/authStore';
import { LoginFormData, loginSchema } from '@/features/auth/presentation/authSchemas';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const login = useAuthStore((state) => state.login);
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'ana@email.com', password: '1234' },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    await login(data.email, data.password);
  });

  return (
    <AuthContainer onRefresh={() => form.reset({ email: 'ana@email.com', password: '1234' })}>
      <View className="mb-8 gap-5">
        <BrandLockup />
        <View>
          <Text className="text-4xl font-extrabold leading-10 text-ink">Sua compra, mais economica.</Text>
          <Text className="mt-3 text-base leading-6 text-muted">
            Compare precos reais e custo de deslocamento antes de sair de casa.
          </Text>
        </View>
      </View>

      <Card className="gap-4">
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Input
              autoCapitalize="none"
              keyboardType="email-address"
              label="E-mail"
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              value={field.value}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <Input
              label="Senha"
              secureTextEntry
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              value={field.value}
              error={fieldState.error?.message}
            />
          )}
        />
        <Button title="Entrar" onPress={onSubmit} isLoading={form.formState.isSubmitting} />
        <Button title="Criar cadastro" variant="success" onPress={() => navigation.navigate('Register')} />
      </Card>
      <View className="mt-4">
        <Text className="text-center text-xs text-muted">Use um e-mail cadastrado para iniciar uma sessao local no app.</Text>
      </View>
    </AuthContainer>
  );
}
