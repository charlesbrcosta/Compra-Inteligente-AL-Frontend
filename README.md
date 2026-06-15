# Compra Inteligente AL

Aplicativo mobile e web desenvolvido com **React Native**, **Expo** e **TypeScript** para comparar supermercados e atacadistas de Alagoas considerando o preço dos produtos e o custo estimado de deslocamento do veículo.

O projeto funciona com dados mockados e foi estruturado para evoluir futuramente para integrações reais com backend, SEFAZ e serviços de mapas.

## Sumário

- [Visão geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Requisitos](#requisitos)
- [Instalação local](#instalação-local)
- [Configuração da API](#configuração-da-api)
- [Como rodar](#como-rodar)
- [Scripts disponíveis](#scripts-disponíveis)
- [Dados mockados](#dados-mockados)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Regra de negócio principal](#regra-de-negócio-principal)
- [Validação](#validação)
- [Documentação complementar](#documentação-complementar)
- [Como contribuir](#como-contribuir)
- [Padrão de commits](#padrão-de-commits)
- [Roadmap](#roadmap)

## Visão geral

O **Compra Inteligente AL** ajuda o usuário a decidir onde comprar de forma mais econômica.

O usuário pode:

- cadastrar seus dados;
- cadastrar seu veículo;
- informar consumo médio e preço do combustível;
- montar uma lista de compras;
- comparar mercados mockados;
- receber uma recomendação do mercado mais vantajoso.

A recomendação considera:

- total dos produtos no mercado;
- distância entre a posição atual mockada e o mercado;
- custo de combustível para ida e volta;
- total final da compra.

## Funcionalidades

- Autenticação mockada com login, cadastro e logout.
- Persistência local com AsyncStorage.
- Cadastro de usuário com nome, e-mail, cidade e bairro.
- Cadastro de veículo com modelo, tipo de combustível, consumo médio e preço por litro.
- Lista de produtos com adicionar, editar e remover.
- Mercados mockados de Alagoas com preços, coordenadas e produtos disponíveis.
- Cálculo de recomendação considerando km rodado do veículo.
- Destaque visual para o mercado mais vantajoso.
- Interface responsiva para mobile e web.
- Documentação técnica para evolução futura.

## Tecnologias

- React Native
- Expo
- TypeScript
- React Navigation
- Zustand
- React Hook Form
- Zod
- AsyncStorage
- NativeWind
- React Native Web

## Requisitos

Antes de começar, instale:

- Node.js 18 ou superior
- npm
- Git
- Expo Go, caso queira testar em celular físico
- Android Studio e Android SDK, caso queira testar em emulador Android

Para testar no iOS Simulator, é necessário macOS com Xcode.

## Instalação local

Clone o repositório:

```bash
git clone <url-do-repositorio>
```

Acesse a pasta:

```bash
cd compra_inteligente_al
```

Instale as dependências:

```bash
npm install
```

## Configuração da API

O frontend consome o backend em:

```txt
http://localhost:3333/api
```

Essa configuração fica em:

```txt
src/shared/api/apiConfig.ts
```

Antes de usar login, produtos, veículo, mercados ou recomendações, suba o backend:

```bash
cd ../Backend
npm install
npm run db:setup
npm run dev
```

Depois rode o frontend em outro terminal.

Em emulador Android, talvez seja necessário trocar `localhost` por `10.0.2.2` em `apiConfig.ts`, porque o emulador trata `localhost` como o próprio dispositivo virtual.

## Como rodar

### Rodar com Expo

```bash
npm start
```

Depois disso, você pode abrir o app com:

- Expo Go no celular;
- emulador Android;
- navegador web;
- iOS Simulator, se estiver em um Mac com Xcode.

### Rodar no navegador

```bash
npm run web
```

O Expo mostrará uma URL parecida com:

```bash
http://localhost:8081
```

Se a porta estiver ocupada, aceite a sugestão do Expo para usar outra porta.

### Rodar no Android

```bash
npm run android
```

Para esse comando funcionar, o Android SDK precisa estar configurado.

Exemplo de configuração no Linux:

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator
```

Depois valide:

```bash
adb version
```

### Rodar no iOS

```bash
npm run ios
```

Esse comando funciona apenas em macOS com Xcode instalado.

## Scripts disponíveis

```bash
npm start
```

Inicia o servidor Expo.

```bash
npm run web
```

Roda o app no navegador.

```bash
npm run android
```

Roda o app em um emulador ou dispositivo Android.

```bash
npm run ios
```

Roda o app no iOS Simulator.

```bash
npm run typecheck
```

Executa a checagem de tipos TypeScript.

```bash
npm run lint
```

Executa o lint configurado no projeto.

## Dados mockados

O frontend agora consome a API local do backend.

No backend ainda existem dados iniciais de demonstração para:

- autenticação;
- usuário inicial;
- veículo inicial;
- lista inicial de produtos;
- supermercados e atacadistas;
- preços dos produtos;
- coordenadas dos mercados;
- posição atual do usuário;
- distância calculada para simular rota.

Os principais dados iniciais ficam no backend em:

```txt
Backend/src/data/mockData.ts
```

## Estrutura do projeto

```txt
src/
  app/
    routes/
  shared/
    components/
    constants/
    types/
    utils/
  features/
    auth/
    user/
    vehicle/
    products/
    markets/
    recommendations/
    map/
```

O projeto segue uma organização por features com separação inspirada em Clean Architecture:

```txt
domain/          contratos e interfaces
application/     services e regras de negócio
infrastructure/  mocks, AsyncStorage e implementações concretas
presentation/    telas, hooks e schemas
store/           estado global com Zustand
```

Fluxo geral:

```txt
Screen -> Store/Hook -> Service -> Repository -> Mock/AsyncStorage
```

## Regra de negócio principal

O cálculo considera o custo dos quilômetros rodados pelo veículo.

```txt
distanciaIdaKm = distancia entre posicaoAtual e mercado
kmRodadoTotal = distanciaIdaKm * 2
custoDeslocamento = (kmRodadoTotal / consumoKmPorLitro) * precoCombustivel
totalFinal = totalProdutos + custoDeslocamento
```

O melhor mercado é aquele com o menor `totalFinal`.

A regra fica centralizada em:

```txt
src/features/recommendations/application/RecommendationService.ts
```

O cálculo de distância mockada fica em:

```txt
src/features/map/application/DistanceService.ts
```

## Validação

Antes de abrir um pull request, rode:

```bash
npm run typecheck
```

Se estiver trabalhando em telas ou estilos, também rode o app:

```bash
npm run web
```

ou:

```bash
npm start
```

## Documentação complementar

- `docs/ARCHITECTURE.md`: decisões de arquitetura.
- `docs/BUSINESS_RULES.md`: regras de negócio.
- `docs/MOCK_DATA.md`: explicação dos mocks.
- `docs/FUTURE_INTEGRATIONS.md`: plano para integrações reais.
- `docs/APRESENTACAO_SALA.md`: material de apresentação em sala de aula.

## Como contribuir

1. Crie uma branch a partir da branch principal:

```bash
git checkout -b feature/nome-da-feature
```

2. Instale as dependências:

```bash
npm install
```

3. Faça alterações pequenas e focadas.

4. Rode a validação:

```bash
npm run typecheck
```

5. Faça commits seguindo o padrão do projeto.

6. Abra um pull request descrevendo:

- o que foi alterado;
- por que a alteração foi necessária;
- como foi testado;
- prints ou gravações, se houver mudança visual.

## Padrão de commits

Use mensagens em inglês no estilo Conventional Commits:

```txt
feat: add product editing flow
fix: correct recommendation calculation
docs: improve setup instructions
refactor: isolate distance calculation service
chore: update project configuration
```

Prefira commits pequenos e com uma única responsabilidade.

## Roadmap

Possíveis evoluções:

- Integração com backend real.
- Autenticação com JWT.
- Banco de dados remoto.
- Integração com SEFAZ.
- Integração com Google Maps ou outro serviço de rotas.
- Histórico de recomendações.
- Geolocalização real do usuário.
- Filtros por bairro, mercado e tipo de estabelecimento.

## Status do projeto

O projeto está funcional com dados mockados e pronto para demonstração, estudo e evolução.
