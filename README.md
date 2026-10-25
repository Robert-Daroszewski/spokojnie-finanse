# Spokojnie — osobista przestrzeń finansów

Prywatny organizer wydatków, budżetu, oszczędności i portfela XTB z automatyczną wyceną akcji i ETF-ów. Wersja dla telefonu i komputera, z kategoriami produktów, paragonami, stałymi płatnościami, subtelnymi animacjami i wyciszanymi dźwiękami.

Adres wdrożenia: [spokojnie-finanse.vercel.app](https://spokojnie-finanse.vercel.app). Dane wymagają zalogowania skonfigurowanego właściciela.

## Architektura

- **GitHub** — źródła i automatyczne sprawdzenia.
- **Vercel / Next.js** — aplikacja pod stałym adresem HTTPS.
- **Supabase Auth** — logowanie e-mailem i hasłem, dostęp ograniczony do skonfigurowanego właściciela. Jednorazowy link służy do ustawienia lub odzyskania hasła.
- **Supabase PostgreSQL** — stan finansów, kontrola wersji i RLS.
- **Supabase Storage** — prywatne załączniki paragonów, oddzielone od bazy.

Repozytorium zawiera neutralne ustawienia startowe. Kwoty użytkownika, jego historia, załączniki i sekrety nie są częścią kodu. Wdrożenie wymaga konfiguracji kont opisanej w [DEPLOYMENT.md](DEPLOYMENT.md).

## Funkcje

- Kategorie z drugim poziomem wyboru. Jedzenie: zakupy spożywcze do domu, gotowe posiłki ze sklepu, energetyki, przekąski i słodycze oraz jedzenie na mieście / na wynos. Transport: kolej międzymiastowa, SKM/PKM, tramwaje i autobusy, przejazdy mieszane, taxi i samochód. Pozostałe kategorie mają podziały m.in. na elektronikę, prezenty, dom, suplementy i subskrypcje.
- Pole „Związane z Pati” przy wydatkach i zwrotach, niezależne od kategorii. Obejmuje całą kwotę wpisu, nie oznacza podziału rachunku ani rozliczenia długu. W historii dostępne są filtry podkategorii i oznaczenia, a w raporcie miesięcznym ich podsumowania po zwrotach.
- Podkategorie działają też na pozycjach zakupów; rozpisany wydatek jest liczony z pozycji, bez doliczania kwoty całej transakcji drugi raz. Szablony, szkice, płatności cykliczne i kopie JSON zachowują nowe pola; eksport CSV zawiera także klasyfikację pozycji. Limity budżetu nadal dotyczą głównych kategorii.
- Stare wpisy zachowują dotychczasowe kategorie, kwoty i daty; „Bez podkategorii” oraz „Bez oznaczenia Pati” nie stanowią automatycznej oceny ich treści. Klasyfikację można uzupełnić w edycji transakcji. Aktualizacja nie wykonuje migracji ani masowych zmian istniejących danych.

- Wydatki, wpływy, zwroty i przelewy własne; przelew nie jest nowym dochodem ani kosztem.
- Kategorie i miesięczne limity. Zakup można rozbić na produkty z ilością, jednostką, końcową kwotą po rabacie i kategorią każdej pozycji. Suma musi zgadzać się z zakupem.
- Zapamiętywane produkty i usługi ze stałym identyfikatorem, wybór poprzednio kupionej pozycji w wydatku, ponowny zakup z katalogu. Podsumowania miesięczne i całej historii: zakupy, zwroty, koszt netto, ilość, cena średnia i historia każdej pozycji. Katalog jest częścią synchronizowanego snapshotu i kopii JSON.
- Raport miesiąca: wpływy, wydatki i zwroty, bilans, porównanie równych okresów, trend sześciu miesięcy, kategorie i kalendarz z przejściem do transakcji.
- Szablony wcześniejszych wydatków z kontem, kategorią i produktami, z datą ustawianą na dziś. Użycie otwiera formularz, bez automatycznego księgowania.
- Porównywanie salda z bankiem lub wolną gotówką XTB na wybrany dzień, z zachowaniem wyniku. Nie tworzy korekt budżetu i nie zmienia sald.
- Szkic formularza transakcji na urządzeniu do 7 dni, odzyskiwany po zamknięciu i odświeżeniu, osobno dla przykładu. Cofnięcie ostatniego usunięcia transakcji, celu lub pozycji przez 60 sekund bez zastępowania całego snapshotu.
- Nawigacja wszystkich sekcji na telefonie, adres sekcji i historia Wstecz; mobilne karty transakcji, wyszukiwanie po produktach, kategoriach, dniu i całej historii, podsumowanie filtrów oraz porcjowanie po 50 wpisów.
- Paragony JPEG/PNG/WebP, PDF i JSON do 3 MB. JSON ma mapowanie pól i podgląd produktów. PDF i zdjęcia są załącznikami, bez automatycznego OCR. Można powiązać paragon z istniejącym wydatkiem bez ponownego księgowania.
- Płatności miesięczne, tygodniowe i roczne. Plan chroni środki na nieopłacone rachunki; zapis faktycznego wydatku wymaga oznaczenia płatności jako opłaconej. Można wskazać istniejący wydatek.
- Cele i poduszka bez podwójnego liczenia majątku. Nadwyżka na inwestowanie jest orientacyjną wartością po zabezpieczeniu budżetu, rachunków, celów i poduszki.
- Wyszukiwanie akcji i ETF-ów po nazwie lub symbolu, jednostki ułamkowe i partie zakupów. Ceny Yahoo Finance oraz przeliczenia NBP, wykres każdej pozycji od zakupu i wspólny wykres z linią kosztów. Łączny procent wyniku liczony względem całego kosztu. Ręczne migawki pozostają obsługiwane. Szczegóły: [MARKET_DATA.md](MARKET_DATA.md).
- Import CSV, pełna kopia JSON, synchronizacja i ochrona przed konfliktem zapisów na dwóch urządzeniach. Tryb przykładowy jest oddzielny od właściwych danych.
- Manifest aplikacji na telefon, układ mobilny, obsługa ograniczenia animacji i przełącznik dźwięków. Nie ma pełnego trybu pracy offline — lokalne oczekujące zapisy nie zastępują kopii.

## Banki i sklepy

Nie ma aktywnych konektorów bankowych ani sklepowych. Sprawdzona ścieżka BNP Paribas Polska i Millennium to AIS przez Enable Banking, po osobnej aktywacji właściciela. Zakupy i liczby jednostek XTB wprowadza się ręcznie; ceny wybranych akcji i ETF-ów mogą aktualizować się automatycznie z zewnętrznego źródła.

Biedronka oficjalnie udostępnia e-paragony jako PDF i JSON, ale nie publikuje w regulaminie schematu JSON. Dlatego importer pozwala wybrać właściwe pola i wymaga sprawdzenia sum. Lidl opisuje pobieranie e-paragonów. Nie znaleziono publicznie udokumentowanych oficjalnych API konsumenckich obu sieci.

Źródła: [Biedronka — regulamin](https://cdn.biedronka.pl/policies/Regulamin-Moja-Biedronka-od-21.08.2025.pdf), [Lidl — instrukcja pobierania](https://www.lidl.pl/static/assets/Regulamin-2192145.pdf), [Enable Banking — banki](https://enablebanking.com/open-banking-apis?country=PL).

## Rozwój

Node.js >=22.13. `npm ci`, następnie `npm run dev`.

- `npm test` — obliczenia, produkty, pliki i terminy płatności.
- `npm run typecheck` — sprawdzenie TypeScript.
- `npm run build` — produkcyjne wydanie Next.js.

Bez kluczy Supabase aplikacja pokazuje ekran oczekujący na konfigurację. Nie korzysta wtedy z zastępczych danych w chmurze ani otwartych zapisów.

## Kopie i ograniczenia

Kopia JSON zawiera stan budżetu i metadane paragonów, **nie same pliki**. Ważne załączniki należy pobierać osobno. Synchronizacja nie zastępuje historycznych kopii zapasowych.

Plan Supabase Free może wstrzymać mało aktywny projekt po siedmiu dniach i nie zapewnia SLA ani automatycznych kopii. Vercel Hobby jest przeznaczony do zastosowań osobistych i niekomercyjnych. Aktualne warunki: [Supabase](https://supabase.com/pricing), [wstrzymywanie projektu](https://supabase.com/docs/guides/platform/free-project-pausing), [Vercel Hobby](https://vercel.com/docs/plans/hobby).
