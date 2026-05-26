document.addEventListener('DOMContentLoaded', () => {
    let favouriteLocations = JSON.parse(localStorage.getItem('weatherFavs')) || [];
    let obecnaJednostka = 'C';
    let isRainHidden = false; 

    const track = document.querySelector('.carousel-track');
    const favList = document.querySelector('.fav-list');
    const emptyMsg = document.getElementById('fav-empty');
    const rainToggle = document.getElementById('hideRainToggle');
    const forecastEmpty = document.getElementById('forecast-empty');

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
            dodajDoUlubionych(nazwaMiasta, aktualnaTemperatura);

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
        if (kod >= 95 && kod <= 99) return "bg-thunderstorm.jpg"; // Burza
        
        return "bg-clouds.jpg"; // Domyślne tło
    }

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

    zlokalizujMnie();

    const przyciskiLokalizacji = document.querySelectorAll('.btn');

    przyciskiLokalizacji.forEach(przycisk => {
        if (przycisk.textContent.includes('My Location')) {
            przycisk.addEventListener('click', () => {
                zlokalizujMnie();
            });
        }
        else if (przycisk.textContent.includes('RANDOM')) {
            przycisk.addEventListener('click', () => {
                losowaLokalizacja();
            });
        }
    });

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
    
    const polaWyszukiwania = document.querySelectorAll('.search-bar input');

    polaWyszukiwania.forEach(pole => {
        pole.addEventListener('keypress', (event) => {
            // sprawdzamy czy wcisniety klawisz to enter
            if (event.key === 'Enter') {
                const wpisaneMiasto = pole.value.trim();
                
                if (wpisaneMiasto !== "") {
                    wyszukajMiasto(wpisaneMiasto);
                    pole.value = ''; // czyscimy pole wpisywania po wcisnieciu entera
                }
            }
        });
    });
    
    async function losowaLokalizacja() {
        const randomLat = (Math.random() * 180 - 90).toFixed(4);
        const randomLon = (Math.random() * 360 - 180).toFixed(4);

        document.querySelector('.location').textContent = "Losowanie świata...";

        const nazwaMiejsca = await pobierzNazweZKoordynatow(randomLat, randomLon);
        
        pobierzPelneDane(randomLat, randomLon, nazwaMiejsca);
    }
    //GENEROWANIE ULUBIONYCH LOKALIZACJI

    function renderujUlubione() {
        
        if (!favList || !emptyMsg) return;

        // czyszczenie starej listy i zachowanie komunikatu o braku miast
        favList.innerHTML = ''; 
        favList.appendChild(emptyMsg); 
        emptyMsg.classList.add('hidden'); 

        if (favouriteLocations.length === 0) {
            emptyMsg.classList.remove('hidden');
            return;
        }

        favouriteLocations.forEach((miejsce) => {
            const favItem = document.createElement('div');
            favItem.classList.add('fav-item');
            
            // dodajemy unikalny atrybut danych zeby wiedziec ktore miasto usuwamy
            favItem.dataset.city = miejsce.city;
            
            favItem.innerHTML = `
                <i class="fa-solid fa-cloud fav-icon" style="font-size: 1.5rem; margin-right: 10px;"></i>
                <span class="fav-temp">${miejsce.temp}°</span>
                <span class="fav-city">${miejsce.city}</span>
                <button class="fav-remove"><i class="fa-solid fa-xmark"></i></button>
            `;
            
            favList.appendChild(favItem); 
        });
    }

    // wywolujemy funkcje od razu na starcie aplikacji zeby pokazac zapisane miasta
    renderujUlubione();

    function dodajDoUlubionych(nazwa, temperatura) {
        // ignorujemy puste nazwy lub domyslne komunikaty systemowe
        if (nazwa === "Moja lokalizacja" || nazwa === "Losowanie świata..." || nazwa === "Szukam...") return;

        // sprawdzamy czy to miasto juz przypadkiem nie jest na liscie
        const indeks = favouriteLocations.findIndex(m => m.city.toLowerCase() === nazwa.toLowerCase());
        
        if (indeks !== -1) {
            // jesli miasto juz istnieje usuwamy je ze starej pozycji zeby wskoczylo na sama gore
            favouriteLocations.splice(indeks, 1);
        }

        // sodajemy nowe wyszukanie na sam poczatek tablicy
        favouriteLocations.unshift({ city: nazwa, temp: temperatura });

        // ograniczamy liste do 5 ostatnich pozycji
        if (favouriteLocations.length > 5) {
            favouriteLocations.pop();
        }

        // glowny zapis do bazy danych przegladarki
        localStorage.setItem('weatherFavs', JSON.stringify(favouriteLocations));

        // odswiezamy dane ulubionch
        renderujUlubione();
    }

    // Current date in header
    const dateElements = document.querySelectorAll('.date, .overlay-date');
    const options = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' };
    const today = new Date().toLocaleDateString('en-GB', options).toUpperCase();
    
    dateElements.forEach(el => {
        el.textContent = today;
    });

    //Toggle units (°C / °F)

    const unitToggles = document.querySelectorAll('.unit-toggle');

    unitToggles.forEach(toggleGroup => {
        const btns = toggleGroup.querySelectorAll('.unit-btn');
        
        btns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // wyciagamy sama literke 'C' lub 'F' z kliknietego przycisku
                const wybranaJednostka = e.target.textContent.replace('°', ''); 

                // klikniecie tego samego nic nie zmienia
                if (obecnaJednostka === wybranaJednostka) return;

                const wszystkiePrzyciskiJednostek = document.querySelectorAll('.unit-btn');
                wszystkiePrzyciskiJednostek.forEach(b => {
                    if (b.textContent.includes(wybranaJednostka)) {
                        b.classList.add('is-active');
                        b.setAttribute('aria-pressed', 'true');
                    } else {
                        b.classList.remove('is-active');
                        b.setAttribute('aria-pressed', 'false');
                    }
                });

                // przeliczanie wszystkich temperatur na stronie
                przeliczWszystkieTemperatury(wybranaJednostka);

                obecnaJednostka = wybranaJednostka;
            });
        });
    });

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

    //Hamburger mobile menu
    const hamburgerBtn = document.querySelector('.hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const overlayLinks = document.querySelectorAll('.overlay-link');

    const toggleMobileMenu = () => {
        const isActive = mobileMenu.classList.contains('is-active');

        hamburgerBtn.classList.toggle('is-active');
        
        if (isActive) {
            mobileMenu.classList.remove('is-active');
            mobileMenu.setAttribute('aria-hidden', 'true');
            hamburgerBtn.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        } else {
            mobileMenu.classList.add('is-active');
            mobileMenu.setAttribute('aria-hidden', 'false');
            hamburgerBtn.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
        }
    };

    if (hamburgerBtn && mobileMenu) {
        hamburgerBtn.addEventListener('click', toggleMobileMenu);
    }

    overlayLinks.forEach(link => {
        link.addEventListener('click', toggleMobileMenu);
    });

    // Usuwanie lokalizacji (Event Delegation)
    if (favList) {
        favList.addEventListener('click', (e) => {
            const removeBtn = e.target.closest('.fav-remove');
            
            if (removeBtn) {
                const favItem = removeBtn.closest('.fav-item');
                const miastoDoUsuniecia = favItem.dataset.city;
                
                favItem.style.opacity = '0';
                favItem.style.transform = 'translateX(20px)';
                
                setTimeout(() => {
                    const index = favouriteLocations.findIndex(m => m.city === miastoDoUsuniecia);
                    
                    // Jeśli miasto znajduje się w tablicy, wycinamy je za pomocą splice
                    if (index !== -1) {
                        favouriteLocations.splice(index, 1);
                    }
                    
                    // Zapisujemy zaktualizowaną tablicę do pamięci przeglądarki
                    localStorage.setItem('weatherFavs', JSON.stringify(favouriteLocations));
                    
                    // Przerysowujemy listę na ekranie od nowa
                    renderujUlubione();
                }, 200); 
            }
        });
    }


    //Showing details (mobile)
    const detailsToggle = document.querySelector('.details-toggle');
    const detailsGrid = document.querySelector('.details-grid');

    if (detailsToggle && detailsGrid) {
        if (window.innerWidth < 1024) {
            detailsGrid.classList.add('details-hidden');
        }

        detailsToggle.addEventListener('click', () => {
            const isHidden = detailsGrid.classList.contains('details-hidden');
            
            if (isHidden) {
                detailsGrid.classList.remove('details-hidden');
                detailsToggle.setAttribute('aria-expanded', 'true');
                detailsToggle.innerHTML = 'Hide details... <i class="fa-solid fa-chevron-up" aria-hidden="true"></i>';
            } else {
                detailsGrid.classList.add('details-hidden');
                detailsToggle.setAttribute('aria-expanded', 'false');
                detailsToggle.innerHTML = 'Show details... <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>';
            }
        });
    }


    // Weather carousel (scrolling with arrows)
    const prevBtn = document.querySelector('.carousel-nav.prev');
    const nextBtn = document.querySelector('.carousel-nav.next');

    if (track && prevBtn && nextBtn) {
        const scrollAmount = 200;

        prevBtn.addEventListener('click', () => {
            track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });

        nextBtn.addEventListener('click', () => {
            track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
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

    // listener checkboxa teraz tylko wywoluje funkcje
    rainToggle?.addEventListener('change', () => {
        isRainHidden = rainToggle.checked;
        applyRainFilter();
    });
});