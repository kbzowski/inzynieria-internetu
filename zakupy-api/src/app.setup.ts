import {
  type INestApplication,
  type NestApplicationOptions,
  StandardSchemaValidationPipe,
} from '@nestjs/common';

// opcje podawane przy tworzeniu aplikacji (NestFactory.create)
export const appOptions: NestApplicationOptions = {
  routeConflictPolicy: { shadow: 'warn' },
  routeResolutionStrategy: 'specificity',
};

// ustawienia calej aplikacji w jednym miejscu, uzyja ich tez testy
export function configureApp(app: INestApplication) {
  // sprawdza parametry, ktore maja schemat w dekoratorze (@Body({ schema }) itp.)
  app.useGlobalPipes(new StandardSchemaValidationPipe());
}
