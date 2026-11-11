# Zakupy API – REST API w NestJS

Serwer z REST API dla listy zakupów. W kolejnych krokach rośnie od jednego pliku do API
z bazą danych, logowaniem i testami. Produkt ma ten sam kształt co w projekcie `lista-zakupow`
(`id`, `name`, `bought`), więc później frontend będzie mógł korzystać z tego API.

Wersje: Node 24, npm 11, NestJS 12.4, @nestjs/cli 12.0, @nestjs/swagger 12.1, TypeScript 6.0, Zod 4.6.

## Uruchomienie

```bash
npm install          # instaluje zależności (po pobraniu projektu)
cp .env.example .env # konfiguracja (od kroku 8), w wierszu poleceń cmd: copy .env.example .env
npm run start:dev    # serwer z automatycznym restartem po zmianie kodu, http://localhost:3000
npm run build        # kompilacja do katalogu dist i sprawdzenie typów
npm run start:prod   # uruchomienie skompilowanej wersji z dist
npm run format       # Prettier, formatowanie kodu
```

## Krok 1 – szkielet projektu

Projekt tworzę oficjalnym CLI Nesta z opcją `--minimal`. Powstaje wtedy najmniejsza możliwa
aplikacja: cały kod w jednym pliku `src/main.ts`, bez testów i bez dodatkowych narzędzi.

```bash
npx @nestjs/cli@12.0.12 new zakupy-api --minimal --skip-git --no-observe -p npm
cd zakupy-api
npm run start:dev
```

`--skip-git` pomija zakładanie repozytorium (projekt jest już w repozytorium z przykładami),
`--no-observe` pomija pytanie o usługę monitorowania NestJS Observe, a `-p npm` wybiera menedżer pakietów.
Projekt jest w formacie ESM (`"type": "module"` w `package.json`), dlatego importy własnych plików
będą miały końcówkę `.js`.

W `src/main.ts` są trzy klasy i funkcja startowa:

- `AppService` – serwis, zwraca tekst `Hello World!`,
- `AppController` – kontroler, `@Get()` przypina metodę `getHello` do zapytania `GET /`,
- `AppModule` – moduł, który zbiera kontroler i serwis w całość,
- `bootstrap()` – tworzy aplikację z modułu i uruchamia serwer na porcie 3000.

Kontroler nie tworzy serwisu sam. Dostaje go w konstruktorze, a obiekt tworzy i przekazuje Nest
(wstrzykiwanie zależności, ang. dependency injection). Zapis `constructor(private readonly appService: AppService) {}`
to skrót: deklaruje pole `appService` i przypisuje do niego parametr.

Sprawdzenie w drugim terminalu:

```bash
curl -i http://localhost:3000/
```

```
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: text/html; charset=utf-8
...

Hello World!
```

Nagłówek `X-Powered-By: Express` pokazuje, że pod spodem działa serwer HTTP z biblioteki Express.
Tak domyślnie tworzy projekt CLI. Od wersji 12.3 Nest ma też własny adapter `@nestjs/platform-node`
bez Expressa, ale ten przykład zostaje przy Expressie.

Adres, do którego nie przypięto żadnej metody, kończy się odpowiedzią 404 w formacie JSON:

```bash
curl -i http://localhost:3000/abc
```

```
HTTP/1.1 404 Not Found
...
{"message":"Cannot GET /abc","error":"Not Found","statusCode":404}
```

Node 24 potrafi uruchomić plik `.ts` bezpośrednio: usuwa z niego adnotacje typów (type stripping)
i wykonuje resztę jako JavaScript. Z Nestem to nie wystarcza. Dekoratory (`@Controller`, `@Get`)
i skrót w konstruktorze trzeba zamienić na zwykły JavaScript, a Nest potrzebuje dodatkowo informacji
o typach parametrów konstruktora, żeby wiedzieć, co wstrzyknąć. Dlatego `npm run build` uruchamia
pełny kompilator TypeScriptu. Przy okazji kompilator sprawdza typy, więc błąd typu przerywa budowanie.

Moje zmiany po wygenerowaniu:

- usuwam plik `AGENTS.md` dodawany przez CLI,
- wersje w `package.json` przypinam dokładnie (bez `^`), żeby każdy zainstalował to samo,
- instaluję Prettiera (`npm install -D -E prettier`) z ustawieniami takimi jak w pełnym szablonie Nesta
  (`.prettierrc`: pojedyncze cudzysłowy, przecinek po ostatnim elemencie) i dodaję skrypt `format`,
- dodaję `.gitignore` z katalogami `node_modules` i `dist`.

## Krok 2 – warstwy

Wszystko w jednym pliku szybko robi się nieczytelne. Kod dzielę na pliki i na trzy warstwy
(architektura warstwowa). Każda warstwa ma jedno zadanie:

| warstwa | plik | zadanie |
|---|---|---|
| kontroler | `items.controller.ts` | HTTP: adres, metoda, parametry, kod odpowiedzi |
| serwis | `items.service.ts` | reguły aplikacji, np. co zrobić, gdy produktu nie ma |
| repozytorium | `items.repository.ts` | zapis i odczyt danych |

Kontroler woła serwis, serwis woła repozytorium. Żadna warstwa nie sięga dwa poziomy niżej.
Na razie dane są w zwykłej tablicy w pamięci, więc po restarcie serwera wracają trzy przykładowe
produkty. Później tablicę zastąpi baza danych i zmieni się wtedy głównie repozytorium.

Pliki produktów są w katalogu `src/items`:

- `item.dto.ts` – typ `ItemDto`, czyli kształt produktu, który API wysyła klientowi
  (DTO, ang. data transfer object, obiekt do przesyłania danych). Pola są takie same jak w typie `Item`
  w projekcie `lista-zakupow`,
- `items.repository.ts` – tablica z produktami i metoda `findAll()`,
- `items.service.ts` i `items.controller.ts` – na razie tylko przekazują listę dalej,
- `items.module.ts` – moduł, który łączy te klasy.

Kontroler ma w dekoratorze przedrostek adresu, a metoda tylko resztę:

```ts
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  findAll() {
    return this.itemsService.findAll();
  }
}
```

`@Controller('items')` razem z `@Get()` daje `GET /items`. Tablica zwrócona z metody trafia
do klienta jako JSON.

W module wpisuję kontroler oraz klasy, które Nest ma tworzyć i wstrzykiwać (providers):

```ts
@Module({
  controllers: [ItemsController],
  providers: [ItemsService, ItemsRepository],
})
export class ItemsModule {}
```

Nest widzi, że konstruktor `ItemsController` potrzebuje `ItemsService`, a konstruktor `ItemsService`
potrzebuje `ItemsRepository`. Tworzy więc najpierw repozytorium, potem serwis, na końcu kontroler.
Każdą z tych klas tworzy raz, a jeden obiekt dostają wszyscy, którzy go potrzebują.
Moduł główny `AppModule` (`src/app.module.ts`) tylko importuje `ItemsModule`, a `main.ts`
zostaje z samą funkcją startową.

Importy własnych plików mają końcówkę `.js`, choć pliki mają `.ts`. Tak wymaga format ESM:
adres w imporcie wskazuje plik, który będzie istniał po kompilacji w katalogu `dist`.

Podobne pliki potrafi wygenerować CLI (`npx nest g resource items`). Generator tworzy jednak
od razu komplet metod CRUD i osobne klasy DTO, a repozytorium nie tworzy wcale, więc tutaj piszę
wszystko ręcznie, po kawałku.

### Zapytania z pliku `requests.http`

Od tego kroku w projekcie jest plik `requests.http` z gotowymi zapytaniami. To zwykły plik tekstowy,
który WebStorm otwiera we wbudowanym kliencie HTTP. Zielona strzałka przy zapytaniu wysyła je,
a odpowiedź pojawia się w panelu obok.

```http
@baseUrl = http://localhost:3000

### Lista produktów
GET {{baseUrl}}/items
```

`###` oddziela zapytania i nadaje im nazwę, `@baseUrl` to zmienna, a `{{baseUrl}}` wstawia jej wartość.
W kolejnych krokach plik będzie rósł razem z API.

Odpowiedź na `GET /items`:

```json
[
  { "id": "11111111-1111-4111-8111-111111111111", "name": "Mleko", "bought": false },
  { "id": "22222222-2222-4222-8222-222222222222", "name": "Chleb", "bought": true },
  { "id": "33333333-3333-4333-8333-333333333333", "name": "Jajka", "bought": false }
]
```

Identyfikatory przykładowych produktów są stałe, żeby łatwo było je wpisywać w kolejnych krokach.
Mają format UUID, tak jak identyfikatory w `lista-zakupow`.

## Krok 3 – odczyt jednego produktu i filtr

Dochodzą dwa sposoby przekazania danych w adresie:

- parametr ścieżki (path param): `GET /items/11111111-...` wskazuje jeden konkretny zasób,
- parametr zapytania (query param): `GET /items?bought=false` zawęża kolekcję, a bez niego dostajemy całą listę.

W kontrolerze odczytują je dekoratory `@Param` i `@Query`:

```ts
@Get()
findAll(
  @Query('bought', new ParseBoolPipe({ optional: true })) bought?: boolean,
) {
  return this.itemsService.findAll(bought);
}

@Get(':id')
findOne(@Param('id', ParseUUIDPipe) id: string) {
  return this.itemsService.findOne(id);
}
```

`:id` w `@Get(':id')` oznacza fragment adresu o dowolnej treści. Wszystko, co przychodzi w adresie,
jest tekstem, także `false` w `?bought=false`. Zamianą i sprawdzeniem zajmują się pipe'y (pipes),
czyli klasy, które Nest uruchamia na parametrze przed wywołaniem metody:

- `ParseBoolPipe` zamienia tekst `true` albo `false` na wartość logiczną. Opcja `optional: true`
  pozwala pominąć parametr, wtedy `bought` ma wartość `undefined`,
- `ParseUUIDPipe` sprawdza, czy identyfikator ma format UUID.

Gdy pipe odrzuci wartość, metoda kontrolera w ogóle się nie wykonuje, a klient dostaje 400:

```
GET /items?bought=abc
{"message":"Validation failed (boolean string is expected)","error":"Bad Request","statusCode":400}

GET /items/123
{"message":"Validation failed (uuid is expected)","error":"Bad Request","statusCode":400}
```

Repozytorium dostaje `findById(id)` i filtr w `findAll(bought)`. Brak produktu to reguła
aplikacji, więc sprawdza go serwis:

```ts
findOne(id: string): ItemDto {
  const item = this.repository.findById(id);
  if (!item) {
    throw new NotFoundException(`Nie ma produktu ${id}`);
  }
  return item;
}
```

`NotFoundException` to wyjątek HTTP z Nesta. Nest łapie go i odsyła odpowiedź 404:

```
GET /items/99999999-9999-4999-8999-999999999999
{"message":"Nie ma produktu 99999999-9999-4999-8999-999999999999","error":"Not Found","statusCode":404}
```

Serwis rzuca tu wyjątek HTTP, choć według tabeli z kroku 2 kody odpowiedzi należą do kontrolera.
To uproszczenie typowe dla Nesta: wyjątek z kodem HTTP można rzucić w dowolnej warstwie, a Nest
zamieni go na odpowiedź.

Zły format identyfikatora i brak produktu to dwie różne sytuacje. `123` nie może być
identyfikatorem żadnego produktu, więc to błąd klienta (400). Poprawny UUID, pod którym nic nie ma,
to brak zasobu (404).

W `requests.http` są zapytania dla wszystkich tych przypadków.

## Krok 4 – dodawanie, zmiana i usuwanie

Zasób to nadal `/items`, a operację wybiera metoda HTTP:

| zapytanie | działanie | odpowiedź |
|---|---|---|
| `POST /items` | dodaje produkt | 201 Created i nowy produkt |
| `PATCH /items/:id` | zmienia wybrane pola | 200 OK i produkt po zmianie |
| `DELETE /items/:id` | usuwa produkt | 204 No Content, bez treści |

Dane nowego produktu przychodzą w treści zapytania (body) jako JSON. Opisują je dwa nowe typy
w `item.dto.ts`:

```ts
export type CreateItemDto = {
  name: string;
};

export type UpdateItemDto = {
  name?: string;
  bought?: boolean;
};
```

`CreateItemDto` ma tylko nazwę, bo identyfikator nadaje serwer (`randomUUID()` z modułu `node:crypto`),
a nowy produkt jest zawsze niekupiony. W `UpdateItemDto` oba pola są opcjonalne, bo `PATCH` zmienia
tylko to, co klient przyśle.

Kontroler odczytuje treść przez `@Body()`:

```ts
@Post()
create(@Body() data: CreateItemDto) {
  return this.itemsService.create(data);
}

@Delete(':id')
@HttpCode(204)
remove(@Param('id', ParseUUIDPipe) id: string) {
  this.itemsService.remove(id);
}
```

`POST` domyślnie odpowiada kodem 201, a pozostałe metody kodem 200. Usunięcie nie ma czego zwrócić,
więc `@HttpCode(204)` zmienia kod na 204 No Content.

Typy DTO kontroler importuje przez `import type`. Taki import dotyczy tylko TypeScriptu i znika
po kompilacji. W kontrolerze jest wymagany: zwykły `import` typu użytego przy parametrze z dekoratorem
kończy się błędem kompilacji TS1272, bo w tym projekcie kompilator zapisuje typy parametrów
dla Nesta, a sam typ nie istnieje w czasie działania programu.

Przed zmianą i usunięciem serwis woła `findOne(id)`, które rzuca 404, gdy produktu nie ma.
Drugie `DELETE` tego samego produktu kończy się więc kodem 404, ale stan serwera jest taki sam
jak po pierwszym. Metodę, której powtórzenie daje ten sam stan serwera co jedno wywołanie,
nazywa się idempotentną, nawet jeśli kody odpowiedzi się różnią. `POST` nie jest idempotentny,
bo każde wywołanie dodaje kolejny produkt.

W repozytorium dochodzą `create`, `update` i `remove`. `update` skleja stary produkt z przysłanymi
polami: `{ ...this.items[index], ...data }`. Operator `...` (spread) kopiuje pola obiektu, a pola
z `data` nadpisują stare.

### Problem: typ nie sprawdza danych

Typ `CreateItemDto` istnieje tylko dla TypeScriptu. Po kompilacji znika, a do serwera przychodzi
zwykłe zapytanie HTTP, w którym może być cokolwiek. Trzy ostatnie zapytania w `requests.http`
to pokazują:

```
POST /items  { "name": 42 }
{"id":"271c6ae0-...","name":42,"bought":false}

POST /items  {}
{"id":"3f90ed39-...","bought":false}

PATCH /items/22222222-2222-4222-8222-222222222222  { "id": "abc", "admin": true }
{"id":"abc","name":"Chleb","bought":true,"admin":true}
```

Serwer zapisał nazwę, która jest liczbą, i produkt bez nazwy. `PATCH` skopiował do produktu
wszystkie przysłane pola, także `id` i nieznane `admin`. Po tej zmianie produktu nie da się już
pobrać ani usunąć, bo `abc` nie przechodzi przez `ParseUUIDPipe`. Przepisanie do obiektu
wszystkich pól od klienta nazywa się masowym przypisaniem (mass assignment). W prawdziwej aplikacji
w ten sposób można np. nadać sobie rolę administratora.

Dane od klienta trzeba więc sprawdzać w czasie działania programu. Zajmuje się tym kolejny krok.

## Krok 5 – walidacja biblioteką Zod, wyszukiwanie i sortowanie

Dane od klienta sprawdzam schematami biblioteki Zod (`npm install -E zod`). Schemat opisuje,
jak dane mają wyglądać, i sprawdza je w czasie działania programu. Nest 12 przyjmuje taki schemat
bezpośrednio w dekoratorze parametru:

```ts
@Post()
create(@Body({ schema: createItemSchema }) data: CreateItemDto) {
  return this.itemsService.create(data);
}
```

Sam dekorator tylko zapamiętuje schemat. Sprawdza go `StandardSchemaValidationPipe`, który włączam
dla całej aplikacji w nowym pliku `src/app.setup.ts`:

```ts
export function configureApp(app: INestApplication) {
  app.useGlobalPipes(new StandardSchemaValidationPipe());
}
```

`main.ts` woła `configureApp(app)` zaraz po utworzeniu aplikacji. Ustawienia są w osobnej funkcji,
bo w krokach z testami ta sama funkcja przygotuje aplikację testową. Nazwa pipe'a pochodzi
od Standard Schema, wspólnego interfejsu bibliotek walidacji. Zod go obsługuje, więc Nest nie musi
znać samej biblioteki.

### Schematy w `item.dto.ts`

```ts
export const itemSchema = z.object({
  id: z.uuid(),
  name: z
    .string()
    .trim()
    .min(1, 'Wpisz nazwę produktu')
    .max(50, 'Nazwa może mieć najwyżej 50 znaków'),
  bought: z.boolean(),
});
export type ItemDto = z.infer<typeof itemSchema>;

export const createItemSchema = itemSchema.pick({ name: true });
export type CreateItemDto = z.infer<typeof createItemSchema>;

export const updateItemSchema = itemSchema
  .pick({ name: true, bought: true })
  .partial();
export type UpdateItemDto = z.infer<typeof updateItemSchema>;
```

`z.infer` wyprowadza typ TypeScriptu ze schematu. Typy DTO mają te same nazwy co w kroku 4,
ale nie trzeba już ich pisać ręcznie i nie da się zapomnieć o zmianie typu po zmianie reguł.
`pick` wybiera pola z większego schematu, a `partial` robi wszystkie pola opcjonalnymi.
Reguły nazwy (obcięcie spacji, od 1 do 50 znaków, komunikaty) są takie same jak w schemacie
`itemSchema` w projekcie `lista-zakupow`.

Zapytania, które w kroku 4 przechodziły, teraz kończą się błędem 400 z listą problemów:

```
POST /items  { "name": 42 }
{"message":["name: Invalid input: expected string, received number"],"error":"Bad Request","statusCode":400}

POST /items  { "name": "   " }
{"message":["name: Wpisz nazwę produktu"],"error":"Bad Request","statusCode":400}
```

Schemat obiektu przepuszcza tylko pola, które opisuje, a nieznane pomija. `PATCH` z treścią
`{ "id": "abc", "admin": true }` nie zmienia już produktu, bo do serwisu trafia pusty obiekt.
Tak walidacja zamyka masowe przypisanie z kroku 4. Zod przy okazji zamienia dane: `"  Ser  "`
zostaje zapisane jako `"Ser"`.

Bez nagłówka `Content-Type: application/json` Nest nie odczyta treści jako JSON. Gdy treści nie ma
albo ma inny typ, np. `text/plain`, schemat dostaje `undefined` zamiast obiektu:

```
{"message":["Invalid input: expected object, received undefined"],"error":"Bad Request","statusCode":400}
```

`curl -d` bez `-H` wysyła dane jako formularz. Odpowiedź mówi wtedy
`name: Invalid input: expected string, received undefined`, choć nazwa była w wysłanym tekście.

### Parametry w adresie

Schematy zastępują też pipe'y z kroku 3. Dla całego obiektu parametrów zapytania wystarczy jeden schemat:

```ts
export const itemsQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  bought: z.stringbool().optional(),
  sort: z.enum(['name', '-name']).optional(),
});

export const itemIdSchema = z.uuid();
```

```ts
@Get()
findAll(@Query({ schema: itemsQuerySchema }) query: ItemsQueryDto) {
  return this.itemsService.findAll(query);
}

@Get(':id')
findOne(@Param('id', { schema: itemIdSchema }) id: string) {
  return this.itemsService.findOne(id);
}
```

Dla `GET /items/123` odpowiedź ma teraz postać `{"message":["Invalid UUID"],"error":"Bad Request","statusCode":400}`.
`@Query` bez nazwy parametru daje obiekt ze wszystkimi parametrami zapytania. Doszły dwa nowe:

- `q` – fragment nazwy, wielkość liter nie ma znaczenia: `GET /items?q=le` znajduje Mleko i Chleb,
- `sort` – `name` sortuje po nazwie rosnąco, `-name` malejąco, a bez parametru produkty są w kolejności dodania.

Parametry można łączyć: `GET /items?bought=false&sort=name`. Filtrowanie i sortowanie robi
repozytorium w `findAll(query)`. Wyszukiwanie zamienia obie nazwy na małe litery (`toLowerCase()`).
Sortowanie używa `localeCompare(..., 'pl')`, które porównuje teksty według zasad języka polskiego.
Zwykłe porównanie kodów znaków ustawiłoby polskie litery za wszystkimi łacińskimi, np. „Łosoś”
za „Woda”. `toSorted` zwraca posortowaną kopię i nie zmienia tablicy w repozytorium.

`z.stringbool()` zamienia tekst na wartość logiczną. Przyjmuje więcej słów niż `true` i `false`,
co widać w komunikacie błędu:

```
GET /items?bought=abc&sort=price
{"message":["bought: Invalid option: expected one of \"true\"|\"1\"|\"yes\"|\"on\"|\"y\"|\"enabled\"|\"false\"|\"0\"|\"no\"|\"off\"|\"n\"|\"disabled\"","sort: Invalid option: expected one of \"name\"|\"-name\""],"error":"Bad Request","statusCode":400}
```

Komunikaty w języku polskim mają tylko reguły, którym podałem własny tekst. Pozostałe są domyślnymi
komunikatami Zoda po angielsku.

## Krok 6 – błędy reguł i kody błędów

Dane mogą być poprawne, a operacja i tak niedozwolona. Serwis pilnuje teraz dwóch reguł:

- na liście nie może być dwóch produktów o tej samej nazwie,
- lista ma najwyżej 50 produktów (stała `MAX_ITEMS` w `items.service.ts`, w kroku 8 przejdzie do konfiguracji).

Oba przypadki kończą się kodem 409 Conflict: zapytanie jest poprawne, ale kłóci się z obecnym
stanem danych. Klient nie powinien zgadywać, która reguła zadziałała, na podstawie treści komunikatu,
bo tekst może się zmienić albo zostać przetłumaczony. Dlatego wyjątek dostaje stały kod błędu
`errorCode` (nowość w Nest 12):

```ts
throw new ConflictException(`Produkt ${name} jest już na liście`, {
  errorCode: 'ITEM_EXISTS',
});
```

```
POST /items  { "name": "Mleko" }
HTTP/1.1 409 Conflict
{"message":"Produkt Mleko jest już na liście","error":"Conflict","statusCode":409,"errorCode":"ITEM_EXISTS"}
```

Przy pełnej liście kod to `ITEM_LIMIT`. Frontend może sprawdzić `errorCode` i pokazać przy polu
nazwy właściwą podpowiedź.

Nazwy porównuję dokładnie, po obcięciu spacji przez schemat. „Mleko” i „mleko” to dla API dwa różne
produkty. Ta sama reguła zadziała później w bazie danych bez dodatkowego kodu.

Sprawdzenie nazwy jest w prywatnej metodzie `checkNameIsFree`, bo potrzebują go `create` i `update`.
`update` sprawdza nazwę tylko wtedy, gdy się zmienia, więc `PATCH` z `{ "name": "Mleko", "bought": true }`
dla samego Mleka przechodzi, a dla Chleba kończy się 409. Repozytorium dostało do tego
`findByName(name)` i `count()`.

### Log

Serwis zapisuje w logu każde dodanie produktu. `Logger` z Nesta dopisuje do wpisu kontekst podany w konstruktorze (tu nazwę klasy),
a obiekt podany po komunikacie trafia do tego samego wpisu jako parametry:

```ts
private readonly logger = new Logger(ItemsService.name);
...
this.logger.log('Item created', { id: item.id, name: item.name });
```

```
[Nest] 121052  - 11.11.2026, 10:37:26     LOG [ItemsService] Item created { id: '655c7901-8714-4500-8579-66a505786d88', name: 'mleko' }
```

### Błędy, których nikt nie przewidział

Wyjątki HTTP (`NotFoundException`, `ConflictException` i inne) Nest zamienia na odpowiedź
z ich kodem i treścią. Każdy inny wyjątek, np. błąd w kodzie albo brak dostępu do pliku, kończy się
odpowiedzią 500 bez szczegółów, a pełny opis ze stosem wywołań trafia tylko do logu:

```
HTTP/1.1 500 Internal Server Error
{"statusCode":500,"message":"Internal server error"}
```

```
ERROR [ExceptionsHandler] Error: Nie mozna odczytac pliku ...
    at ItemsService.findAll (file:///.../dist/items/items.service.js:20:28)
```

Klient nie powinien widzieć ścieżek plików ani fragmentów kodu serwera, bo ułatwiają one atak.
To zachowanie daje wbudowany filtr wyjątków Nesta, więc nie trzeba pisać własnego. Wyjątków HTTP,
takich jak 404 i 409, filtr nie zapisuje w logu, bo są zwykłą odpowiedzią na złe zapytanie.

Powyższy log pochodzi z próby, w której na początku `findAll` w serwisie dopisałem na chwilę
`throw new Error('Nie mozna odczytac pliku ...')`. Tak samo można wywołać ten błąd u siebie.

## Krok 7 – kolejność tras

Dochodzi `GET /items/summary`, które zwraca liczbę wszystkich produktów i tych, które zostały
do kupienia:

```json
{ "total": 3, "left": 2 }
```

W kontrolerze metoda `summary` jest celowo zdefiniowana po `findOne`, czyli po `@Get(':id')`.
Bez dodatkowych ustawień takie zapytanie kończy się błędem:

```
GET /items/summary
{"message":["Invalid UUID"],"error":"Bad Request","statusCode":400}
```

Express sprawdza trasy w kolejności, w jakiej zostały zarejestrowane, a Nest rejestruje je
w kolejności metod w klasie. `/items/:id` pasuje do `/items/summary` (wtedy `id` to tekst `summary`),
więc zapytanie trafia do `findOne`, a schemat odrzuca `summary` jako identyfikator. Trasa `summary`
jest zasłonięta i nigdy się nie wykona.

Nest 12 ma na to dwie opcje. Podaje się je przy tworzeniu aplikacji, więc trafiają do obiektu
`appOptions` w `app.setup.ts`, który `main.ts` przekazuje do `NestFactory.create`:

```ts
export const appOptions: NestApplicationOptions = {
  routeConflictPolicy: { shadow: 'warn' },
  routeResolutionStrategy: 'specificity',
};
```

`routeConflictPolicy: { shadow: 'warn' }` wypisuje przy starcie ostrzeżenie o każdej zasłoniętej trasie:

```
WARN [NestApplication] Route GET /items/summary (ItemsController#summary) is shadowed by GET /items/:id (ItemsController#findOne). The first-registered route will match all matching requests on order-sensitive adapters.
```

`routeResolutionStrategy: 'specificity'` rejestruje trasy od najbardziej szczegółowych: stały
fragment `summary` przed parametrem `:id`. Z tą opcją `GET /items/summary` działa niezależnie
od kolejności metod, a ostrzeżenia już nie ma, bo nic nie jest zasłonięte.

W tej gałęzi obie opcje są już włączone. Błąd 400 widać po usunięciu obu linii z `appOptions`,
a samo ostrzeżenie po usunięciu tylko `routeResolutionStrategy`.

Bez tych opcji trzeba pamiętać, żeby trasy ze stałym fragmentem pisać przed trasami z parametrem.
Obie opcje są domyślnie wyłączone, żeby starsze aplikacje działały tak jak wcześniej.

## Krok 8 – konfiguracja w pliku `.env`

Limit produktów był stałą w kodzie. Takie wartości zależą od miejsca, w którym działa aplikacja
(inny port na serwerze, inny limit w testach), więc przenoszę je do zmiennych środowiskowych
(environment variables). W czasie pracy na własnym komputerze ustawia je plik `.env`:

```
PORT=3000
MAX_ITEMS=50
```

Plik `.env` jest w `.gitignore`, bo później trafią do niego hasła i klucze. W repozytorium jest
`.env.example` z tymi samymi nazwami i przykładowymi wartościami. Po pobraniu projektu trzeba go
skopiować do `.env`. Główny `.gitignore` repozytorium ignoruje wszystkie pliki `.env.*`, dlatego
`.gitignore` projektu ma wyjątek `!.env.example`.

Plik wczytuje Node opcją `--env-file`, dopisaną do skryptów w `package.json`:

```json
"start:dev": "nest start --watch --env-file .env",
"start:prod": "node --env-file-if-exists=.env dist/main"
```

`nest start` i opcja `--env-file-if-exists` pomijają brakujący plik, bo na serwerze zmienne zwykle
ustawia się inaczej niż plikiem. Tryb `--watch` nie śledzi pliku `.env`, więc po jego zmianie trzeba
uruchomić serwer ponownie.

Zmienne środowiskowe są zawsze tekstem, a brakująca zmienna ma wartość `undefined`:

```bash
MAX_ITEMS=5 node -e "const m = process.env.MAX_ITEMS; console.log(typeof m, m + 1)"
string 51
```

Gdyby kod używał `process.env.MAX_ITEMS` bezpośrednio, literówka w `.env` nie dałaby żadnego błędu.
Porównanie z `undefined` zawsze daje `false`, więc limit po cichu przestałby działać.
Dlatego konfigurację sprawdza schemat w `src/env.ts`, zanim aplikacja wystartuje:

```ts
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
```

`z.coerce.number()` zamienia tekst na liczbę. `safeParse` nie rzuca wyjątku, tylko zwraca wynik
z polem `success`. `z.prettifyError` zamienia listę błędów na czytelny tekst. Przy złej konfiguracji
proces kończy się od razu z listą wszystkich problemów:

```
Błędna konfiguracja w .env:
✖ Invalid input: expected number, received NaN
  → at PORT
✖ Invalid input: expected number, received NaN
  → at MAX_ITEMS
```

Tak wygląda wynik dla `PORT=x` i `MAX_ITEMS=abc`. Ten sam komunikat pojawia się, gdy zmiennej
w ogóle nie ma, bo `Number(undefined)` to `NaN`.

Reszta kodu importuje gotowy obiekt `env` z poprawnymi typami: `main.ts` uruchamia serwer
na `env.PORT`, a serwis porównuje liczbę produktów z `env.MAX_ITEMS`. Z `MAX_ITEMS=3` w `.env`
już pierwsze dodanie produktu (trzy są przykładowe) dostaje odpowiedź 409 z kodem `ITEM_LIMIT`.

Nest ma do konfiguracji pakiet `@nestjs/config`, który też potrafi sprawdzić zmienne schematem Zod.
Tutaj wystarcza jeden plik bez dodatkowego pakietu, a obiekt `env` można zaimportować także
w `main.ts`, zanim powstanie aplikacja.

## Krok 9 – CORS i dokumentacja API

### CORS

Frontend z projektu `lista-zakupow` działa pod `http://localhost:5173`, a API pod
`http://localhost:3000`. Pochodzenie (origin) to schemat, host i port adresu, więc inny port oznacza
inne pochodzenie. Przeglądarka stosuje regułę tego samego pochodzenia (same-origin policy), według
której skrypt strony nie może czytać odpowiedzi z innego pochodzenia. Serwer może na to pozwolić
nagłówkiem `Access-Control-Allow-Origin`. Ten mechanizm nazywa się CORS (Cross-Origin Resource Sharing).

W `configureApp` dochodzi jedna linia, a adres frontendu trafia do konfiguracji jako `FRONTEND_URL`
(schemat sprawdza go przez `z.url()`):

```ts
app.enableCors({ origin: env.FRONTEND_URL });
```

Do własnego pliku `.env` z kroku 8 trzeba dopisać `FRONTEND_URL=http://localhost:5173`, inaczej start
zakończy się błędem konfiguracji. Adres musi być bez ukośnika na końcu, bo przeglądarka porównuje
nagłówek z pochodzeniem strony znak po znaku.

Zapytanie z nagłówkiem `Origin`, takim jak wysyła przeglądarka:

```bash
curl -i -H "Origin: http://localhost:5173" http://localhost:3000/items
```

```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:5173
...
```

Przed zapytaniem `POST` z treścią JSON przeglądarka najpierw pyta serwer, czy może je wysłać.
To zapytanie wstępne (preflight) z metodą `OPTIONS`. Nest odpowiada na nie sam, nie trzeba pisać
osobnej trasy:

```bash
curl -i -X OPTIONS -H "Origin: http://localhost:5173" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: content-type" http://localhost:3000/items
```

```
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE
Access-Control-Allow-Headers: content-type
...
```

Dla zapytania z `Origin: http://example.com` serwer też wykonuje zapytanie i odpowiada 200 z danymi,
a nagłówek dalej wskazuje `http://localhost:5173`. Przeglądarka blokuje dopiero odczyt odpowiedzi
przez stronę z `example.com`. Proste zapytanie, np. `GET`, dociera więc do serwera mimo CORS.
Reguła tego samego pochodzenia chroni użytkownika przeglądarki przed obcą stroną. Serwera nie chroni,
bo `curl`, Postman czy inny serwer pobiorą dane bez przeszkód.

### Dokumentacja API

Pakiet `@nestjs/swagger` (`npm install -E @nestjs/swagger`) tworzy opis API w formacie OpenAPI
i stronę, na której można przeglądać i wywoływać trasy:

```ts
const config = new DocumentBuilder().setTitle('Zakupy API').build();
SwaggerModule.setup('docs', app, () =>
  SwaggerModule.createDocument(app, config),
);
```

Strona jest pod `http://localhost:3000/docs`, a sam opis w JSON pod `http://localhost:3000/docs-json`.
Swagger odczytuje trasy z dekoratorów kontrolera, a pola i ograniczenia ze schematów Zod przekazanych
w `@Body`, `@Param` i `@Query`. Dla `POST /items` opis treści wygląda tak:

```json
{"type":"object","properties":{"name":{"type":"string","minLength":1,"maxLength":50}},"required":["name"]}
```

Odpowiedzi nie mają w opisie schematu, bo kontroler nie podaje ich przez dekoratory. Opis wejścia
wystarcza, żeby z `/docs` wysłać każde zapytanie z tego projektu.
