# Integrações futuras

## SEFAZ

Uma integração real com dados fiscais pode ser adicionada criando repositories HTTP que implementem os contratos existentes ou novos contratos fiscais.

Sugestão:

- Criar `SefazProductPriceRepository`.
- Normalizar nomes de produtos vindos de documentos fiscais.
- Associar EAN/GTIN aos itens para reduzir ambiguidade.
- Manter fallback para preços mockados em ambiente de desenvolvimento.

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
