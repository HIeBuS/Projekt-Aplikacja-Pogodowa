document.addEventListener('DOMContentLoaded', () => {
    const currentWeather = {
        city: "Warsaw, Poland",
        temp: 29,
        condition: "Partly Sunny With Heavy Rain",
        iconClass: "fa-cloud-sun", 
        details: {
            uv: "High",
            humidity: "55%",
            wind: "4 km/h",
            visibility: "9.66 km",
            aqi: 70 
        }
    };

    const weeklyForecast = [
        { dayName: "Mon", temp: 10, icon: "img/favicon.ico" },
        { dayName: "Tue", temp: 12, icon: "img/favicon.ico" },
        { dayName: "Wed", temp: 15, icon: "img/favicon.ico" },
        { dayName: "Thu", temp: 13, icon: "img/favicon.ico" },
        { dayName: "Fri", temp: 13, icon: "img/favicon.ico" },
        { dayName: "Sat", temp: 16, icon: "img/favicon.ico" },
        { dayName: "Sun", temp: 19, icon: "img/favicon.ico" }
    ];

    const favouriteLocations = [
        { city: "Kraków", temp: 18, icon: "img/favicon.ico" },
        { city: "Gdańsk", temp: 15, icon: "img/favicon.ico" },
        { city: "Wrocław", temp: 21, icon: "img/favicon.ico" }
    ];

    //WYPELNIANIE GLOWNEGO PANELU

    document.querySelector('.location').textContent = currentWeather.city;
    document.querySelector('.temperature').innerHTML = currentWeather.temp + "&deg;";
    document.querySelector('.condition').textContent = currentWeather.condition;

    const ikona = document.querySelector('.current-weather .weather-icon');
    if (ikona) ikona.className = "fa-solid " + currentWeather.iconClass + " weather-icon";

    const detale = document.querySelectorAll('.detail-value');
    if (detale.length >= 4) {
        detale[0].textContent = currentWeather.details.uv;
        detale[1].textContent = currentWeather.details.humidity;
        detale[2].textContent = currentWeather.details.wind;
        detale[3].textContent = currentWeather.details.visibility;
    }

    const pasekAQI = document.querySelector('.progress-fill');
    if (pasekAQI) pasekAQI.style.width = currentWeather.details.aqi + "%";

    //GENEROWANIE PROGNOZY TYGODNIOWEJ
    
    const track = document.querySelector('.carousel-track');
    if (track) {
        track.innerHTML = ''; 

        weeklyForecast.forEach((dzien) => {
            const karta = document.createElement('div');
            karta.classList.add('day-card');
            
            karta.innerHTML = `
                <span class="day-name">${dzien.dayName}</span>
                <img src="${dzien.icon}" class="day-icon">
                <span class="day-temp">${dzien.temp}°</span>
            `;
            
            track.appendChild(karta);
        });
    }

    //LICZENIE SREDNIEJ TEMPERATURY
    
    let sumaTemperatur = 0;
    weeklyForecast.forEach((dzien) => {
        sumaTemperatur = sumaTemperatur + dzien.temp;
    });
    
    let srednia = Math.round(sumaTemperatur / weeklyForecast.length);
    const avgElement = document.querySelector('.avg-temp');
    if (avgElement) {
        avgElement.textContent = "Weekly Average Temp: " + srednia + "°C";
    }
    
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