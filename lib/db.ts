import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema';

const connection = await mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  database: process.env.DATABASE_DATABASE,
  password: process.env.DATABASE_PASSWORD,
});

export const db = drizzle(connection, { schema, mode: 'default' });
