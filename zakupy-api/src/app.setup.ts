import {
  type INestApplication,
  type NestApplicationOptions,
  StandardSchemaValidationPipe,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { env } from './env.js';

// opcje podawane przy tworzeniu aplikacji (NestFactory.create)
export const appOptions: NestApplicationOptions = {
  routeConflictPolicy: { shadow: 'warn' },
  routeResolutionStrategy: 'specificity',
};

// ustawienia calej aplikacji w jednym miejscu, uzyja ich tez testy
export function configureApp(app: INestApplication) {
  // sprawdza parametry, ktore maja schemat w dekoratorze (@Body({ schema }) itp.)
  app.useGlobalPipes(new StandardSchemaValidationPipe());
  // przegladarka pozwoli czytac odpowiedzi tylko stronie z tego adresu
  app.enableCors({ origin: env.FRONTEND_URL });
  // Ctrl+C wywola onModuleDestroy, a PrismaService zamknie polaczenie z baza
  app.enableShutdownHooks();

  // dokumentacja API pod /docs, opis tras i schematow z kodu
  const config = new DocumentBuilder().setTitle('Zakupy API').build();
  SwaggerModule.setup('docs', app, () =>
    SwaggerModule.createDocument(app, config),
  );
}
