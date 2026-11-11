import { z } from 'zod';

// zmienne srodowiskowe sa zawsze tekstem, z.coerce zamienia je na liczby
const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  MAX_ITEMS: z.coerce.number().int().positive(),
});

const result = envSchema.safeParse(process.env);
if (!result.success) {
  console.error('Błędna konfiguracja w .env:');
  console.error(z.prettifyError(result.error));
  process.exit(1);
}

export const env = result.data;
