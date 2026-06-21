import { zodResolver } from '@hookform/resolvers/zod';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
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
  const lastEmail = useAuthStore((state) => state.lastEmail);
  const [loginError, setLoginError] = useState<string | null>(null);
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: lastEmail, password: '' },
  });

  useEffect(() => {
    form.reset({ email: lastEmail, password: '' });
  }, [form, lastEmail]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      setLoginError(null);
      await login(data.email, data.password);
      form.reset({ email: data.email, password: '' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nao foi possivel entrar agora.';
      setLoginError(
        message.includes('User not found')
          ? 'Usuario nao cadastrado. Crie uma conta antes de entrar.'
          : message,
      );
    }
  });

  return (
    <AuthContainer onRefresh={() => form.reset({ email: lastEmail, password: '' })}>
      <View className="mb-8 gap-5">
        <BrandLockup />
        <View>
          <Text className="text-4xl font-extrabold leading-10 text-ink">Sua compra, mais economica.</Text>
          <Text className="mt-3 text-base leading-6 text-muted">
            Compare precos reais e custo de deslocamento antes de sair de casa.
          </Text>
        </View>
      </View>

      {loginError ? (
        <View className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4">
          <Text className="text-sm font-semibold text-red-700">{loginError}</Text>
        </View>
      ) : null}

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
