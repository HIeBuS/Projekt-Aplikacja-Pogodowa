document.addEventListener('DOMContentLoaded', () => {
    const favouriteLocations = [
        { city: "Kraków", temp: 18, icon: "img/favicon.ico" },
        { city: "Gdańsk", temp: 15, icon: "img/favicon.ico" },
        { city: "Wrocław", temp: 21, icon: "img/favicon.ico" }
    ];

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
                    let nazwaMiasta = "Moja lokalizacja";

                    try {
                        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                        const geoData = await geoRes.json();
                        
                        // nominatim zapisuje roznie zaleznie od wielkosci miejscowosci
                        nazwaMiasta = geoData.address.city || geoData.address.town || geoData.address.village || "Moja lokalizacja";
                    } catch (error) {
                        console.log("Nie udało się pobrać nazwy miasta, zostawiamy domyślną.");
                    }

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
    
    //GENEROWANIE ULUBIONYCH LOKALIZACJI
    
    const favList = document.querySelector('.fav-list');
    const emptyMsg = document.getElementById('fav-empty');
    
    if (favList && emptyMsg) {
        favList.innerHTML = ''; 
        favList.appendChild(emptyMsg); 
        emptyMsg.classList.add('hidden'); 

        favouriteLocations.forEach((miejsce) => {
            const favItem = document.createElement('div');
            favItem.classList.add('fav-item');
            
            favItem.innerHTML = `
                <img src="${miejsce.icon}" class="fav-icon">
                <span class="fav-temp">${miejsce.temp}°</span>
                <span class="fav-city">${miejsce.city}</span>
                <button class="fav-remove"><i class="fa-solid fa-xmark"></i></button>
            `;
            
            favList.appendChild(favItem); 
        });
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
                btns.forEach(b => {
                    b.classList.remove('is-active');
                    b.setAttribute('aria-pressed', 'false');
                });
                
                e.target.classList.add('is-active');
                e.target.setAttribute('aria-pressed', 'true');

                //Sprawdzanie wybranej jednostki i przeliczenie danych z API
            });
        });
    });


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
                
                favItem.style.opacity = '0';
                favItem.style.transform = 'translateX(20px)';
                
                setTimeout(() => {
                    favItem.remove();
                    //Usuwanie miasta z tablicy w localStorage
                    if (favList.querySelectorAll('.fav-item').length === 0) {
                        document.getElementById('fav-empty').classList.remove('hidden');
                    }
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

    // Logika ukrywania deszczowych dni z checkboxa #hideRainToggle: dodawaj lub usuwaj klasę 'hidden' na zmianę dla #forecast-empty oraz #carousel-wrapper    
    //Zmiana tła w zależności od kodu pogody
    //Obsługa wyszukiwarki (fetch do API i renderowanie DOM)
    //Przyciski My Location i Random
});