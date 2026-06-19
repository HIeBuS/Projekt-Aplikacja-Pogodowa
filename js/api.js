//WYPELNIANIE GLOWNEGO PANELU

async function pobierzPelneDane(lat, lon, nazwaMiasta) {
    // API pogoda (WARSZAWA)
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,visibility&daily=weather_code,temperature_2m_max,uv_index_max&timezone=auto`;
    
    // API do jakosci powietrza
    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi&timezone=auto`;

    try {
        const [weatherResponse, aqiResponse] = await Promise.all([
            fetch(weatherUrl),
            fetch(aqiUrl)
        ]);

        const dane = await weatherResponse.json();
        const daneAqi = await aqiResponse.json();

        const wszystkiePrzyciskiJednostek = document.querySelectorAll('.unit-btn');
        
        wszystkiePrzyciskiJednostek.forEach(przycisk => {
            if (przycisk.textContent.includes('C')) {
                przycisk.classList.add('is-active');
                przycisk.setAttribute('aria-pressed', 'true');
            } else {
                przycisk.classList.remove('is-active');
                przycisk.setAttribute('aria-pressed', 'false');
            }
        });

        // -main
        document.querySelector('.location').textContent = nazwaMiasta;
        document.querySelector('.temperature').textContent = Math.round(dane.current.temperature_2m) + "°";
        document.querySelector('.condition').textContent = interpretujKodPogody(dane.current.weather_code);

        const kodDlaTla = dane.current.weather_code;
        const nazwaPlikuTla = pobierzTloPogody(kodDlaTla);
        document.body.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.25)), url('img/${nazwaPlikuTla}')`;
        //gradient aby zrobic troche kontrastu tekstu i jasnych zdjec
        
        const głównyKodPogody = dane.current.weather_code;
        const głównaIkonaKlasa = pobierzIkonePogody(głównyKodPogody);
        const mainIcon = document.querySelector('.current-weather .weather-icon');
        if (mainIcon) {
            // zachowujemy klase weather-icon podmieniamy tylko ikone fa-*
            mainIcon.className = `fa-solid ${głównaIkonaKlasa} weather-icon`;
        }
        // details
        document.getElementById('uv-val').textContent = dane.daily.uv_index_max[0];
        document.getElementById('humidity-val').textContent = dane.current.relative_humidity_2m + "%";
        document.getElementById('wind-val').textContent = dane.current.wind_speed_10m + " km/h";
        
        const widocznoscKm = (dane.current.visibility / 1000).toFixed(1);
        document.getElementById('visibility-val').textContent = widocznoscKm + " km";

        const aqiValue = daneAqi.current.european_aqi;
        const pasekAQI = document.querySelector('.progress-fill');
        if (pasekAQI) {
            const percentage = Math.min(aqiValue, 100);
            pasekAQI.style.width = percentage + "%";
        }

        //GENEROWANIE PROGNOZY TYGODNIOWEJ

        const track = document.querySelector('.carousel-track');
        if (track){
            track.textContent = '';

            dane.daily.time.forEach((dataISO, i) => {
                const karta = document.createElement('div');
                karta.classList.add('day-card');

                const data = new Date(dataISO);
                const nazwaDnia = data.toLocaleDateString('en-GB', { weekday: 'short' });

                const ikonaKlasa = pobierzIkonePogody(dane.daily.weather_code[i]);

                karta.innerHTML = `
                    <span class="day-name">${nazwaDnia}</span>
                    <i class="fa-solid ${ikonaKlasa} day-icon" style="font-size: 2.2rem; margin: 10px 0;"></i>
                    <span class="day-temp">${Math.round(dane.daily.temperature_2m_max[i])}°</span>
                `;
                track.appendChild(karta);
            });
        }
        // Średnia temperatura z prognozy
        const temperatury = dane.daily.temperature_2m_max;
        const suma = temperatury.reduce((a, b) => a + b, 0);
        const srednia = Math.round(suma / temperatury.length);
        document.querySelector('.avg-temp').textContent = "Weekly Average Temp: " + srednia + "°C";

        const aktualnaTemperatura = Math.round(dane.current.temperature_2m);
        document.querySelector('.fav-list') && dodajDoUlubionych(nazwaMiasta, aktualnaTemperatura);

        applyRainFilter();

        if (rainToggle) {
            rainToggle.dispatchEvent(new Event('change'));
        }

    } catch (error) {
        console.error("Błąd:", error);
    }
}

// API na tekst
function interpretujKodPogody(kod) {
    if (kod === 0) return "Clear sky";
    if (kod < 3) return "Partly cloudy";
    if (kod < 50) return "Foggy";
    return "Opady deszczu";
}

function pobierzIkonePogody(kod) {
    if (kod === 0) return "fa-sun"; // Czyste niebo
    if (kod === 1 || kod === 2) return "fa-cloud-sun"; // Częściowe zachmurzenie
    if (kod === 3) return "fa-cloud"; // Całkowite zachmurzenie
    if (kod >= 45 && kod <= 48) return "fa-smog"; // Mgła
    if ((kod >= 51 && kod <= 67) || (kod >= 80 && kod <= 82)) return "fa-cloud-rain"; // Deszcz
    if ((kod >= 71 && kod <= 77) || kod === 85 || kod === 86) return "fa-snowflake"; // Śnieg
    if (kod >= 95 && kod <= 99) return "fa-cloud-bolt"; // Burza
    
    return "fa-cloud"; // Domyślna ikona
}

async function pobierzNazweZKoordynatow(lat, lon) {
    try {
        const geoUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();
        
        if (geoData && geoData.address) {
            return geoData.address.city || geoData.address.town || geoData.address.village || geoData.address.country || "Unknown";
        }
        return "Somewhere on the ocean";
    } catch (error) {
        console.error("Błąd pobierania nazwy:", error);
        return "Unknown location";
    }
}

function pobierzTloPogody(kod) {
    if (kod === 0 || kod === 1) return "bg-sun.jpg"; // Czyste niebo
    if (kod === 2 || kod === 3 || (kod >= 45 && kod <= 48)) return "bg-clouds.jpg"; // Zachmurzenie
    if ((kod >= 51 && kod <= 67) || (kod >= 80 && kod <= 82)) return "bg-rain.jpg"; // Deszcz
    if ((kod >= 71 && kod <= 77) || kod === 85 || kod === 86) return "bg-snow.jpg"; // Śnieg
    if (kod >= 95 && kod <= 99) return "bg-lightning.jpg"; // Burza
    
    return "bg-clouds.jpg"; // Domyślne tło
}