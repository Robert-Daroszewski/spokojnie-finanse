# Wdrożenie GitHub → Vercel → Supabase

## 1. Supabase

Utwórz projekt Free w regionie europejskim. W edytorze SQL zastosuj dokładnie migrację `supabase/migrations/20261014210101_finance_initial.sql`. Nie uruchamiaj jej drugi raz na już skonfigurowanej bazie.

Migracja tworzy tabelę finansów z RLS, atomową funkcję zapisu sprawdzającą wersję oraz prywatny bucket `receipts` z regułami dostępu do plików własnego użytkownika. Nie wyłączaj RLS i nie zmieniaj bucketu na publiczny. Aplikacja nie potrzebuje klucza service role.

W **Authentication → Users** dodaj lub zaproś własny adres e-mail. Logowanie nie tworzy nowych użytkowników automatycznie. Publiczne rejestracje można wyłączyć w ustawieniach Auth. W ustawieniach URL dodaj finalny adres strony jako Site URL oraz `https://TWÓJ-ADRES/auth/callback` jako dozwolone przekierowanie. Dla lokalnego testu dodaj `http://localhost:3000/auth/callback`.

Codzienne logowanie korzysta z e-maila i hasła. Właściciel z aktywną sesją ustawia hasło w **Ustawienia → Ustaw lub zmień hasło** (`/account/password`). Bez sesji używa **Ustaw lub odzyskaj hasło** na ekranie logowania; jednorazowy link otwarty w tej samej przeglądarce prowadzi przez istniejący callback do chronionego formularza hasła. Nie wymaga nowego adresu przekierowania ani zmian w bazie.

Przy tworzeniu lub edycji płatności cyklicznej opcja **Już opłacone w tym miesiącu** zapisuje rozliczone terminy w planie. Nie tworzy transakcji, nie zmienia sald ani istniejących wydatków. Następne miesiące są planowane normalnie.

Sprawdź dostarczanie poczty w swoim projekcie. Domyślna usługa pocztowa Supabase ma ograniczenia; przy potrzebie regularnego użycia skonfiguruj własny SMTP zgodnie z dokumentacją. Link należy otwierać w tej samej przeglądarce, w której rozpoczęto logowanie.

## 2. Vercel

Zaimportuj to repozytorium. Framework: **Next.js**, główny katalog repozytorium, Node.js 22 lub nowszy. `vercel.json` zawiera budowę, instalację i region funkcji.

Ustaw zmienne środowiskowe:

| Nazwa | Wartość |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL projektu Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | publiczny publishable key projektu |
| `OWNER_EMAIL` | Twój adres zgodny z kontem Supabase Auth |

Publishable key jest przeznaczony do klienta i nie zastępuje RLS. Nie wstawiaj klucza secret/service role jako zmiennej `NEXT_PUBLIC_*`. Nie zapisuj żadnych rzeczywistych sekretów w GitHub.

Po ustawieniu zmiennych wykonaj wdrożenie. Dopisz finalny URL w Supabase Auth. Utrzymuj osobną bazę i właściciela dla testów, jeśli udostępniasz podglądy osobom trzecim.

## 3. Sprawdzenie po publikacji

1. Bez logowania widoczny jest tylko ekran logowania; `/api/state` nie zwraca finansów.
2. Zaloguj się adresem właściciela. Dodaj niewielki testowy wydatek, odśwież stronę, a następnie sprawdź go na telefonie.
3. Dodaj testowy paragon i potwierdź, że plik wymaga zalogowania. Usuń testowy załącznik; wydatek i produkty mają pozostać.
4. Sprawdź stałą płatność: nieopłacona chroni środki w planie, a „opłacona” tworzy wydatek raz.
5. Pobierz JSON. Dodatkowo pobierz istotne załączniki.

## Przeniesienie z wcześniejszej witryny

W starej aplikacji pobierz pełną kopię JSON. W nowej witrynie zaloguj się, otwórz Ustawienia i odtwórz tę kopię. Zweryfikuj salda i status zapisu w chmurze. Starego adresu nie wyłączaj przed sprawdzeniem nowego.

Załączniki z innego hostingu nie przenoszą się automatycznie wraz z metadanymi JSON. Zachowaj je oddzielnie; migrację plików wykonaj przed wyłączeniem starego magazynu. Wersja bez zapisanych wcześniej paragonów wymaga jedynie przeniesienia JSON.

## Dostępność i koszty

Na początek osobisty Vercel Hobby i Supabase Free są rozsądnym wyborem. Free może zostać wstrzymany przy małej aktywności przez siedem dni; wznowienie odbywa się w panelu. Nie obchodź tego sztucznym ruchem. Jeśli potrzebujesz dostępności gwarantowanej, rozważ płatny plan po sprawdzeniu aktualnych kosztów.

Podstawowe dokumentacje: [Vercel + Next.js](https://vercel.com/docs/frameworks/full-stack/nextjs), [Supabase SSR](https://supabase.com/docs/guides/auth/server-side), [Storage i RLS](https://supabase.com/docs/guides/storage/security/access-control).
