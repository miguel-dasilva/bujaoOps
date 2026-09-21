import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Driver HTTP: ideal para serverless na Vercel. Não suporta transações
// interativas; quando precisares delas (fecho de caixa), troca para o
// driver WebSocket (drizzle-orm/neon-serverless) só nesse ponto.
const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle({ client: sql, schema });
