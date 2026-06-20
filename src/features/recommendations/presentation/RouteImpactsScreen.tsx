import { Text, View } from 'react-native';

import { Header } from '@/shared/components/Header';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

export function RouteImpactsScreen() {
  return (
    <ScreenContainer>
        <Header
          title="Impactos"
          subtitle="Status das variaveis externas que podem alterar o custo de deslocamento."
        />

        <View className="gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <Text className="text-lg font-extrabold text-amber-950">Integracao de transito pendente</Text>
          <Text className="text-sm leading-6 text-amber-900">
            O app ja calcula a rota real por ruas e a distancia real entre o GPS do usuario e os estabelecimentos.
            Acidentes, chuva, bloqueios e congestionamentos nao entram no calculo enquanto nao houver uma API real
            gratuita configurada para esses eventos.
          </Text>
          <Text className="text-sm leading-6 text-amber-900">
            Para habilitar essa parte com dados reais, precisamos cadastrar uma fonte gratuita de incidentes/transito e integrar
            a resposta no backend antes da recomendacao.
          </Text>
        </View>
    </ScreenContainer>
  );
}
