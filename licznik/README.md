# Licznik – pierwszy komponent w React

Najmniejsza aplikacja, na której widać trzy rzeczy: komponent, propsy i stan.
Na końcu na stronie są dwa liczniki, każdy z własną wartością i własnym krokiem.

Wersje: Node 24, npm 11, create-vite 9, Vite 8.3, React 19.2, TypeScript 6.0.

## Uruchomienie

```bash
npm install        # instaluje zależności (raz, po pobraniu projektu)
npm run dev        # serwer deweloperski, http://localhost:5173
npm run build      # sprawdzenie typów (tsc -b) i budowa do katalogu dist
npm run preview    # podgląd zbudowanej wersji
npm run lint       # oxlint
npm run format     # oxfmt, formatowanie kodu
```

Sam Vite w trybie `dev` tylko usuwa typy i nie zgłasza błędów TypeScriptu. Dlatego w projekcie
jest wtyczka `vite-plugin-checker`: w czasie `npm run dev` uruchamia w tle `tsc` i pokazuje błędy
w terminalu oraz na nakładce w przeglądarce. `npm run build` też sprawdza typy (`tsc -b`).

## Krok 1 – szkielet projektu

Szkielet robię generatorem Vite. Szablon `react-ts` to React z TypeScriptem.

```bash
npm create vite@latest licznik -- --template react-ts
cd licznik
npm install
npm run dev
```

Podwójny myślnik `--` jest potrzebny, bo bez niego npm potraktowałby `--template` jak swoją opcję.
Pod `http://localhost:5173` pokazuje się strona startowa Vite.

Zaraz potem dodaję wtyczkę, która pokazuje błędy TypeScriptu już w czasie `npm run dev`:

```bash
npm install -D vite-plugin-checker
```

W `vite.config.ts` dopisuję ją do listy `plugins`. Opcja `buildMode: true` każe sprawdzać projekt
tak jak `tsc -b`, czyli razem z plikami wskazanymi w `references` w `tsconfig.json`:

```ts
import checker from 'vite-plugin-checker'

export default defineConfig({
  plugins: [react(), checker({ typescript: { buildMode: true } })],
})
```

Do formatowania kodu dodaję oxfmt. W `.oxfmtrc.json` ustawiam linie do 80 znaków, pojedyncze
cudzysłowy i brak średników, tak jak w kodzie z generatora, oraz pomijam pliki `.md`. Skrypt `format`
w `package.json` uruchamia `oxfmt`:

```bash
npm install -D oxfmt
npm run format
```

Potem usuwam to, czego nie potrzebuję:

```bash
rm -rf src/App.css src/assets public/icons.svg
```

`src/index.css` skracam do kilku reguł, w `index.html` zmieniam `lang` na `pl` i tytuł na „Liczniki”.
`src/App.tsx` zostawiam z samym nagłówkiem. `src/main.tsx` się nie zmienia – tylko montuje `<App />`
w `<div id="root">` z `index.html`.

## Krok 2 – statyczny widok

Zaczynam od tego, co widać, a zachowanie dodaję na końcu. Najpierw sam HTML w `App.tsx`,
bez żadnej logiki, żeby zobaczyć układ:

```tsx
<section className="counter">
  <h2>Kroki</h2>
  <p>0</p>
  <button>-1</button>
  <button>Zeruj</button>
  <button>+1</button>
</section>
```

Przyciski jeszcze nic nie robią, a liczba to zwykły tekst. W JSX atrybut `class` z HTML zapisuje
się jako `className`, bo `class` to słowo zarezerwowane w JavaScripcie.

## Krok 3 – wydzielenie komponentu

Chcę mieć dwa liczniki, więc kopiowanie całej `<section>` byłoby złym pomysłem: każdą poprawkę
trzeba by robić w dwóch miejscach. Przenoszę ją do osobnego pliku `src/Counter.tsx`:

```tsx
function Counter() {
  return (
    <section className="counter">
      ...
    </section>
  )
}

export default Counter
```

Komponent to zwykła funkcja, która zwraca JSX. Jej nazwa zaczyna się wielką literą – po tym React
odróżnia własne komponenty od znaczników HTML. W `App.tsx` importuję go i używam dwa razy:

```tsx
<Counter />
<Counter />
```

Na stronie są teraz dwa identyczne liczniki, oba z napisem „Kroki”. Żeby się różniły,
komponent musi dostać dane z zewnątrz – to następny krok.
