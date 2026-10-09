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
