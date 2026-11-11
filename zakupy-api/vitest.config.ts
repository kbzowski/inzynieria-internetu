import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.spec.ts'],
    // Vitest nie wczytuje .env, a env.ts bez tych zmiennych zatrzymuje program
    env: {
      FRONTEND_URL: 'http://localhost:5173',
      MAX_ITEMS: '3',
      DATABASE_URL: 'file:./test.db',
      JWT_SECRET: 'sekret-tylko-do-testow-co-najmniej-32-znaki',
      ACCESS_TOKEN_TTL: '900',
      REFRESH_TOKEN_TTL: '604800',
    },
  },
});
