import type { Config } from 'drizzle-kit';

export default {
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  dialect: 'mysql',
  dbCredentials: {
    host: 'srv1552.hstgr.io',
    port: 3306,
    database: 'u761240159_anamicodb',
    user: 'u761240159_anamicodb',
    password: 'Anamico@123',
  },
} satisfies Config;
