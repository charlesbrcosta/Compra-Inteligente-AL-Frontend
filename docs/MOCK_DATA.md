# Fontes reais de dados

O projeto usa dados reais ou dados cadastrados pelo usuario para usuario, veiculo, produtos, mercados, localizacao e distancia.

## Usuario e veiculo

O usuario se cadastra pelo aplicativo e os dados ficam persistidos no backend. O veiculo tambem deve ser informado pelo usuario, porque consumo medio e preco do combustivel impactam diretamente a recomendacao.

## Produtos e estabelecimentos

Os produtos e estabelecimentos usados na recomendacao devem vir da API da SEFAZ. Quando o usuario adiciona um produto, o backend valida a descricao na SEFAZ. Na recomendacao, o backend consulta os precos por estabelecimento e calcula o custo total.

## Localizacao e rota

A origem vem do GPS real do celular. A rota/distancia usa servicos gratuitos configurados no backend, como OpenRouteService e OSRM. Se o GPS nao estiver autorizado, o usuario precisa liberar a permissao para calcular a recomendacao.

## Integracao pendente

Acidentes, bloqueios, congestionamentos, obras e chuva ainda precisam de uma API gratuita real. Enquanto essa fonte nao estiver configurada, esses fatores nao entram no calculo.
