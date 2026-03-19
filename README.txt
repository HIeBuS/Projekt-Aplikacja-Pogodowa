Wybrany obszar tematyczny aplikacji:
Pogoda (minimalistyczna aplikacja webowa oparta na HTML, CSS i JavaScript)

Skład zespołu:
Dawid Aleksiejuk, Jakub Hlebowicz

Koncepcja projektu:

1. Jakie dane będzie wykorzystywać aplikacja?

Darmowe API (wttr.in), dane w formacie JSON.
Pobierane parametry: Aktualna temperatura, kody pogodowe do ikony SVG, prędkość wiatru, wilgotność, jakość powietrza (AQI), indeks UV, widoczność, prognoza na kolejne dni.

2. Jakie będą jej podstawowe funkcje?

Asynchroniczne pobieranie danych: Użycie metody fetch na podstawie nazwy miasta wpisanej przez użytkownika.

Dynamiczne renderowanie: Wstrzykiwanie pobranych informacji do DOM bez przeładowywania strony.

Obsługa formularza i błędów: Zabezpieczenie wyszukiwarki przed pustymi zapytaniami oraz wyświetlanie przyjaznych komunikatów (np. w przypadku literówki w nazwie miasta lub braku Internetu).

Zarządzanie pamięcią (localStorage) i edycja danych: Zapamiętywanie ostatnio wyszukiwanego miasta jako domyślnego oraz tworzenie listy Ulubionych, którą można edytować (usuwać miasta).

Przetwarzanie (agregacja) i filtrowanie: Wyliczanie średniej temperatury z całego tygodnia (statystyki) oraz przełącznik ukrywający deszczowe dni w prognozie (filtrowanie).

3. Jakie planowane są główne widoki?

Nawigacja (Widok formularza): Stały, minimalistyczny pasek na górze ekranu (Navbar) zawierający logo, pole wyszukiwania miasta wraz z możliwością szukania po lokalizacji lub wybraniu losowego miejsca, a także datą i przełącznikiem °C i °F.

Dashboard Pogodowy (Widok szczegółów): Główna (lewa) część ekranu. Na górze wyświetla bieżącą pogodę (duża typografia, ikona pogodowa, miejscowość). W wersji mobilnej pod spodem znajduje się sekcja szczegółów (UV, wiatr, widoczność, pasek AQI) rozwijana za pomocą mechanizmu typu akordeon ("Show details..."). Na dużych ekranach te dodatkowe pola wyświetlają się zawsze.

Prognoza Tygodniowa: Oddzielna sekcja z dynamicznie generowanymi kafelkami w formie horyzontalnej karuzeli, prezentującymi pogodę na kolejne dni. W nagłówku tej sekcji zaimplementowane zostaną funkcje przetwarzania i filtrowania: subtelna informacja o wyliczonej średniej temperaturze z całego tygodnia oraz minimalistyczny przełącznik (toggle) ukrywający w karuzeli dni deszczowe.

Ulubione Miasta (Widok listy): Boczny panel (prawa strona ekranu), zawierający przejrzystą listę zapisanych w pamięci przeglądarki lokalizacji. Umożliwia szybkie przełączanie się między miastami. Elementy listy responsywnie dopasowują swój rozmiar do dostępnej przestrzeni.

4. Zgodność z dostępnością (ARIA) i UX:
Aplikacja będzie posiadać estetyczne animacje CSS, odpowiednie kontrasty barw, atrybuty aria-label dla przycisków, czytelne stany :hover / :focus dla interaktywnych elementów oraz wizualną informację o ładowaniu danych.

Link do repozytorium GitHub:
https://github.com/HIeBuS/Projekt-Aplikacja-Pogodowa