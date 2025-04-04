import type { H3Event } from "h3";
import type { DbClient } from "../db";

export function getDb(event: H3Event): DbClient {
  return event.context.db;
}
