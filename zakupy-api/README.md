# Zakupy API – REST API w NestJS

Serwer z REST API dla listy zakupów. W kolejnych krokach rośnie od jednego pliku do API
z bazą danych, logowaniem i testami. Produkt ma ten sam kształt co w projekcie `lista-zakupow`
(`id`, `name`, `bought`), więc później frontend będzie mógł korzystać z tego API.

Wersje: Node 24, npm 11, NestJS 12.4, @nestjs/cli 12.0, TypeScript 6.0.

## Uruchomienie

```bash
npm install          # instaluje zależności (po pobraniu projektu)
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
