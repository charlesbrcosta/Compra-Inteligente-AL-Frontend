# Compra Inteligente AL - Apresentacao do Sistema

Este documento explica o projeto de forma mais clara para apresentacao em sala de aula. A ideia e ajudar voce a falar sobre o sistema com seguranca: qual problema ele resolve, quais tecnologias foram usadas, como a recomendacao funciona, quais dados entram no calculo e qual e o diferencial da solucao.

## 1. Visao geral

O **Compra Inteligente AL** e um aplicativo mobile criado para ajudar o usuario a decidir onde vale mais a pena fazer compras.

A diferenca principal e que o sistema nao olha somente para o preco dos produtos. Ele tambem considera o custo para chegar ate o estabelecimento. Na pratica, um mercado pode ter produtos mais baratos, mas ficar longe demais. Se o gasto com combustivel for alto, talvez ele deixe de ser a melhor opcao.

Por isso, o app calcula:

```txt
preco dos produtos
+ custo de deslocamento ida e volta
+ impactos do percurso
= custo total da compra
```

O mercado recomendado e aquele que tem o menor custo total.

## 2. Problema que o sistema resolve

Quando uma pessoa compara supermercados, normalmente ela olha so o preco dos produtos. Mas isso nem sempre mostra a realidade.

Exemplo simples:

```txt
Mercado A:
produtos = R$ 100,00
deslocamento = R$ 5,00
total = R$ 105,00

Mercado B:
produtos = R$ 95,00
deslocamento = R$ 20,00
total = R$ 115,00
```

Mesmo o Mercado B tendo produtos mais baratos, ele nao e a melhor escolha nesse exemplo, porque o deslocamento deixa a compra mais cara.

O objetivo do Compra Inteligente AL e mostrar essa diferenca para o usuario de forma simples.

## 3. Tecnologias usadas

### Frontend mobile

- **React Native**: usado para construir o aplicativo mobile.
- **Expo SDK 54**: facilita rodar o app no Expo Go, navegador e emulador.
- **TypeScript**: garante tipagem e reduz erros durante o desenvolvimento.
- **React Navigation**: controla a navegacao entre telas.
- **Zustand**: gerencia estados globais, como produtos, usuario, veiculo e sessao.
- **React Hook Form**: controla formularios.
- **Zod**: valida os dados dos formularios.
- **AsyncStorage**: persiste a sessao localmente no app.
- **NativeWind**: permite estilizar componentes com classes parecidas com Tailwind.
- **expo-location**: pega a localizacao real do celular.
- **react-native-webview**: exibe o mapa no Android e iOS.
- **Leaflet + OpenStreetMap**: exibem o mapa interativo no app.

### Backend

- **Node.js**
- **Express**
- **TypeScript**
- **SQLite**
- **Zod**

O backend centraliza as regras, protege tokens externos e fornece a API que o aplicativo consome.

### Integracoes externas

- **SEFAZ/AL**: usada para consultar precos reais de produtos, combustivel e dados dos estabelecimentos.
- **OpenRouteService**: usado para calcular distancia de rota quando disponivel.
- **OSRM**: usado como fallback gratuito para gerar rota por ruas no mapa.
- **OpenStreetMap**: usado como base visual do mapa.

## 4. Arquitetura do projeto

O projeto foi organizado pensando em evolucao. A estrutura segue uma ideia de **Clean Architecture por features**.

No frontend, a organizacao principal e:

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
    sefaz/
```

Cada feature separa responsabilidades:

```txt
domain          Tipos, contratos e entidades
application     Services e regras de uso
infrastructure  Implementacoes concretas, como API e AsyncStorage
presentation    Telas, hooks e schemas
store           Estado global com Zustand
```

No backend, as principais partes sao:

```txt
src/
  routes/       Rotas da API
  services/     Regras de negocio e integracoes externas
  database/     SQLite e persistencia
  domain/       Entidades do sistema
  config/       Variaveis de ambiente
```

Essa separacao ajuda porque a tela nao precisa saber como a SEFAZ funciona, como o SQLite salva dados ou como o calculo da recomendacao e feito. Cada parte tem uma responsabilidade.

## 5. Fluxo principal do usuario

O fluxo principal do sistema e:

```txt
1. Usuario faz login ou cadastro.
2. App salva a sessao localmente.
3. Usuario cadastra ou edita seus dados.
4. Usuario informa dados do veiculo.
5. Usuario adiciona produtos a lista.
6. App consulta dados reais da SEFAZ quando disponivel.
7. App pega a localizacao atual do celular.
8. Backend calcula distancia ate os estabelecimentos.
9. Backend calcula custo de produtos + deslocamento.
10. App mostra o mercado mais vantajoso.
```

## 6. Autenticacao e sessao

O login e feito pelo backend. Quando o usuario entra, o backend retorna uma sessao com token.

No frontend, esse token fica salvo no **AsyncStorage**, que e o armazenamento local do React Native.

Arquivo importante:

```txt
Frontend/src/shared/api/apiClient.ts
```

Quando uma rota precisa de autenticacao, o `apiClient` pega o token salvo e envia no header:

```txt
Authorization: Bearer token
```

Assim o backend sabe qual usuario esta fazendo a requisicao.

## 7. Cadastro de produtos

Na tela de produtos, o usuario pode:

- adicionar produto manualmente;
- editar produto;
- remover produto;
- consultar produtos na SEFAZ;
- adicionar um produto retornado pela SEFAZ diretamente na lista.

Arquivos importantes:

```txt
Frontend/src/features/products/presentation/ProductsScreen.tsx
Frontend/src/features/products/store/productStore.ts
Backend/src/routes/productRoutes.ts
```

A tela nao salva o produto diretamente no banco. Ela chama a store, a store chama o service/repository, e o repository chama a API.

Fluxo:

```txt
Tela -> Zustand Store -> Repository -> Backend API -> SQLite
```

## 8. Dados da SEFAZ

A SEFAZ e usada no backend. O frontend nao chama a SEFAZ diretamente.

Isso e importante porque o token da SEFAZ nao deve ficar exposto dentro do app.

Arquivo principal:

```txt
Backend/src/services/sefazClient.ts
```

Hoje a integracao busca:

- produto por descricao;
- preco;
- unidade de medida;
- data da venda;
- nome do estabelecimento;
- razao social;
- CNPJ;
- endereco;
- bairro;
- cidade;
- latitude;
- longitude;
- preco de combustivel.

Esses dados permitem que o sistema use estabelecimentos reais da SEFAZ na recomendacao.

## 9. Como os estabelecimentos da SEFAZ entram na recomendacao

O backend tenta montar mercados reais a partir dos resultados da SEFAZ.

Arquivo:

```txt
Backend/src/services/sefazMarketService.ts
```

O processo e:

```txt
1. Pega a lista de produtos do usuario.
2. Consulta a SEFAZ para cada produto.
3. Agrupa os resultados por CNPJ.
4. Monta um mercado para cada estabelecimento.
5. Guarda os precos encontrados por produto.
6. Usa apenas estabelecimentos que tenham todos os produtos da lista.
```

Essa ultima regra e importante. O sistema evita recomendar um mercado so porque ele tem um produto barato, mas nao tem o restante da compra.

Se a SEFAZ nao retornar um estabelecimento completo para aquela lista, o backend usa a base mockada como fallback. Isso mantem o app funcionando durante a demonstracao.

## 10. Localizacao e mapa

O aplicativo usa a localizacao real do celular com `expo-location`.

Arquivo:

```txt
Frontend/src/features/map/presentation/useCurrentLocation.ts
```

Quando a tela de recomendacao abre, o app pede permissao de localizacao. Se o usuario permitir, o GPS e usado como origem da rota.

Se a permissao for negada, o sistema usa uma localizacao demonstrativa para nao quebrar a experiencia.

O mapa mostra:

- onde o usuario esta;
- onde fica o estabelecimento recomendado;
- a rota entre origem e destino;
- zoom e navegacao pelo mapa.

O marcador da posicao do usuario fica parado. Ele so muda se o GPS realmente atualizar a posicao.

## 11. Como funciona o sistema de recomendacao

Essa e a parte principal do sistema.

Arquivo:

```txt
Backend/src/services/recommendationService.ts
```

O sistema recebe:

- produtos da lista;
- mercados ou estabelecimentos da SEFAZ;
- veiculo do usuario;
- localizacao atual;
- preco do combustivel;
- distancia ate cada estabelecimento;
- impactos do percurso.

Depois calcula uma recomendacao para cada mercado.

## 12. O que o calculo leva em consideracao

### 12.1 Total dos produtos

Para cada mercado, o sistema soma os produtos encontrados.

Exemplo:

```txt
Arroz: 2 unidades x R$ 5,00 = R$ 10,00
Feijao: 1 unidade x R$ 8,00 = R$ 8,00

Total dos produtos = R$ 18,00
```

### 12.2 Distancia ate o mercado

A distancia parte da localizacao atual do usuario.

O backend tenta usar servico de rota. Quando nao consegue, usa uma estimativa local por coordenadas.

Importante: o OpenRouteService ou OSRM nao sao a origem dos estabelecimentos. Eles ajudam a calcular rota/distancia. Os estabelecimentos podem vir da SEFAZ.

### 12.3 Custo de combustivel

O custo de deslocamento considera ida e volta.

Formula:

```txt
custoDeslocamentoBase = ((distanciaKm * 2) / consumoKmPorLitro) * precoCombustivel
```

Explicando com calma:

```txt
distanciaKm * 2
```

Multiplica por 2 porque o usuario vai e volta.

```txt
(distanciaKm * 2) / consumoKmPorLitro
```

Calcula quantos litros o carro deve gastar.

```txt
litrosGastos * precoCombustivel
```

Transforma o consumo em custo financeiro.

Exemplo:

```txt
distancia de ida = 10 km
ida e volta = 20 km
consumo do carro = 10 km/l
preco do combustivel = R$ 6,00

litros gastos = 20 / 10 = 2 litros
custo = 2 * 6 = R$ 12,00
```

### 12.4 Impactos do percurso

O sistema tambem considera condicoes que podem afetar o gasto no caminho:

- chuva;
- transito intenso;
- acidente;
- bloqueio;
- obra na via.

Hoje esses impactos ainda sao mockados, mas a arquitetura permite trocar por uma API no futuro.

Cada impacto aumenta o custo de deslocamento.

Exemplo:

```txt
custo base do combustivel = R$ 12,00
impacto de chuva = 10%
impacto de transito = 15%

impacto total = 25%
custo do impacto = 12 * 0,25 = R$ 3,00
custo ajustado = 12 + 3 = R$ 15,00
```

Para evitar valores fora da realidade, o impacto maximo e limitado.

### 12.5 Total final

Depois o sistema soma:

```txt
totalFinal = totalProdutos + custoDeslocamentoAjustado
```

O melhor mercado e o que tiver o menor `totalFinal`.

## 13. Exemplo completo de recomendacao

Imagine estes dados:

```txt
Produtos no mercado = R$ 120,00
Distancia de ida = 8 km
Consumo do veiculo = 10 km/l
Combustivel = R$ 6,00
Impacto do percurso = 20%
```

Calculo:

```txt
ida e volta = 8 * 2 = 16 km
litros gastos = 16 / 10 = 1,6 litros
custo base = 1,6 * 6 = R$ 9,60
custo impacto = 9,60 * 0,20 = R$ 1,92
custo ajustado = 9,60 + 1,92 = R$ 11,52
total final = 120,00 + 11,52 = R$ 131,52
```

Esse calculo e feito para cada mercado. Depois o sistema ordena todos pelo menor total.

## 14. Economia estimada

A economia estimada mostra quanto o usuario deixaria de gastar escolhendo o melhor mercado em vez de outro.

Formula:

```txt
economiaEstimada = totalFinalDoMercado - totalFinalDoMelhorMercado
```

Exemplo:

```txt
Melhor mercado = R$ 131,52
Outro mercado = R$ 145,00

Economia estimada = 145,00 - 131,52 = R$ 13,48
```

## 15. Diferencial do sistema

O diferencial do Compra Inteligente AL e juntar tres coisas que normalmente aparecem separadas:

```txt
preco real de produtos
+ localizacao do usuario
+ custo realista de deslocamento
```

Muitos sistemas mostram apenas o menor preco. Este projeto tenta responder uma pergunta mais pratica:

> Onde a compra fica mais vantajosa considerando o valor dos produtos e o custo para chegar ate la?

Outro diferencial e que o sistema foi pensado para Alagoas, usando dados da SEFAZ/AL e estabelecimentos locais.

## 16. Reaproveitamento de codigo

O projeto reaproveita codigo em varias partes.

### Componentes compartilhados

Pasta:

```txt
Frontend/src/shared/components
```

Exemplos:

- `Button`
- `Input`
- `Card`
- `Header`
- `EmptyState`
- `Loading`
- `ProductCard`
- `MarketCard`
- `RecommendationCard`

Isso evita repetir layout e comportamento em varias telas.

### Formatadores

Arquivo:

```txt
Frontend/src/shared/utils/formatters.ts
```

Usado para formatar moeda e distancia:

```txt
R$ 10,50
2,4 km
```

### Services

Services concentram regras importantes. Por exemplo:

```txt
RecommendationService
SefazMarketService
RouteDistanceService
```

Com isso, as telas ficam mais limpas e a regra de negocio fica mais facil de testar.

### Repositories

Repositories isolam a origem dos dados.

Hoje o frontend chama repositories de API. Se no futuro mudar a API, a tela nao precisa ser reescrita inteira.

## 17. Partes mais importantes do codigo

### Calculo principal

```txt
Backend/src/services/recommendationService.ts
```

Responsavel por:

- calcular total de produtos;
- calcular custo de combustivel;
- aplicar impactos do percurso;
- calcular total final;
- escolher o melhor mercado.

### Conversao SEFAZ para mercados

```txt
Backend/src/services/sefazMarketService.ts
```

Responsavel por:

- consultar produtos na SEFAZ;
- agrupar resultados por CNPJ;
- montar estabelecimentos reais;
- usar apenas mercados que tenham todos os produtos.

### Cliente SEFAZ

```txt
Backend/src/services/sefazClient.ts
```

Responsavel por chamar a API da SEFAZ usando o token no backend.

### Localizacao do usuario

```txt
Frontend/src/features/map/presentation/useCurrentLocation.ts
```

Responsavel por pedir permissao de GPS e observar a posicao do celular.

### Mapa

```txt
Frontend/src/features/map/presentation/MockMapPreview.tsx
```

Mostra o mapa com rota, origem e destino.

## 18. O que ainda e mockado

Mesmo com integracao real da SEFAZ, algumas partes ainda usam mock ou fallback:

- impactos de percurso, como acidente e bloqueio;
- fallback de mercados quando a SEFAZ nao retorna estabelecimento completo;
- fallback de localizacao quando o GPS e negado;
- fallback de distancia quando servicos externos nao respondem.

Isso nao e necessariamente um problema. E uma estrategia para o app continuar funcionando em apresentacao e desenvolvimento.

## 19. Como explicar em sala

Uma fala simples:

> O Compra Inteligente AL e um app que recomenda o supermercado mais vantajoso considerando nao apenas o preco dos produtos, mas tambem o custo de deslocamento do usuario. O app usa a localizacao atual do celular, os dados do veiculo, o preco do combustivel, a distancia ate os estabelecimentos e os precos consultados pela SEFAZ. O backend calcula o custo total de cada opcao e destaca a mais barata no contexto real do usuario.

Outra fala mais tecnica:

> A arquitetura foi separada por responsabilidades. O frontend cuida da experiencia mobile, formularios, mapa e estado da aplicacao. O backend centraliza regras de negocio, persistencia em SQLite e integracoes externas, como SEFAZ e servicos de rota. A recomendacao fica isolada em services, o que facilita testar, manter e trocar mocks por APIs reais.

## 20. Roteiro de demonstracao

Sugestao de ordem para apresentar:

```txt
1. Abrir o app.
2. Fazer login ou cadastro.
3. Mostrar cadastro de usuario e veiculo.
4. Mostrar lista de produtos.
5. Consultar produto na SEFAZ.
6. Adicionar produto da SEFAZ na lista.
7. Abrir tela de recomendacao.
8. Mostrar mapa e localizacao.
9. Explicar total dos produtos, combustivel, impacto e total final.
10. Mostrar o mercado destacado como melhor.
```

## 21. Como rodar o projeto

Backend:

```bash
cd Backend
npm install
npm run dev
```

Frontend:

```bash
cd Frontend
npm install
npx expo start -c
```

No celular, abra o Expo Go e escaneie o QR Code.

O arquivo `.env` do frontend precisa apontar para o IP do computador:

```txt
EXPO_PUBLIC_API_BASE_URL=http://SEU_IP:3333/api
```

## 22. Resumo final

O sistema recomenda o melhor mercado usando:

```txt
produtos da lista
+ precos por estabelecimento
+ localizacao atual
+ distancia da rota
+ consumo do veiculo
+ preco do combustivel
+ impactos do percurso
= total final da compra
```

O core do sistema e:

```txt
menor totalFinal = melhor recomendacao
```

E a principal contribuicao do projeto e transformar uma comparacao simples de preco em uma decisao mais realista para o usuario.
