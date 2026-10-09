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

## Krok 2 – najpierw dane

Zanim napiszę cokolwiek w JSX, zastanawiam się, jak wygląda jeden produkt. Typ trafia do osobnego
pliku `src/types.ts`, bo w kolejnych krokach użyje go kilka komponentów:

```ts
export type Item = {
  id: string
  name: string
  bought: boolean
}
```

`id` jest potrzebne, bo nazwy mogą się powtarzać, a React musi odróżniać wiersze listy.

W `App.tsx` wpisuję na sztywno tablicę `sampleItems` z dwoma produktami i wyświetlam ją przez `map`:

```tsx
<ul>
  {sampleItems.map((item) => (
    <li key={item.id}>{item.name}</li>
  ))}
</ul>
```

`map` zamienia każdy produkt na element `<li>`. Każdy element listy dostaje `key` – stały,
niepowtarzalny klucz, po którym React rozpoznaje wiersze przy kolejnych rysowaniach.
Na tym etapie nic nie działa, ale widać, czy lista dobrze się rysuje.

`import type` mówi wprost, że z pliku biorę tylko typ. Po zamianie na JavaScript ten import znika.

## Krok 3 – podział na komponenty

Patrzę na ekran i szukam kawałków, które mają jedną odpowiedzialność:

```
App              całość strony
├── ItemForm     pole tekstowe i przycisk „Dodaj”
└── ItemList     lista albo napis „Lista jest pusta”
    └── ItemRow  jeden produkt: checkbox, nazwa, „Usuń”
```

Każdy komponent dostaje swój plik i swój typ propsów, np.:

```tsx
type ItemRowProps = {
  item: Item
}
```

`ItemList` dostaje całą tablicę, a każdemu `ItemRow` przekazuje jeden produkt. `key` jest teraz
na `<ItemRow>`, bo to on jest elementem tablicy zwracanej przez `map`.

Wszystko jest jeszcze statyczne:

- checkbox ma `readOnly`, bo pokazuje wartość z danych, ale jeszcze nie umie jej zmienić,
- „Usuń” nic nie robi; `aria-label` z nazwą produktu mówi czytnikom ekranu, który produkt usuwa,
- „Dodaj” wysyła formularz w zwykły sposób przeglądarki, więc strona się przeładowuje. Zajmę się tym w kroku 6.

Kupione produkty mają klasę `bought` (przekreślenie), dobraną warunkiem `item.bought ? 'bought' : ''`.

## Krok 4 – stan w najbliższym wspólnym rodzicu

Odhaczenie produktu ma zmieniać dane, więc lista musi stać się stanem. Gdzie go trzymać?
Listy potrzebuje `ItemList` (żeby ją pokazać), a w kolejnych krokach także `App` (żeby policzyć,
ile zostało). Dlatego stan siedzi w najbliższym wspólnym rodzicu, czyli w `App`:

```tsx
const [items, setItems] = useState<Item[]>(initialItems)
```

Tutaj podaję typ jawnie (`<Item[]>`), żeby od razu było widać, co jest w stanie.

Listę startową `App` dostaje w propsie `initialItems`, a gdy go nie ma, bierze `sampleItems`.
`main.tsx` dalej renderuje samo `<App />`. Dzięki temu da się kiedyś łatwo napisać test:
`<App initialItems={[]} />` pokaże pustą listę bez zmieniania kodu aplikacji.

Zmianę stanu robi funkcja w `App`:

```tsx
function toggleItem(id: string) {
  setItems(
    items.map((item) =>
      item.id === id ? { ...item, bought: !item.bought } : item,
    ),
  )
}
```

Tworzy **nową** tablicę (`map`) z nowym obiektem dla zmienionego produktu (`{ ...item, bought: ... }`).
Nie zmieniam starego obiektu w miejscu (`item.bought = true`) – React porównuje referencje
i nie zauważyłby zmiany.

Komponenty niżej nie dotykają stanu bezpośrednio. Dostają funkcję w propsach i tylko ją wołają.
Typ takiego propsa opisuje, czego funkcja oczekuje:

```ts
onToggle: (id: string) => void
```

W `ItemRow` checkbox traci `readOnly` i dostaje `onChange={() => onToggle(item.id)}`.
Dane płyną w dół (`items`), a informacja o kliknięciu wraca w górę (`onToggle`).
