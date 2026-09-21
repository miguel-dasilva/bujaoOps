# NegocioSocos

Gestão das máquinas: festas, apuros, fecho de caixa, despesas e payback.
Next.js 16 · TypeScript · Clerk (Organizations) · Neon · Drizzle · Tailwind 4 · Vercel.

## Arranque (uma vez)

1. **Contas**: GitHub, Vercel, [Clerk](https://dashboard.clerk.com) e [Neon](https://console.neon.tech).
2. **Clerk**: cria uma aplicação (login por email) e **ativa Organizations**
   em *Configure → Organizations*. Sem isto o `/select-org` não funciona.
3. **Neon**: cria um projeto na região `eu-central-1` (Frankfurt) e copia a connection string.
4. Local:
   ```bash
   cp .env.example .env.local   # preenche as quatro variáveis
   npm install
   npm run db:generate          # gera drizzle/0000_*.sql a partir de src/db/schema.ts
   npm run db:migrate           # aplica na Neon
   npm run dev
   ```
5. **Vercel**: importa o repositório, copia as mesmas variáveis de ambiente, deploy.
   Faz isto no primeiro dia, com a app ainda vazia.

As migrações correm a partir da tua máquina (`db:migrate`), não no build da Vercel.
Para testar uma migração arriscada, cria primeiro um branch da base de dados na Neon.

## Estrutura

```
src/
  proxy.ts               proteção de rotas (Clerk). Next 16: substitui middleware.ts
  db/schema.ts           as seis tabelas da v1
  db/payback.ts          o cálculo de payback por máquina
  lib/tenant.ts          requireOrg(): obrigatório em cada página e Server Action
  lib/money.ts           cêntimos ↔ euros, sem floats
  lib/validation.ts      schemas Zod partilhados
  app/page.tsx           resumo (payback)
  app/maquinas/          lista, registar, editar + actions.ts
```

## Regras da casa

- Dinheiro sempre em cêntimos inteiros (`bigint`). A conversão só acontece à entrada
  (`parseEurosToCents`) e à saída (`formatCents`).
- Toda a query filtra por `orgId` vindo de `requireOrg()`. O `proxy.ts` não chega
  como única barreira.
- Nada se apaga no que é financeiro: `archived_at`.

## Próximos passos

- **Semana 2**: `npx shadcn@latest init`, react-hook-form com os schemas de `lib/validation.ts`,
  ecrãs de festa, apuro diário e despesa. Metes as 17 linhas do Excel.
- **Semana 3**: gráfico de apuro por festa (Recharts), ecrã de fecho de caixa por denominação.
  Desligas o Excel.
- **Semana 4**: PWA (`@serwist/next`), fila offline (Dexie), fotos de recibos (UploadThing).
