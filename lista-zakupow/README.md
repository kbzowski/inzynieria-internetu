# Lista zakupów – kilka komponentów i wspólny stan

Drugi przykład po liczniku. Tu stan jest tablicą obiektów, dzieli go kilka komponentów,
a dane przechodzą w dół przez propsy i wracają w górę przez funkcje.

Na końcu można dodać produkt, odhaczyć go jako kupiony i usunąć. Pod listą widać, ile zostało do kupienia.
Danych nigdzie nie zapisuję – po odświeżeniu strony lista wraca do stanu początkowego.

Wersje: Node 24, npm 11, create-vite 9, Vite 8.3, React 19.2, TypeScript 6.0,
od kroku 9 także @tanstack/react-form 1.33 i Zod 4.6.

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
const rows = sampleItems.map((item) => <li key={item.id}>{item.name}</li>)

return (
  <main>
    <h1>Lista zakupów</h1>
    <ul>{rows}</ul>
  </main>
)
```

`map` zamienia każdy produkt na element `<li>`. Każdy element listy dostaje `key` – stały,
niepowtarzalny klucz, po którym React rozpoznaje wiersze przy kolejnych rysowaniach.
Na tym etapie nic nie działa, ale widać, czy lista dobrze się rysuje.

Wynik `map` trafia do zmiennej `rows`, a JSX wstawia ją w `<ul>{rows}</ul>`. Nad każdą operacją
na tablicy (`map`, `filter`, `[...items, item]`) komentarz w kodzie pokazuje to samo zapisane
zwykłą pętlą `for`.

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

## Krok 5 – usuwanie

Drugą zmianę robię tym samym sposobem. W `App` dochodzi funkcja:

```tsx
function removeItem(id: string) {
  setItems(items.filter((item) => item.id !== id))
}
```

`filter` też zwraca **nową** tablicę – bez produktu o podanym `id`. Starej tablicy nie zmieniam
(np. przez `splice`), z tego samego powodu co w kroku 4.

`ItemList` i `ItemRow` dostają nowy props `onRemove: (id: string) => void`, a przycisk „Usuń”
woła go w `onClick`. Gdy usunę wszystkie produkty, `ItemList` pokazuje „Lista jest pusta.”

## Krok 6 – formularz dodawania

`ItemForm` dostaje własny stan `name`, bo tekst w polu nikogo poza formularzem nie obchodzi.
Pole jest kontrolowane (controlled input): jego wartość pochodzi ze stanu, a każda zmiana trafia
z powrotem do stanu:

```tsx
<input
  value={name}
  onChange={(event) => setName(event.target.value)}
  ...
/>
```

Wysłanie formularza obsługuje `handleSubmit`:

```tsx
function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
  event.preventDefault()
  const trimmed = name.trim()
  if (trimmed === '') {
    return
  }
  onAdd(trimmed)
  setName('')
}
```

`event.preventDefault()` zatrzymuje domyślne zachowanie przeglądarki, czyli przeładowanie strony
z kroku 3. Potem przycinam spacje, odrzucam pusty tekst i dopiero wtedy wołam `onAdd`.
Typ zdarzenia `SubmitEvent<HTMLFormElement>` pochodzi z Reacta (`import { useState, type SubmitEvent } from 'react'`).

W `App` dochodzi `addItem`:

```tsx
function addItem(name: string) {
  const item: Item = { id: crypto.randomUUID(), name, bought: false }
  setItems([...items, item])
}
```

`crypto.randomUUID()` to funkcja przeglądarki, która daje niepowtarzalny identyfikator.
`[...items, item]` to nowa tablica: stare produkty i nowy na końcu.

## Krok 7 – wartość wyliczana

Pod listą chcę pokazać, ile produktów zostało do kupienia. Kusi, żeby dodać drugi stan `left`
i zmieniać go w `addItem`, `toggleItem` i `removeItem`. To zły pomysł: wystarczy zapomnieć o nim
w jednej funkcji i liczba rozjedzie się z listą.

Zamiast tego liczę ją przy każdym rysowaniu z tego, co już jest w stanie:

```tsx
const left = items.filter((item) => !item.bought).length
```

i pokazuję pod listą: `<p>Do kupienia: {left}</p>`. Gdy `items` się zmieni, React narysuje `App`
od nowa, a `left` policzy się samo.

## Krok 8 – własny hook

Aplikacja działa, więc porządkuję. W `App` są teraz dwie różne rzeczy: logika listy
(stan, `left` i trzy funkcje zmieniające stan) oraz wygląd (JSX). Logikę przenoszę do osobnego
pliku `src/useShoppingList.ts`:

```ts
function useShoppingList(initialItems: Item[]) {
  const [items, setItems] = useState<Item[]>(initialItems)
  ...
  return { items, left, addItem, toggleItem, removeItem }
}
```

Własny hook to zwykła funkcja, której nazwa zaczyna się od `use` i która w środku woła inne hooki
(tu `useState`). Obowiązują go te same zasady co `useState`: wołamy go na najwyższym poziomie
komponentu, nie w `if` ani w pętli. Plik ma rozszerzenie `.ts`, bo nie ma w nim JSX.

`App` tylko bierze z hooka to, czego potrzebuje, i składa interfejs:

```tsx
const { items, left, addItem, toggleItem, removeItem } =
  useShoppingList(initialItems)
```

Zachowanie aplikacji się nie zmieniło. Zyski: `App` czyta się szybciej, a logikę listy da się kiedyś
przetestować bez rysowania formularza i przycisków (`renderHook` z Testing Library).

## Krok 9 – formularz w TanStack Form, walidacja z Zod

Formularz z kroku 6 obsługuje jedno pole i jedną regułę („nie może być puste”), a wynik sprawdzenia
po prostu przerywa dodawanie. Przy większych formularzach ręczne trzymanie stanu każdego pola,
reguł walidacji i komunikatów błędów szybko się rozrasta. Dlatego w tym kroku formularz przechodzi
na dwie biblioteki:

- **TanStack Form** – trzyma wartości pól, stan formularza (np. czy pole było już edytowane)
  i błędy walidacji,
- **Zod** – opisuje, jakie dane są poprawne.

```bash
npm install @tanstack/react-form zod
```

Pozostałe komponenty i hook `useShoppingList` się nie zmieniają.

### Schemat Zod

Zod opisuje kształt danych schematem (schema). Schemat umie sprawdzić wartość w czasie działania
programu, a TypeScript potrafi wyprowadzić z niego typ. W `src/types.ts` typ `Item` zastępuje schemat:

```ts
export const itemSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .trim()
    .min(1, 'Wpisz nazwę produktu')
    .max(50, 'Nazwa może mieć najwyżej 50 znaków'),
  bought: z.boolean(),
})

export type Item = z.infer<typeof itemSchema>
```

- `z.infer` wyprowadza typ ze schematu. `Item` ma te same pola co wcześniej, ale opis jest tylko
  w jednym miejscu, więc typ i reguły walidacji nie mogą się rozjechać,
- `.trim()` przycina spacje przed sprawdzeniem długości, więc samo `"   "` nie przejdzie,
- teksty w `min` i `max` to komunikaty błędów dla użytkownika.

Formularz nie zna `id` ani `bought`, potrzebuje tylko nazwy. `pick` wybiera ze schematu wskazane pola:

```ts
export const newItemSchema = itemSchema.pick({ name: true })
```

### Formularz

`useForm` tworzy formularz. Dostaje wartości początkowe, walidator i funkcję wywoływaną po
poprawnej walidacji:

```tsx
const form = useForm({
  defaultValues: { name: '' },
  validators: { onChange: newItemSchema },
  onSubmit: ({ value }) => {
    onAdd(value.name.trim())
    form.reset()
  },
})
```

- `defaultValues` określa pola formularza i ich typy; TypeScript wie, że `value.name` to `string`,
- `validators: { onChange: newItemSchema }` sprawdza dane schematem przy każdej zmianie pola
  i przy wysłaniu formularza. Schemat Zod można podać wprost, bo obie biblioteki obsługują
  wspólny standard opisu walidatorów (Standard Schema),
- `onSubmit` uruchamia się tylko wtedy, gdy walidacja przeszła,
- walidator sprawdza dane, ale ich nie zmienia, dlatego `trim()` jest wywoływane jeszcze raz,
- `form.reset()` przywraca wartości początkowe i czyści błędy.

Wysłanie formularza nadal zaczyna się od `event.preventDefault()`, a potem przekazuje sterowanie
bibliotece przez `form.handleSubmit()`.

Pole opisuje komponent `form.Field`. Jako dziecko dostaje funkcję, która otrzymuje obiekt `field`
i zwraca JSX:

```tsx
<form.Field name="name">
  {(field) => (
    <>
      <input
        value={field.state.value}
        onChange={(event) => field.handleChange(event.target.value)}
        onBlur={field.handleBlur}
        ...
      />
      <button type="submit">Dodaj</button>
      {field.state.meta.errors.length > 0 && (
        <p role="alert">{field.state.meta.errors[0]?.message}</p>
      )}
    </>
  )}
</form.Field>
```

Pole nadal jest kontrolowane, jak w kroku 6. Różnica polega na tym, że wartość trzyma formularz
(`field.state.value`, `field.handleChange`), a nie `useState` w komponencie. `name="name"` musi być
jednym z kluczy `defaultValues`; literówka nie przejdzie przez TypeScript.

Błędy walidacji są w `field.state.meta.errors`. Pokazuję pierwszy z nich w elemencie z `role="alert"`,
który czytniki ekranu odczytują od razu.

Jak sprawdzić:

- kliknij „Dodaj” przy pustym polu – pojawia się „Wpisz nazwę produktu”,
- wpisz 51 znaków – komunikat o długości pojawia się w trakcie pisania,
- wpisz nazwę ze spacjami na początku i końcu – produkt zostaje dodany bez spacji, a pole i komunikat
  się czyszczą.
