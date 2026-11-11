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
