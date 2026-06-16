# Regras de negócio

## Custo de deslocamento por km rodado

O deslocamento considera a distância de ida entre a posição atual do usuário e o mercado. No app atual, essa posição e as coordenadas dos mercados são mockadas para simular o que futuramente poderia vir do Google Maps.

Depois de calcular a distância de ida, o deslocamento considera ida e volta:

```ts
kmRodadoTotal = distanciaIdaKm * 2
custoDeslocamentoBase = (kmRodadoTotal / consumoKmPorLitro) * precoCombustivel
```

## Impactos do percurso

O sistema tambem considera variaveis mockadas que podem afetar o trajeto:

- acidente na pista;
- chuva;
- bloqueio parcial;
- transito intenso;
- obra na via.

Cada condicao possui um percentual de impacto. Esses percentuais aumentam o custo estimado de deslocamento, simulando maior consumo por lentidao, desvios, paradas e reducao de velocidade.

```ts
percentualImpactoPercurso = somaDosPercentuaisDasCondicoes
custoImpactoPercurso = custoDeslocamentoBase * percentualImpactoPercurso
custoDeslocamentoAjustado = custoDeslocamentoBase + custoImpactoPercurso
```

Para evitar valores irreais, o impacto total e limitado a 60%.

## Total final

```ts
totalFinal = totalProdutos + custoDeslocamentoAjustado
```

## Melhor mercado

O melhor mercado é aquele com o menor `totalFinal`.

## Origem dos dados e calculo da rota

Os dados do estabelecimento, como nome, endereco e coordenadas, podem vir da SEFAZ quando a integracao real estiver sendo usada.

O OpenRouteService nao e a origem dos estabelecimentos. Ele e usado apenas para calcular a rota/distancia entre a posicao do usuario e as coordenadas do estabelecimento.

Quando o backend consegue consultar o OpenRouteService, a recomendacao marca o calculo da rota como `openrouteservice`.

Quando a API externa nao esta disponivel, a recomendacao usa `local_estimate`, que calcula a distancia por coordenadas com fator de rota.

No mapa, o app exibe OpenStreetMap com Leaflet. A geometria da rota vem do backend: primeiro OpenRouteService, depois OSRM publico como fallback gratuito para evitar rota em linha reta.

## Historico

Sempre que uma recomendacao e calculada, o backend salva um snapshot do resultado no SQLite. Esse historico permite comparar recomendacoes anteriores mesmo antes da integracao com SEFAZ.

## Integracao SEFAZ

O app nao chama a SEFAZ diretamente. O frontend chama o backend, e o backend usa `SEFAZ_APP_TOKEN` para consultar:

- produtos por descricao;
- combustivel pelo tipo cadastrado no veiculo.

O preco de combustivel retornado pela SEFAZ pode preencher o campo `precoCombustivelPorLitro`, melhorando o calculo de deslocamento.

## Economia estimada

Para cada mercado que não é o melhor, a diferença exibida é:

```ts
economiaEstimada = totalFinalDoMercado - totalFinalDoMelhorMercado
```

## Produtos indisponíveis

Quando um produto da lista não existe no mercado mockado, ele é listado como indisponível e não entra na soma daquele mercado.
