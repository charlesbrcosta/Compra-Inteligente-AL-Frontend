# Arquitetura

O projeto segue uma organização por features com Clean Architecture em escala mobile.

## Camadas

- `domain`: contratos, interfaces e regras de entidade.
- `application`: services e casos de uso simples.
- `infrastructure`: implementações concretas, como clientes HTTP e AsyncStorage.
- `presentation`: telas, hooks de UI e schemas de formulário.
- `store`: Zustand para estado de aplicação.

## Pastas principais

- `src/app/routes`: navegação da aplicação.
- `src/shared/components`: componentes reutilizáveis.
- `src/shared/utils`: formatação, IDs e utilitários.
- `src/shared/constants`: chaves de storage e constantes compartilhadas.
- `src/features`: módulos de negócio.

## SOLID

- Repositories são definidos por interfaces para isolar API, persistencia e regras de tela.
- Services concentram regras de negócio e mantêm telas com pouca lógica.
- Componentes recebem dados por props e não dependem de infraestrutura.
