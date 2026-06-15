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

## Economia estimada

Para cada mercado que não é o melhor, a diferença exibida é:

```ts
economiaEstimada = totalFinalDoMercado - totalFinalDoMelhorMercado
```

## Produtos indisponíveis

Quando um produto da lista não existe no mercado mockado, ele é listado como indisponível e não entra na soma daquele mercado.
