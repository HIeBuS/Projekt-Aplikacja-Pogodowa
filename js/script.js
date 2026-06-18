let favouriteLocations = JSON.parse(localStorage.getItem('weatherFavs')) || [];
let obecnaJednostka = 'C';
let isRainHidden = false; 

let track, favList, emptyMsg, rainToggle, forecastEmpty;

document.addEventListener('DOMContentLoaded', () => {
    track = document.querySelector('.carousel-track');
    favList = document.querySelector('.fav-list');
    emptyMsg = document.getElementById('fav-empty');
    rainToggle = document.getElementById('hideRainToggle');
    forecastEmpty = document.getElementById('forecast-empty');

    if (document.querySelector('.location')) {
        zlokalizujMnie();
    }

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

    // wywolujemy funkcje od razu na starcie aplikacji zeby pokazac zapisane miasta
    renderujUlubione();

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

    // listener checkboxa teraz tylko wywoluje funkcje
    rainToggle?.addEventListener('change', () => {
        isRainHidden = rainToggle.checked;
        applyRainFilter();
    });
});

//Anonymous report toggle
const anonCheckbox = document.getElementById('anonymous-toggle');
const userFieldsRow = document.querySelector('.id-user-fields');
const nameInput = document.getElementById('user-name');
const emailInput = document.getElementById('user-email');

if (anonCheckbox && userFieldsRow) {
    anonCheckbox.addEventListener('change', () => {
        if (anonCheckbox.checked) {
            userFieldsRow.classList.add('hidden');
            if (nameInput) nameInput.value = '';
            if (emailInput) emailInput.value = '';
        } else {
            userFieldsRow.classList.remove('hidden');
        }
    });
}