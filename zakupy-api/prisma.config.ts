import { existsSync } from 'node:fs';
import { defineConfig } from 'prisma/config';

// po pobraniu projektu .env jeszcze nie ma, a npm install uruchamia prisma generate
if (existsSync('.env')) {
  process.loadEnvFile();
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: process.env.DATABASE_URL },
});
