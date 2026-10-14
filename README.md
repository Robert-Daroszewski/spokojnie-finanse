# Spokojnie — osobista przestrzeń finansów

Prywatny organizer wydatków, budżetu, oszczędności i ręcznego portfela XTB. Wersja dla telefonu i komputera, z kategoriami produktów, paragonami, stałymi płatnościami, subtelnymi animacjami i wyciszanymi dźwiękami.

## Architektura

- **GitHub** — źródła i automatyczne sprawdzenia.
- **Vercel / Next.js** — aplikacja pod stałym adresem HTTPS.
- **Supabase Auth** — logowanie linkiem e-mail, dostęp ograniczony do skonfigurowanego właściciela.
- **Supabase PostgreSQL** — stan finansów, kontrola wersji i RLS.
- **Supabase Storage** — prywatne załączniki paragonów, oddzielone od bazy.

Repozytorium zawiera neutralne ustawienia startowe. Kwoty użytkownika, jego historia, załączniki i sekrety nie są częścią kodu. Wdrożenie wymaga konfiguracji kont opisanej w [DEPLOYMENT.md](DEPLOYMENT.md).

## Funkcje

- Wydatki, wpływy, zwroty i przelewy własne; przelew nie jest nowym dochodem ani kosztem.
- Kategorie i miesięczne limity. Zakup można rozbić na produkty z ilością, jednostką, końcową kwotą po rabacie i kategorią każdej pozycji. Suma musi zgadzać się z zakupem.
- Paragony JPEG/PNG/WebP, PDF i JSON do 3 MB. JSON ma mapowanie pól i podgląd produktów. PDF i zdjęcia są załącznikami, bez automatycznego OCR. Można powiązać paragon z istniejącym wydatkiem bez ponownego księgowania.
- Płatności miesięczne, tygodniowe i roczne. Plan chroni środki na nieopłacone rachunki; zapis faktycznego wydatku wymaga oznaczenia płatności jako opłaconej. Można wskazać istniejący wydatek.
- Cele i poduszka bez podwójnego liczenia majątku. Nadwyżka na inwestowanie jest orientacyjną wartością po zabezpieczeniu budżetu, rachunków, celów i poduszki.
- Import CSV, pełna kopia JSON, synchronizacja i ochrona przed konfliktem zapisów na dwóch urządzeniach. Tryb przykładowy jest oddzielny od właściwych danych.
- Manifest aplikacji na telefon, układ mobilny, obsługa ograniczenia animacji i przełącznik dźwięków. Nie ma pełnego trybu pracy offline — lokalne oczekujące zapisy nie zastępują kopii.

## Banki i sklepy

Nie ma aktywnych konektorów bankowych ani sklepowych. Sprawdzona ścieżka BNP Paribas Polska i Millennium to AIS przez Enable Banking, po osobnej aktywacji właściciela. XTB pozostaje aktualizowane ręcznie.

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
