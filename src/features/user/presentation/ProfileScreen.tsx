import { zodResolver } from '@hookform/resolvers/zod';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Header } from '@/shared/components/Header';
import { Input } from '@/shared/components/Input';
import { createId } from '@/shared/utils/id';
import { useAuthStore } from '@/features/auth/store/authStore';
import { UserFormData, userSchema } from '@/features/user/presentation/userSchemas';
import { useUserStore } from '@/features/user/store/userStore';
import { VehicleFormData, vehicleSchema } from '@/features/vehicle/presentation/vehicleSchemas';
import { useVehicleStore } from '@/features/vehicle/store/vehicleStore';

export function ProfileScreen() {
  const logout = useAuthStore((state) => state.logout);
  const { user, loadUser, saveUser } = useUserStore();
  const { vehicle, loadVehicle, saveVehicle } = useVehicleStore();

  const userForm = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: '', email: '', city: 'Maceio', neighborhood: '' },
  });
  const vehicleForm = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      model: '',
      fuelType: 'gasolina',
      averageConsumptionKmPerLiter: 12,
      fuelPricePerLiter: 5.89,
    },
  });

  useFocusEffect(
    useCallback(() => {
      loadUser();
      loadVehicle();
    }, [loadUser, loadVehicle]),
  );

  useEffect(() => {
    if (user) {
      userForm.reset({
        name: user.name,
        email: user.email,
        city: user.city,
        neighborhood: user.neighborhood,
      });
    }
  }, [user, userForm]);

  useEffect(() => {
    if (vehicle) {
      vehicleForm.reset({
        model: vehicle.model,
        fuelType: vehicle.fuelType,
        averageConsumptionKmPerLiter: vehicle.averageConsumptionKmPerLiter,
        fuelPricePerLiter: vehicle.fuelPricePerLiter,
      });
    }
  }, [vehicle, vehicleForm]);

  const submitUser = userForm.handleSubmit(async (data) => {
    await saveUser({
      id: user?.id ?? createId(),
      name: data.name,
      email: data.email,
      city: data.city,
      neighborhood: data.neighborhood,
    });
  });

  const submitVehicle = vehicleForm.handleSubmit(async (data) => {
    await saveVehicle({
      id: vehicle?.id ?? createId(),
      model: data.model,
      fuelType: data.fuelType,
      averageConsumptionKmPerLiter: data.averageConsumptionKmPerLiter,
      fuelPricePerLiter: data.fuelPricePerLiter,
    });
  });

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView contentContainerClassName="p-5 pb-8">
        <Header title="Perfil e veiculo" subtitle="Essas informacoes alimentam a simulacao de economia." />

        <View className="gap-5">
          <Card className="gap-4">
            <Text className="text-lg font-bold text-ink">Dados do usuario</Text>
            <Controller control={userForm.control} name="name" render={({ field, fieldState }) => <Input label="Nome" onBlur={field.onBlur} onChangeText={field.onChange} value={field.value} error={fieldState.error?.message} />} />
            <Controller control={userForm.control} name="email" render={({ field, fieldState }) => <Input autoCapitalize="none" keyboardType="email-address" label="E-mail" onBlur={field.onBlur} onChangeText={field.onChange} value={field.value} error={fieldState.error?.message} />} />
            <Controller control={userForm.control} name="city" render={({ field, fieldState }) => <Input label="Cidade" onBlur={field.onBlur} onChangeText={field.onChange} value={field.value} error={fieldState.error?.message} />} />
            <Controller control={userForm.control} name="neighborhood" render={({ field, fieldState }) => <Input label="Bairro" onBlur={field.onBlur} onChangeText={field.onChange} value={field.value} error={fieldState.error?.message} />} />
            <Button title="Salvar usuario" onPress={submitUser} isLoading={userForm.formState.isSubmitting} />
          </Card>

          <Card className="gap-4">
            <Text className="text-lg font-bold text-ink">Veiculo</Text>
            <Controller control={vehicleForm.control} name="model" render={({ field, fieldState }) => <Input label="Modelo" placeholder="Ex: Fiat Argo 1.0" onBlur={field.onBlur} onChangeText={field.onChange} value={field.value} error={fieldState.error?.message} />} />
            <Controller control={vehicleForm.control} name="fuelType" render={({ field, fieldState }) => <Input autoCapitalize="none" label="Tipo de combustivel" placeholder="gasolina, etanol, diesel ou gnv" onBlur={field.onBlur} onChangeText={field.onChange} value={field.value} error={fieldState.error?.message} />} />
            <Controller control={vehicleForm.control} name="averageConsumptionKmPerLiter" render={({ field, fieldState }) => <Input keyboardType="numeric" label="Consumo medio (km/l)" onBlur={field.onBlur} onChangeText={field.onChange} value={String(field.value)} error={fieldState.error?.message} />} />
            <Controller control={vehicleForm.control} name="fuelPricePerLiter" render={({ field, fieldState }) => <Input keyboardType="numeric" label="Preco do combustivel por litro" onBlur={field.onBlur} onChangeText={field.onChange} value={String(field.value)} error={fieldState.error?.message} />} />
            <Button title="Salvar veiculo" onPress={submitVehicle} isLoading={vehicleForm.formState.isSubmitting} />
          </Card>

          <Button title="Sair" variant="danger" onPress={logout} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
