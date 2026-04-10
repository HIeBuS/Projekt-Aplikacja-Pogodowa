Wybrany obszar tematyczny aplikacji:
Pogoda (minimalistyczna aplikacja webowa oparta na HTML, CSS i JavaScript)

Skład zespołu:
Dawid Aleksiejuk, Jakub Hlebowicz

Koncepcja projektu:

1. Jakie dane będzie wykorzystywać aplikacja?
Darmowe, niewymagające klucza API (Open-Meteo API zintegrowane z Geocoding API), dane pobierane w formacie JSON.
Pobierane parametry: Aktualna temperatura, kody pogodowe (do dynamicznej podmiany ikon SVG), prędkość wiatru, wilgotność, jakość powietrza (AQI), indeks UV, widoczność, prognoza na kolejne 7 dni.

2. Jakie będą jej podstawowe funkcje?

Asynchroniczne pobieranie danych: Użycie metody fetch na podstawie nazwy miasta wpisanej przez użytkownika.

Dynamiczne renderowanie: Wstrzykiwanie pobranych informacji do DOM bez przeładowywania strony.

Obsługa formularza i błędów: Zabezpieczenie wyszukiwarki przed pustymi zapytaniami oraz wyświetlanie przyjaznych komunikatów (np. w przypadku literówki w nazwie miasta lub braku Internetu).

Zarządzanie pamięcią (localStorage) i edycja danych: Zapamiętywanie ostatnio wyszukiwanego miasta jako domyślnego oraz tworzenie listy Ulubionych, którą można edytować (usuwać zapisane miasta).

Przetwarzanie (agregacja) i filtrowanie: Wyliczanie średniej temperatury z całego tygodnia (statystyki) oraz interaktywny przełącznik ukrywający deszczowe dni w sekcji prognozy (filtrowanie).

3. Jakie planowane są główne widoki?
Aplikacja została zaprojektowana w nowoczesnym stylu Glassmorphism (półprzezroczyste, rozmyte panele). Na urządzeniach desktopowych aplikacja funkcjonuje jako idealnie dopasowany One-Page (bez globalnego paska przewijania).

Nawigacja (Header): Stały, minimalistyczny pasek na górze ekranu (Navbar) zawierający logo, pole wyszukiwania miasta wraz z przyciskami powrotu do domyślnej lokalizacji oraz wyboru losowego miejsca. Posiada również bieżącą datę i przełącznik jednostek (°C i °F). Na urządzeniach mobilnych nawigacja obsługiwana jest przez pełnoekranowe, animowane menu (Overlay).

Dashboard Pogodowy (Główny panel): Lewa część układu. Na górze wyświetla bieżącą pogodę (duża typografia, ikona pogodowa, miejscowość). W wersji mobilnej sekcja szczegółów (UV, wiatr, widoczność, pasek postępu AQI) jest rozwijana za pomocą mechanizmu typu akordeon ("Show details..."). Na dużych ekranach dodatkowe pola wkomponowane są na stałe w układ dwukolumnowy.

Prognoza Tygodniowa: Oddzielna sekcja pod głównym dashboardem z dynamicznie generowanymi kafelkami w formie horyzontalnej karuzeli, prezentującymi pogodę na kolejne dni. W nagłówku tej sekcji znajdują się funkcje przetwarzania i filtrowania: informacja o wyliczonej średniej temperaturze tygodniowej oraz przełącznik (toggle) ukrywający w karuzeli dni opadowe.

Ulubione Miasta (Boczny panel): Prawa strona ekranu, zawierająca przejrzystą listę zapisanych w pamięci przeglądarki lokalizacji, pozwalającą na szybkie przełączanie. Elementy listy responsywnie dopasowują swój rozmiar do dostępnej przestrzeni, generując wewnętrzny pasek przewijania dopiero przy przepełnieniu kontenera.

4. Zgodność z dostępnością (ARIA) i UX:
Aplikacja wykorzystuje estetyczne, płynne przejścia CSS dla interakcji z użytkownikiem, odpowiednie kontrasty barw, atrybuty aria-label dla przycisków, czytelne stany :hover / :focus dla interaktywnych elementów (w tym customowych pasków przewijania) oraz wizualną informację o ładowaniu danych.

Link do repozytorium GitHub:
https://github.com/HIeBuS/Projekt-Aplikacja-Pogodowa