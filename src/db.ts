import pg from "pg";
import { Generated, Kysely, PostgresDialect, Insertable } from "kysely";

interface Database {
  events: EventTable;
}

interface EventTable {
  id: Generated<number>;
  name: string;
  contract_name: string;
  params: Record<string, unknown> | readonly unknown[];
  chain_id: number;
  address: string;
  metadata: unknown;
}

type Event = Insertable<EventTable>;

const dialect = new PostgresDialect({
  pool: new pg.Pool({
    database: "indexer",
    host: "127.0.0.1",
    user: "postgres",
    password: "pass",
    port: 5432,
    max: 10,
  }),
});

const db = new Kysely<Database>({
  dialect,
});

export async function createEvent(event: Event): Promise<Event> {
  return await db
    .insertInto("events")
    .values(event)
    .returningAll()
    .executeTakeFirstOrThrow();
}
