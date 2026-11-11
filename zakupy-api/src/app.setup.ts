import {
  type INestApplication,
  StandardSchemaValidationPipe,
} from '@nestjs/common';

// ustawienia calej aplikacji w jednym miejscu, uzyja ich tez testy
export function configureApp(app: INestApplication) {
  // sprawdza parametry, ktore maja schemat w dekoratorze (@Body({ schema }) itp.)
  app.useGlobalPipes(new StandardSchemaValidationPipe());
}
