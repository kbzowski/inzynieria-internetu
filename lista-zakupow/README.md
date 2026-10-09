# Lista zakupów – kilka komponentów i wspólny stan

Drugi przykład po liczniku. Tu stan jest tablicą obiektów, dzieli go kilka komponentów,
a dane przechodzą w dół przez propsy i wracają w górę przez funkcje.

Na końcu można dodać produkt, odhaczyć go jako kupiony i usunąć. Pod listą widać, ile zostało do kupienia.
Danych nigdzie nie zapisuję – po odświeżeniu strony lista wraca do stanu początkowego.

Wersje: Node 24, npm 11, create-vite 9, Vite 8.3, React 19.2, TypeScript 6.0.

## Uruchomienie

```bash
npm install        # instaluje zależności
npm run dev        # serwer deweloperski, http://localhost:5173
npm run build      # sprawdzenie typów (tsc -b) i budowa do katalogu dist
npm run preview    # podgląd zbudowanej wersji
npm run lint       # oxlint
npm run format     # oxfmt, formatowanie kodu
```

Błędy TypeScriptu widać już w czasie `npm run dev` – w terminalu i na nakładce w przeglądarce.
Pokazuje je wtyczka `vite-plugin-checker`, która uruchamia w tle `tsc`.

## Krok 1 – szkielet projektu

Tak samo jak w liczniku:

```bash
npm create vite@latest lista-zakupow -- --template react-ts
cd lista-zakupow
npm install
rm -rf src/App.css src/assets public/icons.svg
npm install -D vite-plugin-checker oxfmt
```

Jak w liczniku, w `vite.config.ts` dopisuję `checker({ typescript: { buildMode: true } })` do listy
`plugins`, w `package.json` skrypt `"format": "oxfmt"`, a w `.oxfmtrc.json` te same ustawienia
formatowania.

`src/index.css` skracam do kilku reguł, w `index.html` ustawiam `lang="pl"` i tytuł „Lista zakupów”,
a `src/App.tsx` zostawiam z samym nagłówkiem.
