import { execSync } from 'node:child_process';

// przed wszystkimi testami: tworzy test.db i wykonuje na niej migracje
export default function setup() {
  execSync('npx prisma migrate deploy', {
    // test.env z vitest.config.ts nie dziala w globalSetup, wiec adres bazy jeszcze raz
    env: { ...process.env, DATABASE_URL: 'file:./test.db' },
    stdio: 'inherit',
  });
}
