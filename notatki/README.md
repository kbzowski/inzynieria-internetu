# Notatki – TanStack Start: routing i funkcje serwerowe

Aplikacja fullstack w jednym projekcie. Ten sam kod w TypeScripcie działa częściowo w przeglądarce,
a częściowo na serwerze. Na razie bez bazy danych i bez logowania: notatki leżą w zwykłej tablicy
w pamięci serwera, więc po restarcie `npm run dev` wracają do stanu początkowego.

Wersje: Node 24, npm 11, @tanstack/cli 0.71, @tanstack/react-start 1.168, @tanstack/react-router 1.170,
Vite 8.3, React 19.2, TypeScript 6.0.

## Uruchomienie

```bash
npm install               # instaluje zależności (po pobraniu projektu)
npm run dev               # serwer deweloperski, http://localhost:3000
npx tsc --noEmit          # sprawdzenie typów
npm run build             # budowa do katalogu dist (część klienta i serwera) i sprawdzenie typów
npm run preview           # podgląd zbudowanej wersji
npm run generate-routes   # ręczne wygenerowanie routeTree.gen.ts, gdy dev nie działa
npm run format            # Prettier, formatowanie kodu
npm run check             # Prettier, sprawdzenie formatowania bez zmian w plikach
```

Sam `vite build` nie sprawdza typów, dlatego skrypt `build` po budowie uruchamia `tsc --noEmit`
(tak zaleca dokumentacja TanStack Start). W czasie `npm run dev` błędy TypeScriptu pokazuje wtyczka
`vite-plugin-checker` – w terminalu i na nakładce w przeglądarce.

## Krok 1 – szkielet projektu

Szkielet robię oficjalnym CLI TanStacka. Opcja `--blank` daje pustą aplikację z jedną stroną,
bez Tailwinda, narzędzi deweloperskich i przykładowych stron. `-y` przyjmuje domyślne odpowiedzi
na pozostałe pytania:

```bash
npx @tanstack/cli@0.71.1 create notatki --framework React --blank --package-manager npm --no-git --no-toolchain -y
cd notatki
npm run dev
```

CLI samo robi `npm install`. Aplikacja startuje pod `http://localhost:3000`.

Najważniejsze pliki od generatora:

- `vite.config.ts` – Vite z wtyczką `tanstackStart()`; to ona dzieli kod na część serwerową i kliencką.
- `src/router.tsx` – tworzy router z drzewa tras.
- `src/routes/__root.tsx` – szkielet całego dokumentu HTML (`<html>`, `<head>`, `<body>`).
- `src/routes/index.tsx` – strona pod adresem `/`.
- `src/routeTree.gen.ts` – drzewo tras **generowane automatycznie** z plików w `src/routes`. Nie edytuję go ręcznie.

Moje zmiany po wygenerowaniu:

- z `tsconfig.json` usuwam linię `"verbatimModuleSyntax": true`. Dokumentacja TanStack Start
  („Build from Scratch”) ostrzega, że ta opcja może wciągnąć kod serwera do paczki dla przeglądarki,
  i zaleca ją wyłączyć,
- usuwam plik `.cta.json` – to tylko zapis odpowiedzi udzielonych generatorowi,
- instaluję `vite-plugin-checker` i `prettier` (`npm install -D vite-plugin-checker prettier`). W `vite.config.ts`
  dopisuję `checker({ typescript: true })` do listy `plugins`. Projekt nie ma pliku `index.html`, więc
  wtyczka sama nie doda do strony skryptu nakładki z błędami – w `__root.tsx` dołączam go w `head`
  przez `scripts`, tylko w trybie deweloperskim (`import.meta.env.DEV`),
- do skryptu `build` dopisuję `&& tsc --noEmit`,
- `prettier.config.js` i `.prettierignore` biorę takie, jakie generuje CLI TanStacka z opcją
  `--toolchain eslint` (bez średników, pojedyncze cudzysłowy); w `.prettierignore` dopisuję `*.md`.
  Skrypty `format` i `check` uruchamiają Prettiera,
- w `__root.tsx` ustawiam `lang="pl"` i tytuł „Notatki”, a treść strony owijam w `<main>`;
  typ propsów dostaje nazwę `RootDocumentProps`,
- w `router.tsx` zostawiam tylko potrzebne opcje,
- `index.tsx` pokazuje nagłówek „Start”, a `styles.css` ma kilka podstawowych reguł.

## Krok 2 – strony i nawigacja

Routing jest oparty na plikach: plik w `src/routes` to adres.

| adres | plik |
|---|---|
| `/` | `src/routes/index.tsx` |
| `/about` | `src/routes/about.tsx` |
| `/notes` | `src/routes/notes/index.tsx` |
| `/notes/1`, `/notes/abc`, … | `src/routes/notes/$noteId.tsx` |

Zakładam trzy nowe pliki. Gdy serwer `dev` działa, po zapisaniu pustego pliku sam wpisuje w nim
szkielet z `createFileRoute('/about')` i dopisuje trasę do `routeTree.gen.ts`. Każda strona to zwykły
komponent przypięty do trasy:

```tsx
export const Route = createFileRoute('/about')({
  component: About,
})
```

`$noteId` w nazwie pliku to parametr w ścieżce – fragment adresu, który może być dowolny.
Komponent odczytuje go przez `Route.useParams()`, z typem `{ noteId: string }`.

Na liście notatek na razie wpisuję na sztywno dwa linki:

```tsx
<Link to="/notes/$noteId" params={{ noteId: '1' }}>
  Pierwsza notatka
</Link>
```

`Link` przechodzi między stronami bez przeładowania. Router zna wszystkie trasy, więc
`<Link to="/notse">` z literówką nie przejdzie przez TypeScript, a brak `params` przy `$noteId` też nie.

W `__root.tsx` dochodzi `<nav>` z trzema linkami. Aktywny link dostaje klasę `active` (pogrubienie
w `styles.css`); przy `/` dałem `activeOptions={{ exact: true }}`, bo inaczej byłby aktywny na każdej stronie.

Do trasy głównej dodaję też `notFoundComponent`. Bez niego zły adres, np. `/xyz`, pokazuje gołe
„Not Found” – dokumentacja nazywa ten domyślny widok celowo nieładnym i zaleca własny.

## Krok 3 – pierwsza funkcja serwerowa

Na stronie startowej chcę pokazać coś, co na pewno pochodzi z serwera – jego zegar:

```tsx
const getServerTime = createServerFn({ method: 'GET' }).handler(async () => {
  return new Date().toLocaleTimeString('pl-PL')
})
```

`createServerFn` sprawia, że ciało funkcji zostaje na serwerze. Do przeglądarki trafia w jego miejsce
krótki kod, który wysyła zapytanie HTTP. Wywołuję ją tak samo jak zwykłą funkcję.

Dane dla strony pobiera `loader` trasy – router czeka na niego, zanim pokaże stronę:

```tsx
export const Route = createFileRoute('/')({
  loader: () => getServerTime(),
  component: Home,
})
```

Komponent odbiera wynik przez `Route.useLoaderData()`, z poprawnym typem (tu `string`), bez
pisania typu ręcznie. Przycisk „Odśwież” woła `router.invalidate()`, czyli każe uruchomić loader
jeszcze raz.

Jak sprawdzić, że to naprawdę serwer:

- wyłącz JavaScript w przeglądarce i odśwież `/` – godzina dalej jest, bo HTML przyszedł gotowy z serwera,
- loader działa w obu miejscach: przy pierwszym wejściu serwer woła funkcję bezpośrednio, a po przejściu
  linkiem z innej strony przeglądarka wysyła zapytanie `GET /_serverFn/...` (widać je w zakładce Network).

## Krok 4 – dane notatek na serwerze

Notatki będą w zwykłej tablicy w pamięci serwera. Kod dzielę na trzy pliki według konwencji
z dokumentacji TanStack Start:

- `src/notes.ts` – typ `Note`; plik bez przyrostka, bo typ przydaje się wszędzie,
- `src/notes.server.ts` – kod **tylko dla serwera**: tablica `notes` i zwykłe funkcje `listNotes`
  i `findNote`. Gdy w przyszłości dojdzie baza danych, połączenie z nią też będzie tutaj.
  `resetNotes` przywraca dwie przykładowe notatki – przyda się w testach,
- `src/notes.functions.ts` – funkcje serwerowe (`createServerFn`), które **wolno importować
  wszędzie**, także w komponentach: `getNotes` zwraca listę, a `getNote` jedną notatkę.

Przyrostek `.server` to nie tylko nazwa. Wtyczka TanStack Start pilnuje, żeby taki plik nie trafił
do kodu przeglądarki. Gdy zaimportuję `notes.server.ts` bezpośrednio w komponencie trasy,
`npm run build` przerwie budowę komunikatem `[import-protection] Import denied in client environment`
(w trybie `npm run dev` będzie tylko ostrzeżenie). Z `notes.functions.ts` jest inaczej: w przeglądarce
ciała handlerów zostają podmienione na zapytania HTTP, więc import z `notes.server.ts` znika z kodu
klienta. Można to sprawdzić: po `npm run build` tekstu notatek nie ma w żadnym pliku w `dist/client`.

Funkcja, która przyjmuje dane, ma `.validator(...)`:

```tsx
export const getNote = createServerFn({ method: 'GET' })
  .validator((id: string) => id)
  .handler(async ({ data }) => {
    const note = findNote(data)
    if (!note) {
      throw notFound()
    }
    return note
  })
```

Walidator mówi TypeScriptowi, co wolno przekazać (`id: string`), a handler dostaje to w `data`.
Identyfikatora nie trzeba sprawdzać dokładniej: coś, co nie jest tekstem, po prostu nie pasuje
do żadnej notatki i kończy się `notFound()`.

Na liście notatek loader woła `getNotes()`, a komponent rysuje linki z danych zamiast wpisanych
na sztywno. Na stronie szczegółów loader dostaje parametr z adresu:

```tsx
loader: ({ params }) => getNote({ data: params.noteId }),
```

Gdy `getNote` rzuci `notFound()`, router zamiast `NoteDetails` pokazuje `notFoundComponent`
tej trasy – „Nie ma takiej notatki” z linkiem do listy.

## Krok 5 – dodawanie notatek

Dane nowej notatki przychodzą z przeglądarki, więc najpierw opisuję je typem i funkcją, która
je sprawdza. Oba trafiają do `src/notes.ts`:

```ts
export type NewNote = {
  title: string
  body: string
}

export function parseNewNote(input: NewNote) {
  if (typeof input?.title !== 'string' || typeof input?.body !== 'string') {
    throw new Error('Niepoprawne dane notatki')
  }
  ...
  return { title, body }
}
```

Typ parametru (`input: NewNote`) mówi TypeScriptowi, co wolno przekazać z naszego kodu. Ale na serwer
przychodzi zwykłe zapytanie HTTP i ktoś może wysłać cokolwiek, więc `parseNewNote` sprawdza dane
naprawdę: `typeof` upewnia się, że przyszły teksty, potem przycina spacje, odrzuca pusty tytuł
i pilnuje długości (tytuł do 100 znaków, treść do 2000). Bez limitu ktoś mógłby wysyłać w pętli
notatki po kilka megabajtów i zapchać pamięć serwera. Funkcja zwraca poprawne dane albo rzuca
wyjątek – i jest zwykłą funkcją, więc łatwo ją kiedyś przetestować.

W `notes.server.ts` dochodzi `insertNote`, a w `notes.functions.ts` funkcja serwerowa:

```tsx
export const addNote = createServerFn({ method: 'POST' })
  .validator(parseNewNote)
  .handler(async ({ data }) => {
    return insertNote(data)
  })
```

`method: 'POST'`, bo funkcja zmienia dane na serwerze.

Formularz na `/notes` wygląda jak w zwykłym React: dwa kontrolowane pola i `handleSubmit`.
Różnica jest w środku – zamiast zmieniać stan z tablicą wołam funkcję serwerową, a potem
`router.invalidate({ sync: true })`, żeby loader pobrał nową listę z serwera. Opcja `sync: true`
sprawia, że `await` czeka, aż nowa lista naprawdę przyjdzie.

Funkcję serwerową opakowuję w `useServerFn(addNote)`, tak jak zaleca dokumentacja dla wywołań
z komponentów: wtedy router obsłuży też rzucone z serwera `redirect` i `notFound`.

Pustego tytułu nie sprawdzam w przeglądarce. Robi to tylko `parseNewNote` na serwerze, a błąd
(`throw new Error('Tytuł jest wymagany')`) wraca do klienta jako zwykły wyjątek. Łapię go w `try/catch`
i pokazuję pod formularzem. Dzięki temu reguła jest w jednym miejscu – tam, gdzie i tak musi być.

Na czas wysyłania przycisk jest wyłączony (`isSubmitting`), tak jak w samouczku z dokumentacji –
inaczej szybkie podwójne kliknięcie dodałoby notatkę dwa razy.

Treść pochodzi z pola `<textarea>`, więc może mieć kilka wierszy. HTML domyślnie zamienia znaki
nowej linii na spację, dlatego akapit z treścią na stronie szczegółów dostaje klasę `note-body`
z regułą `white-space: pre-wrap`.

Sprawdzenie: dodaj notatkę, zrestartuj `npm run dev` i odśwież stronę. Notatka zniknęła,
bo była tylko w pamięci serwera.
