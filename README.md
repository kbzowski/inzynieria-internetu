# Inżynieria Internetu – przykłady

Przykłady do zajęć z Inżynierii Internetu (AGH, Informatyka Techniczna).
Każdy przykład powstaje krok po kroku, a **każdy krok to osobna gałąź**. Na gałęzi `main` nie ma kodu,
tylko ten opis.

| projekt | czego uczy | gałęzie |
|---|---|---|
| `licznik` | komponent, propsy, stan, zdarzenia w React | `licznik/01-szkielet` … `licznik/05-stan` |
| `lista-zakupow` | kilka komponentów, stan w rodzicu, listy, formularz, własny hook, TanStack Form i Zod | `lista-zakupow/01-szkielet` … `lista-zakupow/09-tanstack-form` |
| `notatki` | TanStack Start: routing z plików, loadery, funkcje serwerowe, parametry w adresie | `notatki/01-szkielet` … `notatki/06-wyszukiwarka` |

Projekty `licznik` i `lista-zakupow` to sam interfejs (React + Vite). `notatki` to aplikacja fullstack.
W kolejnych częściach kursu `notatki` dostaną walidację biblioteką Zod i logowanie.

## Jak korzystać

Potrzebne są Node.js 24 (razem z npm) i git.

```bash
git clone https://github.com/kbzowski/inzynieria-internetu
cd inzynieria-internetu
git branch -a                      # lista wszystkich kroków
git switch licznik/03-komponent    # przejście do wybranego kroku
cd licznik
npm install
npm run dev
```

Każdy projekt ma własny `README.md`. Opisuje on wszystkie kroki do bieżącego włącznie:
co zostało zrobione, dlaczego i jakie polecenia trzeba było wpisać.

Co zmieniło się między dwoma krokami:

```bash
git diff licznik/03-komponent licznik/04-propsy
```

Po przejściu na inną gałąź zależności mogą być inne, więc przed `npm run dev` warto znowu wpisać `npm install`.
