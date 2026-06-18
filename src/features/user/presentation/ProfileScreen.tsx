import { zodResolver } from '@hookform/resolvers/zod';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text, View } from 'react-native';

import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Header } from '@/shared/components/Header';
import { Input } from '@/shared/components/Input';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { ApiSefazRepository } from '@/features/sefaz/infrastructure/ApiSefazRepository';
import { createId } from '@/shared/utils/id';
import { formatCurrency } from '@/shared/utils/formatters';
import { useAuthStore } from '@/features/auth/store/authStore';
import { UserFormData, userSchema } from '@/features/user/presentation/userSchemas';
import { useUserStore } from '@/features/user/store/userStore';
import { VehicleFormData, vehicleSchema } from '@/features/vehicle/presentation/vehicleSchemas';
import { useVehicleStore } from '@/features/vehicle/store/vehicleStore';

const sefazRepository = new ApiSefazRepository();

export function ProfileScreen() {
  const logout = useAuthStore((state) => state.logout);
  const { user, loadUser, saveUser } = useUserStore();
  const { vehicle, loadVehicle, saveVehicle } = useVehicleStore();
  const [fuelLookupMessage, setFuelLookupMessage] = useState<string | null>(null);
  const [isFuelLookupLoading, setIsFuelLookupLoading] = useState(false);

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

  const reloadScreen = useCallback(async () => {
    await Promise.all([loadUser(), loadVehicle()]);
  }, [loadUser, loadVehicle]);

  useFocusEffect(
    useCallback(() => {
      reloadScreen();
    }, [reloadScreen]),
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

  const updateFuelPriceFromSefaz = async () => {
    try {
      setFuelLookupMessage(null);
      setIsFuelLookupLoading(true);
      const summary = await sefazRepository.getCurrentFuelPrice();
      vehicleForm.setValue('fuelPricePerLiter', summary.averagePrice, { shouldDirty: true, shouldValidate: true });
      setFuelLookupMessage(
        `Preco medio SEFAZ: ${formatCurrency(summary.averagePrice)} com ${summary.samples} registros recentes.`,
      );
    } catch {
      setFuelLookupMessage('Nao foi possivel consultar o combustivel na SEFAZ agora.');
    } finally {
      setIsFuelLookupLoading(false);
    }
  };

  return (
    <ScreenContainer onRefresh={reloadScreen}>
      <Header title="Perfil e veiculo" subtitle="Essas informacoes alimentam a simulacao de economia." />

      <View className="gap-5">
        <Card className="gap-4">
          <Text className="text-lg font-bold text-ink">Dados do usuario</Text>
          <Controller control={userForm.control} name="name" render={({ field, fieldState }) => <Input label="Nome" onBlur={field.onBlur} onChangeText={field.onChange} value={field.value} error={fieldState.error?.message} />} />
          <Controller control={userForm.control} name="email" render={({ field, fieldState }) => <Input autoCapitalize="none" keyboardType="email-address" label="E-mail" onBlur={field.onBlur} onChangeText={field.onChange} value={field.value} error={fieldState.error?.message} />} />
          <View className="gap-3 sm:flex-row">
            <View className="flex-1">
              <Controller control={userForm.control} name="city" render={({ field, fieldState }) => <Input label="Cidade" onBlur={field.onBlur} onChangeText={field.onChange} value={field.value} error={fieldState.error?.message} />} />
            </View>
            <View className="flex-1">
              <Controller control={userForm.control} name="neighborhood" render={({ field, fieldState }) => <Input label="Bairro" onBlur={field.onBlur} onChangeText={field.onChange} value={field.value} error={fieldState.error?.message} />} />
            </View>
          </View>
          <Button title="Salvar usuario" onPress={submitUser} isLoading={userForm.formState.isSubmitting} />
        </Card>

        <Card className="gap-4">
          <Text className="text-lg font-bold text-ink">Veiculo</Text>
          <Controller control={vehicleForm.control} name="model" render={({ field, fieldState }) => <Input label="Modelo" placeholder="Ex: Fiat Argo 1.0" onBlur={field.onBlur} onChangeText={field.onChange} value={field.value} error={fieldState.error?.message} />} />
          <Controller control={vehicleForm.control} name="fuelType" render={({ field, fieldState }) => <Input autoCapitalize="none" label="Tipo de combustivel" placeholder="gasolina, etanol, diesel ou gnv" onBlur={field.onBlur} onChangeText={field.onChange} value={field.value} error={fieldState.error?.message} />} />
          <View className="gap-3 sm:flex-row">
            <View className="flex-1">
            <Controller control={vehicleForm.control} name="averageConsumptionKmPerLiter" render={({ field, fieldState }) => <Input keyboardType="numeric" label="Consumo medio (km/l)" onBlur={field.onBlur} onChangeText={field.onChange} value={String(field.value)} error={fieldState.error?.message} />} />
            </View>
            <View className="flex-1">
            <Controller control={vehicleForm.control} name="fuelPricePerLiter" render={({ field, fieldState }) => <Input keyboardType="numeric" label="Preco do combustivel por litro" onBlur={field.onBlur} onChangeText={field.onChange} value={String(field.value)} error={fieldState.error?.message} />} />
            </View>
          </View>
          {fuelLookupMessage ? <Text className="text-sm text-muted">{fuelLookupMessage}</Text> : null}
          <Button
            title="Buscar combustivel na SEFAZ"
            variant="secondary"
            isLoading={isFuelLookupLoading}
            onPress={updateFuelPriceFromSefaz}
          />
          <Button title="Salvar veiculo" onPress={submitVehicle} isLoading={vehicleForm.formState.isSubmitting} />
        </Card>

        <Button title="Sair" variant="danger" onPress={logout} />
      </View>
    </ScreenContainer>
  );
}
