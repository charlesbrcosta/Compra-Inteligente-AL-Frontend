# Regras de negócio

## Custo de deslocamento por km rodado

O deslocamento considera a distância de ida entre a posição atual do usuário e o mercado. No app atual, essa posição e as coordenadas dos mercados são mockadas para simular o que futuramente poderia vir do Google Maps.

Depois de calcular a distância de ida, o deslocamento considera ida e volta:

```ts
kmRodadoTotal = distanciaIdaKm * 2
custoDeslocamento = (kmRodadoTotal / consumoKmPorLitro) * precoCombustivel
```

## Total final

```ts
totalFinal = totalProdutos + custoDeslocamento
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
