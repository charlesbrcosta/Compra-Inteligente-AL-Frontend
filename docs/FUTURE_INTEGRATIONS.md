# Integrações futuras

## SEFAZ

A integração com SEFAZ ja e usada para produtos, precos e estabelecimentos. Evolucoes futuras podem melhorar normalizacao e confiabilidade dos dados.

Sugestão:

- Normalizar nomes de produtos vindos de documentos fiscais.
- Associar EAN/GTIN aos itens para reduzir ambiguidade.
- Criar cache controlado por data para reduzir chamadas repetidas.

## Google Maps

Para distâncias reais:

- Criar um `DistanceService`.
- Usar origem baseada no bairro/cidade do usuário ou geolocalização autorizada.
- Substituir `market.distanceKm` pela distância retornada por rota.
- Armazenar cache local para evitar chamadas repetidas.

## Backend

O backend pode assumir:

- Autenticação real.
- Cadastro de usuários e veículos.
- Catálogo de produtos.
- Histórico de recomendações.
- Preços por mercado.

Como as telas usam stores e services, a troca deve se concentrar na camada `infrastructure`.
