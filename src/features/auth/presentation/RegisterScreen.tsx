import { zodResolver } from '@hookform/resolvers/zod';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';

import { AuthContainer } from '@/shared/components/AuthContainer';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Header } from '@/shared/components/Header';
import { Input } from '@/shared/components/Input';
import { createId } from '@/shared/utils/id';
import { AuthStackParamList } from '@/shared/types/navigation';
import { useAuthStore } from '@/features/auth/store/authStore';
import { RegisterFormData, registerSchema } from '@/features/auth/presentation/authSchemas';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const register = useAuthStore((state) => state.register);
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', city: 'Maceio', neighborhood: '', password: '' },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    await register(
      {
        id: createId(),
        name: data.name,
        email: data.email,
        city: data.city,
        neighborhood: data.neighborhood,
      },
      data.password,
    );
  });

  return (
    <AuthContainer onRefresh={() => form.reset({ name: '', email: '', city: 'Maceio', neighborhood: '', password: '' })}>
      <Header title="Criar cadastro" subtitle="Seus dados ajudam a simular mercados e deslocamentos mais proximos." />
      <Card className="gap-4">
        <Controller control={form.control} name="name" render={({ field, fieldState }) => <Input label="Nome" onBlur={field.onBlur} onChangeText={field.onChange} value={field.value} error={fieldState.error?.message} />} />
        <Controller control={form.control} name="email" render={({ field, fieldState }) => <Input autoCapitalize="none" keyboardType="email-address" label="E-mail" onBlur={field.onBlur} onChangeText={field.onChange} value={field.value} error={fieldState.error?.message} />} />
        <Controller control={form.control} name="city" render={({ field, fieldState }) => <Input label="Cidade" onBlur={field.onBlur} onChangeText={field.onChange} value={field.value} error={fieldState.error?.message} />} />
        <Controller control={form.control} name="neighborhood" render={({ field, fieldState }) => <Input label="Bairro" onBlur={field.onBlur} onChangeText={field.onChange} value={field.value} error={fieldState.error?.message} />} />
        <Controller control={form.control} name="password" render={({ field, fieldState }) => <Input label="Senha" secureTextEntry onBlur={field.onBlur} onChangeText={field.onChange} value={field.value} error={fieldState.error?.message} />} />
        <Button title="Cadastrar" onPress={onSubmit} isLoading={form.formState.isSubmitting} />
        <Button title="Voltar para login" variant="ghost" onPress={() => navigation.goBack()} />
      </Card>
    </AuthContainer>
  );
}
