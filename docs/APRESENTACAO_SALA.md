# Compra Inteligente AL - Apresentacao Tecnica

Este documento foi criado para explicar o projeto em sala de aula: objetivo, arquitetura, funcionalidades principais, reaproveitamento de codigo e os trechos mais importantes da implementacao.

## 1. Ideia do projeto

O **Compra Inteligente AL** e um aplicativo mobile feito com **React Native, Expo e TypeScript**.

O objetivo e ajudar o usuario a decidir em qual supermercado ou atacadista vale mais a pena comprar, considerando:

- preco dos produtos da lista de compras;
- quilometros rodados do veiculo a partir da posicao atual do usuario;
- consumo medio do veiculo;
- preco do combustivel;
- variaveis do percurso, como acidente, chuva, bloqueio, transito e obra;
- custo de ida e volta.

O app funciona 100% com dados mockados, sem API real da SEFAZ, Google Maps ou backend. A posicao atual e as coordenadas dos mercados sao simuladas para representar o que futuramente poderia vir do GPS e do Google Maps.

## 2. Funcionalidades principais

- Login, cadastro e logout mockados.
- Persistencia local com AsyncStorage.
- Cadastro de usuario com nome, e-mail, cidade e bairro.
- Cadastro de veiculo com modelo, combustivel, consumo e preco por litro.
- Lista de produtos com adicionar, editar e remover.
- Mercados mockados de Alagoas com precos, coordenadas e distancia calculada a partir da posicao atual simulada.
- Calculo de recomendacao do mercado mais vantajoso considerando produtos, combustivel e impactos no percurso.
- Tela web/mobile com componentes reaproveitaveis.

## 3. Tecnologias usadas

- **Expo**: facilita rodar o app sem configurar projeto nativo manualmente.
- **React Native**: construcao das telas mobile.
- **TypeScript**: tipagem das entidades, stores, repositories e services.
- **React Navigation**: navegacao entre login, cadastro, abas e telas.
- **Zustand**: estado global simples.
- **React Hook Form + Zod**: formularios com validacao.
- **AsyncStorage**: persistencia local.
- **NativeWind**: estilos usando classes parecidas com Tailwind.

## 4. Arquitetura do projeto

O projeto foi organizado por **features**, seguindo uma ideia de Clean Architecture.

Estrutura principal:

```txt
src/
  app/
    routes/
  shared/
    components/
    utils/
    constants/
    types/
  features/
    auth/
    user/
    vehicle/
    products/
    markets/
    recommendations/
    map/
```

Cada feature pode ter camadas:

```txt
domain/          Contratos e interfaces
application/     Regras de uso e services
infrastructure/  AsyncStorage, mocks e implementacoes concretas
presentation/    Telas, hooks e schemas
store/           Estado global com Zustand
```

### Por que essa arquitetura?

A ideia e separar responsabilidades:

- Tela nao calcula regra de negocio pesada.
- Service faz calculos e regras.
- Repository cuida da origem dos dados.
- Store conecta a tela com os dados.
- Componentes visuais sao reaproveitados.

Isso permite trocar mock por API real futuramente sem reescrever o app inteiro.

## 5. Entidades principais

Arquivo: `src/shared/types/entities.ts`

Essas interfaces definem os dados centrais do sistema.

```ts
export interface Vehicle {
  id: string;
  model: string;
  fuelType: FuelType;
  averageConsumptionKmPerLiter: number;
  fuelPricePerLiter: number;
}

export interface ShoppingProduct {
  id: string;
  name: string;
  quantity: number;
  unit: UnitType;
}

export interface Market {
  id: string;
  name: string;
  type: MarketType;
  address: string;
  city: string;
  neighborhood: string;
  distanceKm: number;
  products: MarketProductPrice[];
}

export interface Recommendation {
  market: Market;
  productsTotal: number;
  displacementCost: number;
  finalTotal: number;
  estimatedSavings: number;
  missingProducts: ShoppingProduct[];
  isBest: boolean;
}
```

### Explicacao

- `Vehicle`: guarda consumo e preco do combustivel.
- `ShoppingProduct`: representa um item da lista de compras.
- `Market`: representa supermercado ou atacadista.
- `Recommendation`: resultado final do calculo para cada mercado.

## 6. Regra de negocio mais importante

Arquivo: `src/features/recommendations/application/RecommendationService.ts`

A parte mais importante do sistema e o calculo da recomendacao por **quilometro rodado**. O app nao usa uma distancia fixa digitada pelo usuario; ele parte de uma **posicao atual mockada** e calcula a distancia ate cada mercado, simulando o comportamento que uma API como Google Maps entregaria.

Arquivo complementar: `src/features/map/application/DistanceService.ts`

O `DistanceService` calcula a distancia de ida entre a posicao atual e o mercado usando coordenadas mockadas.

```ts
calculateOneWayKm(origin: GeoLocation, destination: GeoLocation) {
  const earthRadiusKm = 6371;
  const deltaLatitude = this.toRadians(destination.latitude - origin.latitude);
  const deltaLongitude = this.toRadians(destination.longitude - origin.longitude);

  const originLatitude = this.toRadians(origin.latitude);
  const destinationLatitude = this.toRadians(destination.latitude);

  const haversine =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(originLatitude) *
      Math.cos(destinationLatitude) *
      Math.sin(deltaLongitude / 2) ** 2;

  const straightLineKm =
    2 * earthRadiusKm * Math.asin(Math.sqrt(haversine));

  return Number((straightLineKm * this.roadRouteFactor).toFixed(1));
}
```

### Por que existe um fator de rota?

Coordenadas calculam distancia em linha reta. Uma rota real de carro geralmente e maior por causa de ruas, retornos e avenidas. Por isso o mock usa um fator de rota para aproximar o comportamento de um servico como Google Maps.

Formula usada:

```txt
distanciaIdaKm = distancia entre posicaoAtual e mercado
kmRodadoTotal = distanciaIdaKm * 2
custoDeslocamentoBase = (kmRodadoTotal / consumoKmPorLitro) * precoCombustivel
percentualImpactoPercurso = soma dos impactos de acidente, chuva, bloqueio, transito e obra
custoImpactoPercurso = custoDeslocamentoBase * percentualImpactoPercurso
custoDeslocamentoAjustado = custoDeslocamentoBase + custoImpactoPercurso
totalFinal = totalProdutos + custoDeslocamentoAjustado
```

Codigo:

```ts
calculateDisplacementCost(
  oneWayDistanceKm: number,
  consumptionKmPerLiter: number,
  fuelPricePerLiter: number,
) {
  if (consumptionKmPerLiter <= 0 || fuelPricePerLiter <= 0) {
    return 0;
  }

  return ((oneWayDistanceKm * 2) / consumptionKmPerLiter) * fuelPricePerLiter;
}
```

### Como funciona

1. A posicao atual mockada representa onde o usuario esta agora.
2. Cada mercado tem latitude e longitude mockadas.
3. O `DistanceService` calcula a distancia de ida em km.
4. A distancia e multiplicada por 2 porque considera ida e volta.
5. O resultado e dividido pelo consumo do veiculo em km/l.
6. Depois multiplica pelo preco do combustivel.
7. O sistema soma os percentuais de impacto do percurso, como chuva ou acidente.
8. Esse percentual gera um acrescimo sobre o custo base do combustivel.
9. Assim temos o custo estimado de deslocamento ajustado.

Exemplo:

```txt
distancia de ida calculada pela posicao atual = 10 km
ida e volta = 20 km
consumo = 10 km/l
preco gasolina = R$ 6,00

custo = (20 / 10) * 6
custo = R$ 12,00

impacto do percurso = 25%
custo impacto = 12 * 0,25
custo impacto = R$ 3,00

custo ajustado = 12 + 3
custo ajustado = R$ 15,00
```

## 7. Como a melhor recomendacao e escolhida

Ainda no `RecommendationService`, o sistema calcula todos os mercados, ordena pelo menor total final e marca o primeiro como melhor.

```ts
buildRecommendations(
  products: ShoppingProduct[],
  markets: Market[],
  vehicle: Vehicle | null,
  currentLocation?: GeoLocation,
): Recommendation[] {
  const marketsWithCurrentDistance = currentLocation
    ? markets.map((market) =>
        this.distanceService.applyCurrentLocationDistance(
          market,
          currentLocation,
        ),
      )
    : markets;

  const recommendations = marketsWithCurrentDistance.map((market) => {
    const productsTotal = this.calculateProductsTotal(products, market);
    const displacementCost = vehicle
      ? this.calculateDisplacementCost(
          market.distanceKm,
          vehicle.averageConsumptionKmPerLiter,
          vehicle.fuelPricePerLiter,
        )
      : 0;
    const finalTotal = productsTotal + displacementCost;

    return {
      market,
      productsTotal,
      displacementCost,
      finalTotal,
      estimatedSavings: 0,
      missingProducts: this.getMissingProducts(products, market),
      isBest: false,
    };
  });

  const sorted = [...recommendations].sort((a, b) => a.finalTotal - b.finalTotal);
  const best = sorted[0];

  return sorted.map((recommendation) => ({
    ...recommendation,
    estimatedSavings: Math.max(0, recommendation.finalTotal - best.finalTotal),
    isBest: recommendation.market.id === best.market.id,
  }));
}
```

### Explicacao passo a passo

1. Recebe a posicao atual mockada.
2. Recalcula a distancia de cada mercado a partir dessa posicao.
3. Percorre todos os mercados mockados.
4. Calcula o total dos produtos naquele mercado.
5. Calcula o custo de combustivel pelos km rodados de ida e volta.
6. Soma produtos + deslocamento.
7. Ordena os mercados pelo menor total.
8. Marca o menor como `isBest: true`.
9. Calcula a diferenca de economia em relacao ao melhor.

Essa e a parte core do sistema.

## 8. Comparacao de produtos por nome

O app normaliza nomes para comparar produtos com acento, maiusculas ou minusculas.

```ts
private findMarketProduct(product: ShoppingProduct, market: Market) {
  const normalize = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  return market.products.find(
    (marketProduct) =>
      normalize(marketProduct.productName) === normalize(product.name),
  );
}
```

### Por que isso e importante?

Se o usuario digitar `Cafe tradicional`, o sistema consegue comparar melhor com dados que poderiam vir como `Café Tradicional`, `CAFE TRADICIONAL` ou com espacos extras.

## 9. Persistencia local e autenticacao mockada

Arquivo: `src/features/auth/infrastructure/AsyncStorageAuthRepository.ts`

O app nao tem backend real. A autenticacao e mockada e salva no AsyncStorage.

```ts
async login(email: string, _password: string): Promise<AuthSession> {
  const persistedUser = await AsyncStorage.getItem(STORAGE_KEYS.user);
  const user = persistedUser
    ? JSON.parse(persistedUser)
    : { ...mockUser, email };

  const session = { token: `mock-token-${createId()}`, user };

  await this.persistSession(session);
  await this.ensureDemoData(user);

  return session;
}
```

### Como funciona

- O login aceita qualquer senha valida.
- Se ja existir usuario salvo, usa esse usuario.
- Se nao existir, cria um usuario mockado.
- Cria um token fake.
- Salva a sessao no AsyncStorage.
- Garante que existam dados demo de veiculo e produtos.

Trecho que garante dados iniciais:

```ts
private async ensureDemoData(user: User) {
  const [vehicle, products] = await AsyncStorage.multiGet([
    STORAGE_KEYS.vehicle,
    STORAGE_KEYS.products,
  ]);

  await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));

  if (!vehicle[1]) {
    await AsyncStorage.setItem(
      STORAGE_KEYS.vehicle,
      JSON.stringify(mockVehicle),
    );
  }

  if (!products[1]) {
    await AsyncStorage.setItem(
      STORAGE_KEYS.products,
      JSON.stringify(mockProducts),
    );
  }
}
```

## 10. Repository: preparando para trocar mock por API real

Arquivo: `src/features/products/domain/ProductRepository.ts`

O repository e uma interface. Ele define o que precisa existir, mas nao obriga a origem dos dados.

```ts
export interface ProductRepository {
  list(): Promise<ShoppingProduct[]>;
  save(products: ShoppingProduct[]): Promise<ShoppingProduct[]>;
  clear(): Promise<void>;
}
```

Arquivo: `src/features/products/application/ProductService.ts`

O service depende da interface, nao da implementacao concreta.

```ts
export class ProductService {
  constructor(private readonly repository: ProductRepository) {}

  list() {
    return this.repository.list();
  }

  save(products: ShoppingProduct[]) {
    return this.repository.save(products);
  }
}
```

### Vantagem

Hoje usamos AsyncStorage. Amanha podemos trocar por API:

```txt
AsyncStorageProductRepository  -> hoje
ApiProductRepository           -> futuro
```

Como os services e telas usam o contrato, a troca fica mais simples.

## 11. Estado global com Zustand

Arquivo: `src/features/products/store/productStore.ts`

A store guarda os produtos e fornece acoes para a tela.

```ts
const service = new ProductService(new AsyncStorageProductRepository());

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],

  loadProducts: async () => {
    const products = await service.list();
    set({ products });
  },

  addProduct: async (product) => {
    const products = [...get().products, product];
    await service.save(products);
    set({ products });
  },

  updateProduct: async (product) => {
    const products = get().products.map((current) =>
      current.id === product.id ? product : current,
    );
    await service.save(products);
    set({ products });
  },

  removeProduct: async (id) => {
    const products = get().products.filter(
      (product) => product.id !== id,
    );
    await service.save(products);
    set({ products });
  },
}));
```

### Explicacao

- `loadProducts`: carrega do AsyncStorage.
- `addProduct`: adiciona no array e salva.
- `updateProduct`: substitui o produto editado.
- `removeProduct`: remove pelo id.
- Depois de cada mudanca, a store atualiza a tela automaticamente.

## 12. Navegacao do app

Arquivo: `src/app/routes/RootNavigator.tsx`

O app tem uma navegacao separando usuario logado e nao logado.

```tsx
export function RootNavigator() {
  const { hydrate, isLoading, session } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (isLoading) {
    return <Loading label="Preparando seus dados" />;
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {session ? (
        <RootStack.Screen component={AppNavigator} name="App" />
      ) : (
        <RootStack.Screen component={AuthNavigator} name="Auth" />
      )}
    </RootStack.Navigator>
  );
}
```

### Como funciona

1. Ao abrir o app, `hydrate()` verifica se existe sessao salva.
2. Se estiver carregando, mostra loading.
3. Se tiver sessao, abre as abas do app.
4. Se nao tiver sessao, abre login/cadastro.

Abas principais:

```tsx
<AppTabs.Screen component={HomeScreen} name="Home" />
<AppTabs.Screen component={ProductsScreen} name="Products" />
<AppTabs.Screen component={RecommendationsScreen} name="Recommendations" />
<AppTabs.Screen component={ProfileScreen} name="Profile" />
```

## 13. Reaproveitamento de codigo

O reaproveitamento foi feito em quatro pontos principais.

### 13.1 Componentes visuais

Pasta: `src/shared/components`

Componentes criados:

- `Button`
- `Input`
- `Card`
- `Header`
- `EmptyState`
- `Loading`
- `ProductCard`
- `MarketCard`
- `RecommendationCard`

Exemplo: `RecommendationCard`

```tsx
export function RecommendationCard({
  recommendation,
}: {
  recommendation: Recommendation;
}) {
  return (
    <View
      className={`rounded-lg border p-4 ${
        recommendation.isBest
          ? 'border-primary bg-teal-50'
          : 'border-slate-200 bg-white'
      }`}
    >
      <Text className="text-lg font-bold text-ink">
        {recommendation.market.name}
      </Text>

      <Row label="Produtos" value={formatCurrency(recommendation.productsTotal)} />
      <Row label="Distancia" value={formatDistance(recommendation.market.distanceKm)} />
      <Row label="Combustivel ida e volta" value={formatCurrency(recommendation.displacementCost)} />
      <Row isStrong label="Total final" value={formatCurrency(recommendation.finalTotal)} />
    </View>
  );
}
```

Esse componente pode ser usado em qualquer tela que precise mostrar uma recomendacao.

### 13.2 Utilitarios

Arquivo: `src/shared/utils/formatters.ts`

```ts
export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

export const formatDistance = (value: number) =>
  `${value.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} km`;
```

Em vez de cada tela formatar dinheiro e distancia manualmente, todas usam as mesmas funcoes.

### 13.3 Types compartilhados

As entidades ficam em `src/shared/types/entities.ts`.

Isso evita duplicar tipos em varias telas.

### 13.4 Services e repositories

As regras e acesso a dados ficam fora das telas.

Fluxo:

```txt
Tela -> Store -> Service -> Repository -> AsyncStorage ou Mock
```

Com isso, a tela fica mais limpa e o codigo fica mais facil de testar e evoluir.

## 14. Fluxo principal do sistema

```txt
1. Usuario abre o app
2. RootNavigator verifica sessao no AsyncStorage
3. Usuario faz login ou cadastro
4. App carrega dados mockados iniciais
5. Usuario edita veiculo e lista de compras
6. Tela de recomendacao busca mercados mockados
7. App usa a posicao atual mockada para calcular km rodado ate cada mercado
8. RecommendationService calcula totais
9. App destaca o mercado com menor total final
```

## 15. Dados mockados

Arquivo: `src/shared/constants/mockData.ts`

O app possui mocks para:

- usuario inicial;
- veiculo inicial;
- produtos iniciais;
- supermercados e atacadistas de Alagoas;
- precos por produto;
- coordenadas dos mercados;
- posicao atual mockada;
- distancia em km recalculada a partir dessa posicao.

Isso permite apresentar e testar todo o fluxo sem depender de internet, backend, SEFAZ ou Google Maps, mas mantendo o desenho tecnico pronto para substituir o mock por uma API real de mapas.

## 16. Parte mais complexa aplicada

A parte mais complexa foi unir dados de dominios diferentes para gerar uma decisao:

```txt
Produtos do usuario
  + Precos por mercado
  + Posicao atual mockada
  + Coordenadas do mercado
  + Km rodado ate o mercado
  + Consumo do veiculo
  + Preco do combustivel
  = Recomendacao final
```

Essa regra foi isolada em `RecommendationService`, porque ela e o centro do negocio.

Beneficios:

- Facil testar a regra separadamente.
- Evita regra de negocio dentro da tela.
- Permite trocar UI sem alterar calculo.
- Permite trocar mocks por API mantendo o calculo.

## 17. Como explicar em sala

Sugestao de fala:

> O Compra Inteligente AL compara mercados usando nao apenas o preco dos produtos, mas tambem o custo dos quilometros rodados pelo veiculo. O app parte de uma posicao atual mockada, calcula a distancia ate cada mercado como se viesse de um servico de mapas, considera ida e volta, consumo do veiculo e preco do combustivel. Assim ele mostra qual mercado tem o menor custo total. A arquitetura separa tela, estado, services e repositories para facilitar manutencao e futuras integracoes.

Depois mostre:

1. Login/cadastro.
2. Perfil e veiculo.
3. Lista de produtos.
4. Recomendacao.
5. Codigo do `RecommendationService`.
6. Estrutura de pastas por features.

## 18. Como rodar para demonstrar

Instalar dependencias:

```bash
npm install
```

Rodar no navegador:

```bash
npm run web
```

Rodar com Expo:

```bash
npm start
```

Rodar no Android, se o SDK estiver configurado:

```bash
npm run android
```

## 19. Possiveis evolucoes futuras

- Integrar dados reais da SEFAZ.
- Buscar precos por nota fiscal ou cupom fiscal.
- Trocar a posicao e distancia mockadas por Google Maps ou outro servico de rotas.
- Criar backend para usuarios e historico.
- Adicionar geolocalizacao.
- Mostrar grafico de economia.
- Adicionar filtros por atacadista, supermercado e bairro.

## 20. Resumo final

O projeto demonstra:

- app mobile funcional com Expo;
- dados persistidos localmente;
- arquitetura separada por responsabilidades;
- regra de negocio real aplicada;
- reaproveitamento de componentes;
- preparacao para integracoes futuras.

O core do sistema e o calculo de recomendacao:

```txt
menor totalFinal = melhor mercado
totalFinal = totalProdutos + custoDeslocamento
custoDeslocamento = ((distanciaIdaKm * 2) / consumoKmPorLitro) * precoCombustivel
```
