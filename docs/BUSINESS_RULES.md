# Regras de negócio

## Custo de deslocamento por km rodado

O deslocamento considera a distância de ida entre a posição atual do usuário e o mercado. No app mobile, essa posição vem do GPS do dispositivo em tempo real. Se a permissão de localização for negada ou o app estiver rodando em um ambiente sem GPS, o usuário precisa ativar o GPS para calcular distância real.

Depois de calcular a distância de ida, o deslocamento considera ida e volta:

```ts
kmRodadoTotal = distanciaIdaKm * 2
custoDeslocamentoBase = (kmRodadoTotal / consumoKmPorLitro) * precoCombustivel
```

## Impactos do percurso

O sistema foi preparado para considerar variaveis externas que podem afetar o trajeto:

- acidente na pista;
- chuva;
- bloqueio parcial;
- transito intenso;
- obra na via.

Essas condicoes ainda dependem de uma API real de transito/incidentes. Enquanto essa API nao estiver configurada, acidentes, chuva, bloqueios e congestionamentos nao entram no calculo para evitar dados inventados.

```ts
percentualImpactoPercurso = somaDosPercentuaisDasCondicoes
custoImpactoPercurso = custoDeslocamentoBase * percentualImpactoPercurso
custoDeslocamentoAjustado = custoDeslocamentoBase + custoImpactoPercurso
```

Quando a integracao real existir, o impacto total deve ser limitado a 60% para evitar valores irreais.

## Total final

```ts
totalFinal = totalProdutos + custoDeslocamentoAjustado
```

## Melhor mercado

O melhor mercado é aquele com o menor `totalFinal`.

## Origem dos dados e calculo da rota

Os dados do estabelecimento, como nome, endereco e coordenadas, vem da SEFAZ.

O OpenRouteService nao e a origem dos estabelecimentos. Ele e usado apenas para calcular a rota/distancia entre a posicao do usuario e as coordenadas do estabelecimento.

Quando o backend consegue consultar o OpenRouteService, a recomendacao marca o calculo da rota como `openrouteservice`.

No mapa, o app exibe OpenStreetMap com Leaflet. A geometria da rota vem do backend: primeiro OpenRouteService, depois OSRM publico como alternativa gratuita para evitar rota em linha reta.

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

Quando um produto da lista não aparece para um estabelecimento no retorno da SEFAZ, ele é listado como indisponível e não entra na soma daquele mercado.
