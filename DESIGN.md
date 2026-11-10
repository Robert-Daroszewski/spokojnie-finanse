# Spokojnie — kierunek projektu Liquid Glass

## Szczegółowy brief wykonawczy

Przeprojektuj Spokojnie jako dopracowaną, osobistą przestrzeń finansów. Efekt ma wynikać z kompozycji, typografii i zachowania materiałów. Zadbaj o cały produkt: pulpit, historię, raporty, inwestycje, formularze, nawigację i logowanie. Zachowaj istniejące funkcje, prawdziwe dane i infrastrukturę.

### Charakter i hierarchia

- Spokojny, precyzyjny i przyjemny interfejs z wyrazistą tożsamością. Ograniczona paleta, starannie dobrane proporcje i typografia.
- Jasny motyw: perłowe szkło, chłodne światło i dyskretne refleksy. Ciemny: grafit, srebrzyste krawędzie i przygaszone akcenty; bez zielonej dominanty.
- Kwota salda jest pierwszym punktem skupienia. Obok znajdują się rzeczywiste salda kont. Podsumowanie miesiąca, wykres i historia tworzą drugi poziom. Budżet i płatności stanowią trzeci.
- Trzy materiały: przejrzyste szkło nawigacji i narzędzi, gęstsze szkło pod danymi oraz głęboki, charakterystyczny materiał głównego salda. Nie wszystkie powierzchnie mają tę samą przezroczystość, promień i cień.
- Krótkie, funkcjonalne tytuły. Żadnych fikcyjnych wskaźników, wymyślonych transakcji ani marketingowych komunikatów w miejscu potrzebnych danych.

### Materiał, światło i detale

- Zdefiniuj spójne tokeny materiałów. Zastąp poprzedni arkusz szkła jedną kompletną implementacją.
- Użyj jasnej, precyzyjnej krawędzi, drugiego wewnętrznego odbicia, subtelnej aberracji barwnej i miękkiego cienia kontaktowego. Światło ma uzasadniać przezroczystość.
- Zaprojektuj własną wektorową rzeźbę ze szkła do karty salda i ekranu wejścia. To dekoracja, nie wykres ani dodatkowa informacja finansowa.
- Refleks przy krawędzi może podążać za kursorem. Treść, kwoty i osie wykresów pozostają nieruchome. Dekoracyjne warstwy nigdy nie przechwytują kliknięć.
- Nawigacja ma jedno wyraźne aktywne miejsce. Przyciski mają czytelny priorytet, precyzyjny hover, fokus i krótkie wciśnięcie. Nie zaokrąglaj wszystkich elementów jednakowo.
- Wykresy: neutralne podłoże, wyraźna linia, stonowane wypełnienie, spokojne osie i konsekwentna semantyka zysku/straty. Zachowaj inspekcję punktów, skalę, zakresy i eksport.
- Formularz ma być eleganckim, czytelnym arkuszem. Etykiety i aktualna wartość pola są ważniejsze niż refleks.

### Telefon i dostępność

- Kompozycja ma być zaprojektowana również dla 320–430 px. Najważniejsze kwoty są widoczne wcześnie, a mobilne menu, data i przycisk dodania wpisu pozostają wygodne.
- Duży efekt wizualny nie może powodować poziomego przewijania ani obcinania kwot.
- Ruch i efekty kursora respektują ograniczenie ruchu, ręczne wyłączenie animacji i ukrycie karty. Na ekranie dotykowym nie ma imitacji kursora.
- Ograniczenie przezroczystości, wymuszone kolory i brak obsługi filtrów przywracają pełne, czytelne powierzchnie.
- Bez ciągłego animowania rozmycia, bez ciężkiego silnika 3D i bez zewnętrznych żądań po zasoby wyglądu podczas używania aplikacji.

### Kryteria odbioru

1. Porównaj rzeczywiste rendery całych ekranów w obu motywach; poprawiaj kompozycję na podstawie obrazu.
2. Sprawdź 14 sekcji na komputerze, tablecie i telefonie, także przy 320 px.
3. Sprawdź kontrast, klawiaturę, kliknięcia, formularze, zapis i odczyt przykładowego wpisu oraz poprawność wyświetlanych kwot.
4. Sprawdź ruch, efekty kursora, wyłączenie animacji i pełne tło przy ograniczeniu przezroczystości.
5. Testy i build muszą przejść. Potwierdź wdrożenie i jego działanie pod dotychczasowym adresem. Nie wykonuj migracji ani zmian rzeczywistych danych.
