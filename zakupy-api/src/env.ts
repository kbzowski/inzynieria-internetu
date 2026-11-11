import { z } from 'zod';

// zmienne srodowiskowe sa zawsze tekstem, z.coerce zamienia je na liczby
const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  FRONTEND_URL: z.url(),
  MAX_ITEMS: z.coerce.number().int().positive(),
  DATABASE_URL: z.string().min(1),
  // krotki sekret latwo odgadnac, a z nim podrobic dowolny token
  JWT_SECRET: z.string().min(32),
  // czasy waznosci tokenow w sekundach
  ACCESS_TOKEN_TTL: z.coerce.number().int().positive(),
  REFRESH_TOKEN_TTL: z.coerce.number().int().positive(),
});

const result = envSchema.safeParse(process.env);
if (!result.success) {
  console.error('Błędna konfiguracja w .env:');
  console.error(z.prettifyError(result.error));
  process.exit(1);
}

export const env = result.data;
