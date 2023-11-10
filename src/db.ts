import pg from "pg";
import { Generated, Kysely, PostgresDialect, Insertable } from "kysely";

export interface Database {
  events: EventTable;
}

export interface EventTable {
  id: Generated<number>;
  name: string;
  params: any;
}

export type Event = Insertable<EventTable>;

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

export const db = new Kysely<Database>({
  dialect,
});

export async function createEvent(event: Event): Promise<Event> {
  return await db
    .insertInto("events")
    .values(event)
    .returningAll()
    .executeTakeFirstOrThrow();
}
