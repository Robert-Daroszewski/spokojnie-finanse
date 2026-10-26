# Ceny i historia inwestycji

Sekcja **Inwestycje → Dodaj zakup** pozwala wybrać akcję lub ETF po nazwie i symbolu. Wyszukiwarka pokazuje giełdę; po wybraniu instrumentu potwierdza także walutę i cenę. To szeroka wyszukiwarka rynkowa — dostępność i właściwą giełdę należy porównać z posiadaną pozycją XTB. Nie obsługuje wyceny CFD.

Właściciel wpisuje aktualną liczbę jednostek danej partii, datę zakupu i koszt pozostałych jednostek w PLN, wraz z opłatami. Każdy kolejny zakup to osobna partia. Kwoty i jednostki nie są odczytywane z rachunku brokera; aplikacja nie wymaga hasła ani tokenu XTB i nie wykonuje transakcji.

## Zakup a wolna gotówka

Nowa pozycja domyślnie tworzy jednocześnie zapis `buy` na wybranym koncie maklerskim. Obie zmiany trafiają do tego samego snapshotu i tego samego zapisu ze sprawdzaniem rewizji. Gotówka jest pomniejszana o koszt w PLN, a pozycja ma opcjonalne `purchaseTransactionId`. Zakup nie trafia do wydatków konsumpcyjnych.

Edycja powiązanego kosztu lub daty koryguje tę samą operację, także przy edycji od strony Transakcji. Sama wycena rynkowa nie dotyka gotówki. Usunięcie pozycji nie oznacza sprzedaży i zachowuje zapis kupna; usunięcie operacji kupna odłącza pozycję i przywraca oznaczenie rozliczenia do sprawdzenia. Cofnięcie usuwań odtwarza powiązanie, o ile nadal pasuje do aktualnych danych.

Starsze pozycje nie mają domyślnego pobrania gotówki. Przy ich edycji można dopisać brakujący zakup, powiązać nieprzypisaną operację o pasującej dacie i kwocie albo wybrać „Pozycja historyczna · gotówka już w saldzie” (`cashAlreadyIncluded=true`). Ten ostatni wybór służy tylko pozycjom już uwzględnionym w podanym saldzie. Nie należy odejmować ich kosztu ponownie. Brak wyboru pozostawia widoczne oznaczenie do wyjaśnienia.

Nowy zakup jest blokowany, jeśli zapisane saldo nie wystarcza. Należy uzupełnić prawdziwą wpłatę jako przelew z banku albo zweryfikować saldo początkowe. Podobna niepowiązana operacja wymaga sprawdzenia lub jawnego potwierdzenia osobnego zakupu. Częściowa sprzedaż i pełna historia transakcyjna pozycji pozostają do dalszego rozwoju; edycja jednostek nie zapisuje wpływu ze sprzedaży.

## Źródła

- Wyszukiwanie, ceny i dzienne szeregi: publiczne interfejsy Yahoo Finance (`query1.finance.yahoo.com/v1/finance/search` i `/v8/finance/chart`). To nieoficjalna integracja bez SLA; interfejs może się zmienić lub ograniczać dostęp. Cena ma rzeczywisty czas notowania. Opóźnienia zależą od giełdy: [informacje Yahoo](https://help.yahoo.com/kb/SLN2310.html).
- Przeliczenia PLN: tabela A średnich kursów [NBP Web API](https://api.nbp.pl/). Bieżąca wycena używa ostatniej dostępnej publikacji, a historia kursu z danego dnia lub wcześniejszego dnia publikacji. Historia NBP jest dostępna od 2002-01-02. Zapytania są dzielone na kwartały, krótsze niż limit 93 dni. Notowania w pensach brytyjskich są przeliczane na GBP z mnożnikiem 0,01.
- Dotychczasowe xAPI XTB zostało wyłączone w 2025 roku: [komunikat XTB](https://www.xtb.com/de/Trading-News?page=74).

Nie potrzeba dodatkowego klucza, abonamentu ani nowej zmiennej środowiskowej. Nie są uruchamiane płatne usługi. Dostawcy otrzymują symbol i zakres dat, bez ilości, kosztów czy danych konta.

## Aktualizacja i błędy

Wycenę pobieramy przy wejściu do sekcji inwestycji oraz co 15 minut, gdy jest ona widoczna. Jest też przycisk odświeżenia. Publiczne dane źródłowe są buforowane po stronie serwera; odpowiedź API właściciela ma `private, no-store`. Ostatnia wycena i jej znaczniki czasu zapisują się w dotychczasowym prywatnym stanie finansów. Pełne szeregi historyczne nie powiększają kopii użytkownika i są pobierane do wykresów.

Awaria lub ograniczenie źródła nie zeruje wartości. Zachowujemy ostatnią wycenę i pokazujemy komunikat. Notowanie starsze niż 5 dni ma ostrzeżenie. Braki historyczne dają luki, a nie fikcyjną cenę zakupu; kurs lub cena starsze niż 14 dni nie są ciągnięte przez brakujące okresy na wykresie. Zdarzenie splitu po ostatnim potwierdzeniu liczby jednostek wstrzymuje przeliczanie danej partii do czasu sprawdzenia ilości w XTB.

## Wynik i wykresy

Wartość partii = jednostki × cena instrumentu × mnożnik jednostki waluty × kurs PLN. Zaokrąglamy końcową wartość partii do groszy.

Łączny zysk = suma wartości otwartych pozycji − suma kosztów tych pozycji. Łączny procent = 100 × łączny zysk / suma kosztów. Przy zerowym koszcie pokazujemy „—”. To wynik niezrealizowany, bez dywidend, podatku i sprzedanych pozycji. Nie jest średnią procentów poszczególnych pozycji ani stopą TWR/XIRR.

Wspólny wykres odtwarza **obecne partie zakupów**, włączając każdą od jej daty zakupu, i pokazuje linię sumy kosztów. Nowe wpłaty/zakupy mogą podnieść wartość portfela bez zysku; linia kosztu pomaga je odróżnić. Historia używa dziennych cen korygowanych o splity przez źródło i aktualnej liczby jednostek partii. Nie jest pełną historią rachunku po sprzedażach. Cena instrumentu i wartość portfela mają osobne jednostki; dla pierwszego wykresu walutą może być np. EUR lub GBp, dla sumy zawsze PLN.

Ręczne migawki pozostają w sumach. Nie przypisujemy im domniemanej daty zakupu ani liczby jednostek. Wspólny wykres jasno podaje, ile partii obejmuje. Opcja **Włącz automatyczne ceny** pozwala uzupełnić brakujące dane bez usuwania kosztów lub zapisów gotówki.

## Zaplecze i bezpieczeństwo

`/api/market` sprawdza istniejącego właściciela poprzez Supabase Auth. Wyszukiwanie jest ograniczone do akcji i ETF-ów; notowania przyjmują najwyżej 5 symboli na żądanie oraz poprawne daty. Adresy dostawców są stałe — użytkownik nie może podać dowolnego URL. Zapis portfela nadal korzysta z walidacji i sprawdzania rewizji prywatnego snapshotu. Nie wymaga migracji bazy, zmian RLS ani dostępu do brokera.

## Szczegółowe wykresy

Osie mają adaptacyjną precyzję i równe, czytelne odstępy. Daty sesji są wyznaczane w strefie giełdy; bieżący punkt jest oznaczony jako notowanie, a nie zamknięcie. Pełne dane dzienne służą do wskazywania dnia i eksportu, nawet gdy rysunek jest uproszczony z zachowaniem ekstremów i luk. Dostępne OHLC i wolumen pokazujemy po wybraniu punktu historycznego; brakujących pól nie tworzymy. CSV zachowuje ceny źródłowe, wartości/koszty PLN w groszach i rodzaj punktu.

Minimum, maksimum i zmiana dotyczą wybranego zakresu. Dla portfela pokazujemy zmianę bezwzględnego wyniku (wartość − koszt), a nie procent wzrostu wartości, który myliłby dopłaty z zyskiem. Nie jest to TWR ani XIRR. Luki mają przerwaną linię i licznik danych.
