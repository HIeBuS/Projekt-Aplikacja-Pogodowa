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