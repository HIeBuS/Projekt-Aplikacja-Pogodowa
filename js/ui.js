function zlokalizujMnie() { 
    // pokazujemy ze sie laduje
    document.querySelector('.location').textContent = "Lokalizowanie...";

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (pozycja) => {
                const lat = pozycja.coords.latitude;
                const lon = pozycja.coords.longitude;
                const nazwaMiasta = await pobierzNazweZKoordynatow(lat, lon);

                pobierzPelneDane(lat, lon, nazwaMiasta);
            },
            (error) => {
                console.error("Błąd geolokalizacji:", error);
                alert("Nie udało się pobrać Twojej lokalizacji. Wyświetlam domyślną (Warszawa).");
                pobierzPelneDane(52.2297, 21.0122, "Warszawa, Polska");
            }
        );
    } else {
        alert("Twoja przeglądarka nie wspiera geolokalizacji.");
        pobierzPelneDane(52.2297, 21.0122, "Warszawa, Polska");
    }
}

async function wyszukajMiasto(nazwaMiasta) {
    try {
        // pokazywanie ze szuka
        document.querySelector('.location').textContent = "Szukam...";
        // api do zamiany na kordy
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${nazwaMiasta}&count=1&language=pl&format=json`;
        const geoOdpowiedz = await fetch(geoUrl);
        const geoDane = await geoOdpowiedz.json();

        // sprawdzamy czy cokolwiek zostalo znalezione
        if (geoDane.results && geoDane.results.length > 0) {
            const znalezioneMiasto = geoDane.results[0];
            const lat = znalezioneMiasto.latitude;
            const lon = znalezioneMiasto.longitude;
            // pobieramy pelna nazwe
            const pelnaNazwa = znalezioneMiasto.name; 

            pobierzPelneDane(lat, lon, pelnaNazwa);
        } else {
            alert("Nie znaleziono takiego miasta!");
            document.querySelector('.location').textContent = "Nie znaleziono";
        }
    } catch (error) {
        console.error("Błąd wyszukiwania:", error);
        alert("Wystąpił błąd serwera podczas wyszukiwania.");
        document.querySelector('.location').textContent = "Błąd";
    }
}

async function losowaLokalizacja() {
    const randomLat = (Math.random() * 180 - 90).toFixed(4);
    const randomLon = (Math.random() * 360 - 180).toFixed(4);

    document.querySelector('.location').textContent = "Losowanie świata...";

    const nazwaMiejsca = await pobierzNazweZKoordynatow(randomLat, randomLon);
    
    pobierzPelneDane(randomLat, randomLon, nazwaMiejsca);
}

function przeliczWszystkieTemperatury(nowaJednostka) {
    // glowna temperatura
    const tempMain = document.querySelector('.temperature');
    if (tempMain && tempMain.textContent) {
        tempMain.textContent = konwertujZnak(tempMain.textContent, nowaJednostka) + "°";
    }

    // temperatury dni w prognozie
    const tempDni = document.querySelectorAll('.day-temp');
    tempDni.forEach(el => {
        el.textContent = konwertujZnak(el.textContent, nowaJednostka) + "°";
    });

    // temperatury w ulubionych
    const tempUlubione = document.querySelectorAll('.fav-temp');
    tempUlubione.forEach(el => {
        el.textContent = konwertujZnak(el.textContent, nowaJednostka) + "°";
    });

    // srednia temperatura
    const avgTempEl = document.querySelector('.avg-temp');
    if (avgTempEl && avgTempEl.textContent) {
        // wyciagamy sama liczbe z tekstu
        const staraLiczba = avgTempEl.textContent.match(/-?\d+/)[0]; 
        const nowaLiczba = konwertujZnak(staraLiczba, nowaJednostka);
        avgTempEl.textContent = `Weekly Average Temp: ${nowaLiczba}°${nowaJednostka}`;
    }
}

function konwertujZnak(staraWartosc, nowaJednostka) {
    // zamieniamy tekst liczbe calkowita
    const liczba = parseInt(staraWartosc);
    
    if (nowaJednostka === 'F') {
        // Celsjusze -> Fahrenheity
        return Math.round((liczba * 1.8) + 32);
    } else {
        // Fahrenheity -> Celsjusze
        return Math.round((liczba - 32) / 1.8);
    }
}

function applyRainFilter() {
    const kafelkiDni = document.querySelectorAll('.day-card');
    let ukryteDni = 0;

    kafelkiDni.forEach(kafelek => {
        const ikona = kafelek.querySelector('i');
        if (ikona) {
            const czyDeszcz = ikona.classList.contains('fa-cloud-rain') || ikona.classList.contains('fa-cloud-bolt');
            if (czyDeszcz) kafelek.classList.toggle('hidden', isRainHidden);
        }
        if (kafelek.classList.contains('hidden')) ukryteDni++;
    });

    if (forecastEmpty) {
        forecastEmpty.classList.toggle('hidden', !(ukryteDni === kafelkiDni.length && kafelkiDni.length > 0));
    }
}